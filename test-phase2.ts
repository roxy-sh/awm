#!/usr/bin/env tsx

/**
 * Test AWM Phase 2 - Manual Clawdbot integration test
 * 
 * This script simulates what AWM would do, but using inline code
 * so we can test the full flow with real Clawdbot tools
 */

import { AWM, ClawdbotIntegration } from './src/index';

console.log('🧪 AWM Phase 2 Integration Test\n');

// Create integration with inline implementations
// (In production, these would be injected by the parent Clawdbot process)
const clawdbotIntegration = new ClawdbotIntegration(
  async (params) => {
    console.log(`\n📤 Spawning Clawdbot session:`);
    console.log(`   Label: ${params.label}`);
    console.log(`   Task: ${params.task.substring(0, 100)}...`);
    
    // In the parent Clawdbot process, this would call sessions_spawn tool
    // For this test, we'll simulate
    const mockSessionKey = `test-session-${Date.now()}`;
    
    console.log(`✅ Session spawned: ${mockSessionKey}\n`);
    
    return {
      sessionKey: mockSessionKey,
      status: 'spawned',
    };
  },
  async (sessionKey, limit) => {
    console.log(`\n📥 Fetching history for ${sessionKey}`);
    
    // Mock some session history
    return [
      {
        role: 'assistant',
        content: 'I completed the autonomous work session. Here\'s what I did:\n\n1. ✅ Reviewed project goals\n2. ✅ Made progress on next steps\n3. ✅ Documented findings\n\nRecommended: Continue with testing and validation.',
      },
    ];
  }
);

async function test() {
  const awm = new AWM({
    dataDir: `${process.env.HOME}/.awm`,
    maxConcurrentSessions: 1,
    defaultSessionDuration: 60 * 1000, // 1 minute for testing
    logLevel: 'info',
  }, clawdbotIntegration);

  console.log('Initializing AWM...');
  await awm.initialize();

  // Get the test project
  const projects = awm.getState().getAllProjects();
  console.log(`\nFound ${projects.length} project(s)`);
  
  if (projects.length === 0) {
    console.log('No projects found. Create one first with: awm create-project');
    process.exit(1);
  }

  const project = projects[0];
  console.log(`\nTesting with project: ${project.name}`);
  console.log(`Description: ${project.description}\n`);

  // Manual trigger
  console.log('🚀 Manually triggering work session...\n');
  
  await awm.start();
  
  // Trigger the project
  awm.getOrchestrator()['handleTrigger']({
    eventId: 'test',
    projectId: project.id,
    priority: 'high',
    triggeredAt: Date.now(),
  });

  // Wait for processing
  console.log('⏳ Waiting for work to process (15 seconds)...\n');
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Check status
  const status = awm.getStatus();
  console.log('\n📊 Final Status:');
  console.log(JSON.stringify(status, null, 2));

  // Check sessions
  const sessions = awm.getState().getSessionsForProject(project.id);
  console.log(`\n📝 Work Sessions (${sessions.length}):`);
  sessions.forEach(s => {
    console.log(`\n  Session ${s.id}:`);
    console.log(`    Status: ${s.status}`);
    console.log(`    Duration: ${s.duration ? (s.duration / 1000).toFixed(1) + 's' : 'N/A'}`);
    console.log(`    Clawdbot: ${s.clawdbotSessionKey || 'N/A'}`);
    if (s.summary) console.log(`    Summary: ${s.summary}`);
    if (s.outcome) console.log(`    Outcome: ${s.outcome.substring(0, 200)}`);
    if (s.error) console.log(`    Error: ${s.error}`);
  });

  console.log('\n✅ Test complete!');
  
  await awm.stop();
  process.exit(0);
}

test().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
