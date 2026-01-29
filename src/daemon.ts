#!/usr/bin/env tsx

/**
 * AWM daemon with native Clawdbot tool integration
 * This version uses the sessions_spawn tool directly
 */

import { AWM, ClawdbotIntegration } from './index';

// This will be injected by the parent Clawdbot process
// For now, it's a placeholder that would error if called
const clawdbotIntegration = new ClawdbotIntegration(
  async (params) => {
    // This would be replaced by actual tool call in parent process
    throw new Error('sessions_spawn tool not available in standalone mode. Run from within Clawdbot.');
  },
  async (sessionKey, limit) => {
    // This would be replaced by actual tool call in parent process
    throw new Error('sessions_history tool not available in standalone mode. Run from within Clawdbot.');
  }
);

async function main() {
  const awm = new AWM({
    dataDir: process.env.AWM_DATA_DIR || `${process.env.HOME}/.awm`,
    logLevel: 'info',
  }, clawdbotIntegration);

  await awm.initialize();
  await awm.start();

  console.log('\nAWM daemon running with Clawdbot integration...\n');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await awm.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await awm.stop();
    process.exit(0);
  });

  // Status updates
  setInterval(() => {
    const status = awm.getStatus();
    console.log(`[${new Date().toISOString()}] Status:`, JSON.stringify(status.orchestrator, null, 2));
  }, 60000); // Every minute
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
