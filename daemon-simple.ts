#!/usr/bin/env tsx

/**
 * AWM Background Daemon - Simplified Production Version
 * 
 * This daemon:
 * 1. Monitors work queue file
 * 2. When work is queued, it signals the parent process
 * 3. Parent process (main Roxy session) handles actual spawning
 * 4. Daemon tracks state and coordinates
 */

import fs from 'fs/promises';
import path from 'path';
import { AWM } from './src/index';

const QUEUE_FILE = path.join(process.env.HOME!, '.awm', 'work-queue.json');
const PID_FILE = path.join(process.env.HOME!, '.awm', 'daemon.pid');
const SIGNAL_FILE = path.join(process.env.HOME!, '.awm', 'spawn-signal.json');

interface WorkQueueItem {
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy: 'manual' | 'scheduled' | 'ai-decision';
  triggeredAt: number;
  notifyChannel?: string;
}

interface SpawnSignal {
  projectId: string;
  priority: string;
  timestamp: number;
  processed: boolean;
}

console.log('🤖 AWM Simplified Daemon\n');

let awm: AWM;
let isShuttingDown = false;

async function initializeDaemon() {
  awm = new AWM({
    dataDir: path.join(process.env.HOME!, '.awm'),
    maxConcurrentSessions: 5,
    defaultSessionDuration: 30 * 60 * 1000,
    logLevel: 'info',
  });

  await awm.initialize();
  // Don't start orchestrator - parent will handle spawning
  
  console.log('✅ AWM daemon initialized (coordination mode)\n');
}

async function processQueue() {
  if (isShuttingDown) return;

  try {
    const queueData = await fs.readFile(QUEUE_FILE, 'utf-8').catch(() => '[]');
    const queue: WorkQueueItem[] = JSON.parse(queueData);

    if (queue.length === 0) return;

    console.log(`\n📋 Queue has ${queue.length} item(s)`);

    // Write signal for each item (parent will pick up)
    for (const item of queue) {
      const signal: SpawnSignal = {
        projectId: item.projectId,
        priority: item.priority,
        timestamp: item.triggeredAt,
        processed: false,
      };

      await fs.writeFile(SIGNAL_FILE, JSON.stringify(signal, null, 2));
      console.log(`📤 Signal written for project: ${item.projectId}`);
    }

    // Clear queue
    await fs.writeFile(QUEUE_FILE, '[]');

  } catch (error) {
    console.error('Error processing queue:', error);
  }
}

async function main() {
  await fs.writeFile(PID_FILE, process.pid.toString());
  console.log(`PID: ${process.pid}\n`);

  await initializeDaemon();

  // Check queue every 5 seconds
  const interval = setInterval(processQueue, 5000);

  // Shutdown handler
  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\n🛑 Shutting down...');
    clearInterval(interval);
    await fs.unlink(PID_FILE).catch(() => {});
    console.log('✅ Stopped\n');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('🎯 Daemon running (signal mode)\n');
  console.log('Queue:', QUEUE_FILE);
  console.log('Signal:', SIGNAL_FILE);
  console.log('\n' + '='.repeat(60) + '\n');
}

main().catch(error => {
  console.error('❌ Fatal:', error);
  process.exit(1);
});
