#!/usr/bin/env tsx

/**
 * AWM Production Runner with Real Clawdbot & Discord Integration
 * 
 * This script runs AWM with real tool integrations.
 * It must be executed from within a Clawdbot session that has access to:
 * - sessions_spawn
 * - sessions_history  
 * - message (for Discord)
 */

import { AWM, ClawdbotIntegration, DiscordIntegration } from './src/index';
import { loadConfig } from './src/config';

// IMPORTANT: This channel ID should be configured
const DISCORD_CHANNEL_ID = process.env.AWM_DISCORD_CHANNEL || '1466290854399766618';

console.log('🤖 AWM Production Daemon\n');
console.log(`Discord Channel: ${DISCORD_CHANNEL_ID}\n`);

async function main() {
  // Load config
  const config = await loadConfig();
  
  // Setup Discord integration
  // Note: This would need to be replaced with actual message tool call
  // For now, it's a placeholder that demonstrates the structure
  const discordIntegration = new DiscordIntegration(
    {
      channelId: DISCORD_CHANNEL_ID,
      enabled: true,
    },
    async (message) => {
      console.log('\n📢 Would send to Discord:');
      console.log(message);
      
      // TODO: Replace with actual message tool call
      // await sendToDiscord(DISCORD_CHANNEL_ID, message);
    }
  );

  // Setup Clawdbot integration  
  // Note: Same as Discord - needs real tool calls
  const clawdbotIntegration = new ClawdbotIntegration(
    async (params) => {
      console.log(`\n📤 Would spawn session: ${params.label}`);
      
      // TODO: Replace with actual sessions_spawn tool call
      // const result = await sessions_spawn(params);
      // return result;
      
      throw new Error('sessions_spawn not available - run from Clawdbot parent process');
    },
    async (sessionKey, limit) => {
      console.log(`\n📥 Would fetch history: ${sessionKey}`);
      
      // TODO: Replace with actual sessions_history tool call
      // const history = await sessions_history(sessionKey, limit);
      // return history;
      
      throw new Error('sessions_history not available - run from Clawdbot parent process');
    }
  );

  // Create AWM instance
  const awm = new AWM({
    dataDir: process.env.AWM_DATA_DIR || `${process.env.HOME}/.awm`,
    maxConcurrentSessions: 2,
    defaultSessionDuration: 30 * 60 * 1000, // 30 minutes
    logLevel: 'info',
    ...config,
  }, clawdbotIntegration, discordIntegration);

  // Initialize and start
  await awm.initialize();
  await awm.start();

  console.log('✅ AWM daemon running\n');
  console.log('Press Ctrl+C to stop\n');

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

  // Status updates every 5 minutes
  setInterval(() => {
    const status = awm.getStatus();
    console.log(`[${new Date().toISOString()}]`, JSON.stringify(status.orchestrator, null, 2));
  }, 5 * 60 * 1000);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
