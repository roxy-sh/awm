#!/usr/bin/env tsx

/**
 * AWM Queue Helper - Non-blocking work trigger
 * 
 * Usage:
 *   awm-queue <projectId> [priority] [notifyChannel]
 * 
 * This adds work to the queue without blocking.
 * The daemon picks it up within 5 seconds.
 */

import fs from 'fs/promises';
import path from 'path';

const QUEUE_FILE = path.join(process.env.HOME!, '.awm', 'work-queue.json');

interface WorkQueueItem {
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggeredBy: 'manual' | 'scheduled' | 'ai-decision';
  triggeredAt: number;
  notifyChannel?: string;
}

async function queueWork(
  projectId: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  triggeredBy: 'manual' | 'scheduled' | 'ai-decision' = 'ai-decision',
  notifyChannel?: string
) {
  // Read existing queue
  const queueData = await fs.readFile(QUEUE_FILE, 'utf-8').catch(() => '[]');
  const queue: WorkQueueItem[] = JSON.parse(queueData);

  // Add new item
  queue.push({
    projectId,
    priority,
    triggeredBy,
    triggeredAt: Date.now(),
    notifyChannel,
  });

  // Write back
  await fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2));

  console.log(`✅ Work queued: ${projectId} (priority: ${priority})`);
  console.log(`   Triggered by: ${triggeredBy}`);
  console.log(`   Queue size: ${queue.length}`);
  console.log('\n   Daemon will pick this up within 5 seconds.');
}

// CLI usage
const projectId = process.argv[2];
const priority = (process.argv[3] || 'medium') as any;
const triggeredBy = (process.argv[4] || 'manual') as any;
const notifyChannel = process.argv[5];

if (!projectId) {
  console.error('Usage: awm-queue <projectId> [priority] [triggeredBy] [notifyChannel]');
  console.error('');
  console.error('Example:');
  console.error('  awm-queue abc123 high ai-decision');
  console.error('  awm-queue abc123 medium manual 1466290854399766618');
  process.exit(1);
}

queueWork(projectId, priority, triggeredBy, notifyChannel).catch(error => {
  console.error('Failed to queue work:', error);
  process.exit(1);
});

export { queueWork };
