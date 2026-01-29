#!/usr/bin/env tsx

/**
 * AWM Notification Processor
 * 
 * Reads queued Discord notifications and sends them via message tool.
 * Call this periodically or on-demand to flush notifications.
 */

import fs from 'fs/promises';
import path from 'path';

const NOTIF_FILE = path.join(process.env.HOME!, '.awm', 'notifications.jsonl');

interface Notification {
  channel: string;
  message: string;
  timestamp: number;
}

async function processNotifications() {
  try {
    const data = await fs.readFile(NOTIF_FILE, 'utf-8').catch(() => '');
    
    if (!data.trim()) {
      console.log('No notifications to process');
      return [];
    }

    const lines = data.trim().split('\n');
    const notifications: Notification[] = lines.map(line => JSON.parse(line));

    console.log(`📢 Processing ${notifications.length} notification(s)\n`);

    // Clear the file
    await fs.writeFile(NOTIF_FILE, '');

    return notifications;

  } catch (error) {
    console.error('Failed to process notifications:', error);
    return [];
  }
}

// Export for programmatic use
export { processNotifications };

// CLI usage
if (require.main === module) {
  processNotifications().then(notifications => {
    if (notifications.length > 0) {
      console.log('Notifications:');
      notifications.forEach((n, i) => {
        console.log(`\n${i + 1}. Channel: ${n.channel}`);
        console.log(`   Time: ${new Date(n.timestamp).toISOString()}`);
        console.log(`   Message:\n${n.message}\n`);
      });
    }
  });
}
