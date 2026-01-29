#!/usr/bin/env tsx

/**
 * AWM Real Integration Test
 * Run from a Clawdbot session with tool access
 */

import { AWM, ClawdbotIntegration, DiscordIntegration } from './src/index';

// Get Discord channel from environment
const DISCORD_CHANNEL = process.env.AWM_DISCORD_CHANNEL || '1466290854399766618';

console.log('🧪 AWM Real Integration Test');
console.log(`Discord: ${DISCORD_CHANNEL}\n`);

// We can't directly call tools from TypeScript, so this test will:
// 1. Set up AWM with callback placeholders
// 2. Manually trigger one work session
// 3. You (the AI) will handle the actual tool calls

async function test() {
  let sessionSpawnCallback: any;
  let discordCallback: any;

  const clawdbot = new ClawdbotIntegration(
    async (params) => {
      console.log('\n📤 SESSION_SPAWN_REQUESTED');
      console.log(JSON.stringify(params, null, 2));
      
      // Signal the parent that spawn is needed
      if (sessionSpawnCallback) {
        return await sessionSpawnCallback(params);
      }
      
      throw new Error('No spawn callback registered');
    },
    async (sessionKey, limit) => {
      console.log('\n📥 SESSION_HISTORY_REQUESTED');
      console.log(JSON.stringify({ sessionKey, limit }, null, 2));
      
      // For now, return empty - polling will continue
      return [];
    }
  );

  const discord = new DiscordIntegration(
    { channelId: DISCORD_CHANNEL, enabled: true },
    async (message) => {
      console.log('\n📢 DISCORD_MESSAGE_REQUESTED');
      console.log(message);
      
      if (discordCallback) {
        await discordCallback(message);
      }
    }
  );

  const awm = new AWM({
    dataDir: `${process.env.HOME}/.awm`,
    maxConcurrentSessions: 1,
    defaultSessionDuration: 2 * 60 * 1000, // 2 minutes
  }, clawdbot, discord);

  await awm.initialize();

  const projects = awm.getState().getAllProjects();
  if (projects.length === 0) {
    console.error('No projects. Create one first.');
    process.exit(1);
  }

  console.log(`\nProject: ${projects[0].name}\n`);

  // Export callbacks for external handling
  console.log('READY_FOR_CALLBACKS');
  console.log('The parent process should now:');
  console.log('1. Watch for SESSION_SPAWN_REQUESTED');
  console.log('2. Call sessions_spawn with the params');
  console.log('3. Return the result via callback\n');

  // For this test, just demonstrate the flow
  console.log('Test complete - integration points identified');
  console.log('\nNext step: Wrap this in a script that the AI can execute with tool access');
}

test().catch(console.error);
