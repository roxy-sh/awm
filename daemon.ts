#!/usr/bin/env tsx

/**
 * AWM Background Daemon - Production Meta-Agent Orchestrator
 * 
 * Runs 24/7, accepts work triggers via queue file, spawns sessions,
 * sends notifications, stays non-blocking for main chat.
 */

import fs from 'fs/promises';
import path from 'path';
import { AWM, ClawdbotIntegration, DiscordIntegration } from './src/index';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const QUEUE_FILE = path.join(process.env.HOME!, '.awm', 'work-queue.json');
const PID_FILE = path.join(process.env.HOME!, '.awm', 'daemon.pid');
const DISCORD_CHANNEL = '1466124749800210656'; // #roxy-testing

interface WorkQueueItem {
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy: 'manual' | 'scheduled' | 'ai-decision';
  triggeredAt: number;
  notifyChannel?: string; // Override notification channel
}

console.log('🤖 AWM Meta-Agent Orchestrator starting...\n');

let awm: AWM;
let isShuttingDown = false;

/**
 * Integration: Clawdbot sessions_spawn via exec
 */
const clawdbotIntegration = new ClawdbotIntegration(
  async (params) => {
    console.log(`📤 Spawning session: ${params.label}`);
    
    // Call clawdbot CLI to spawn session
    // In production, this would use the sessions_spawn tool
    // For now, use exec to call via gateway
    
    try {
      const cmd = `clawdbot agent --message '${params.task.replace(/'/g, "\\'")}' --label ${params.label} --json`;
      const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
      
      const result = JSON.parse(stdout);
      
      return {
        sessionKey: result.sessionKey || `spawned-${Date.now()}`,
        status: 'spawned',
      };
    } catch (error) {
      console.error('Failed to spawn session:', error);
      throw error;
    }
  },
  async (sessionKey, limit) => {
    console.log(`📥 Fetching history: ${sessionKey}`);
    
    try {
      const cmd = `clawdbot sessions list --json`;
      const { stdout } = await execAsync(cmd);
      
      const sessions = JSON.parse(stdout);
      const session = sessions.find((s: any) => s.key === sessionKey);
      
      return session?.messages || [];
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return [];
    }
  }
);

/**
 * Integration: Discord notifications via message tool
 */
const discordIntegration = new DiscordIntegration(
  {
    channelId: DISCORD_CHANNEL,
    enabled: true,
  },
  async (message) => {
    console.log(`\n📢 Sending Discord notification to ${DISCORD_CHANNEL}`);
    
    // Write to notification queue for main process to handle
    const notifFile = path.join(process.env.HOME!, '.awm', 'notifications.jsonl');
    await fs.appendFile(notifFile, JSON.stringify({
      channel: DISCORD_CHANNEL,
      message,
      timestamp: Date.now(),
    }) + '\n');
    
    console.log('✅ Notification queued');
  }
);

/**
 * Initialize AWM daemon
 */
async function initializeDaemon() {
  console.log('Initializing AWM...');
  
  awm = new AWM({
    dataDir: path.join(process.env.HOME!, '.awm'),
    maxConcurrentSessions: 5, // Allow 3-5 concurrent
    defaultSessionDuration: 30 * 60 * 1000, // 30 minutes
    logLevel: 'info',
    discord: {
      channelId: DISCORD_CHANNEL,
      enabled: true,
    },
  }, clawdbotIntegration, discordIntegration);

  await awm.initialize();
  await awm.start();

  console.log('✅ AWM daemon initialized\n');
}

/**
 * Process work queue
 */
async function processQueue() {
  if (isShuttingDown) return;

  try {
    // Read queue file
    const queueData = await fs.readFile(QUEUE_FILE, 'utf-8').catch(() => '[]');
    const queue: WorkQueueItem[] = JSON.parse(queueData);

    if (queue.length === 0) return;

    console.log(`\n📋 Processing queue: ${queue.length} items`);

    // Process each item
    for (const item of queue) {
      const project = awm.getState().getProject(item.projectId);
      
      if (!project) {
        console.warn(`⚠️  Project not found: ${item.projectId}`);
        continue;
      }

      console.log(`🚀 Triggering work for: ${project.name}`);

      // Trigger via orchestrator
      awm.getOrchestrator()['handleTrigger']({
        eventId: 'queue',
        projectId: item.projectId,
        priority: item.priority,
        triggeredAt: item.triggeredAt,
      });
    }

    // Clear queue
    await fs.writeFile(QUEUE_FILE, '[]');
    console.log('✅ Queue processed\n');

  } catch (error) {
    console.error('Error processing queue:', error);
  }
}

/**
 * Self-monitoring and health check
 */
async function healthCheck() {
  if (isShuttingDown) return;

  const status = awm.getStatus();
  
  console.log(`[${new Date().toISOString()}] Health Check:`);
  console.log(`  Active sessions: ${status.orchestrator.activeSessions}/${status.orchestrator.maxConcurrent}`);
  console.log(`  Queue size: ${status.orchestrator.queueSize}`);
  console.log(`  Projects: ${status.projects}`);
  console.log(`  Running: ${status.orchestrator.running ? '✅' : '❌'}`);

  // Self-heal if needed
  if (!status.orchestrator.running) {
    console.warn('⚠️  Orchestrator stopped, restarting...');
    await awm.start();
  }
}

/**
 * Main daemon loop
 */
async function main() {
  // Write PID file
  await fs.writeFile(PID_FILE, process.pid.toString());
  console.log(`PID: ${process.pid} (${PID_FILE})\n`);

  // Initialize
  await initializeDaemon();

  // Queue processor - check every 5 seconds
  const queueInterval = setInterval(processQueue, 5000);

  // Health check - every minute
  const healthInterval = setInterval(healthCheck, 60000);

  // Initial health check
  await healthCheck();

  // Graceful shutdown
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\n🛑 Shutting down gracefully...');
    
    clearInterval(queueInterval);
    clearInterval(healthInterval);
    
    await awm.stop();
    await fs.unlink(PID_FILE).catch(() => {});
    
    console.log('✅ Daemon stopped\n');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('🎯 AWM daemon running. Press Ctrl+C to stop.\n');
  console.log('Queue file:', QUEUE_FILE);
  console.log('Notifications:', path.join(process.env.HOME!, '.awm', 'notifications.jsonl'));
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
