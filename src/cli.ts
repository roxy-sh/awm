#!/usr/bin/env node

import { AWM } from './index';

/**
 * CLI entry point for AWM daemon
 */
async function main() {
  const command = process.argv[2];

  const awm = new AWM({
    dataDir: process.env.AWM_DATA_DIR || `${process.env.HOME}/.awm`,
    logLevel: 'info',
  });

  switch (command) {
    case 'start':
      await awm.initialize();
      await awm.start();
      
      console.log('\nAWM is now running. Press Ctrl+C to stop.\n');
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('\nShutting down...');
        await awm.stop();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        console.log('\nShutting down...');
        await awm.stop();
        process.exit(0);
      });

      // Print status every 30 seconds
      setInterval(() => {
        const status = awm.getStatus();
        console.log(`\nStatus: ${JSON.stringify(status.orchestrator, null, 2)}`);
      }, 30000);

      break;

    case 'status':
      await awm.initialize();
      const status = awm.getStatus();
      console.log(JSON.stringify(status, null, 2));
      process.exit(0);
      break;

    case 'create-project':
      await awm.initialize();
      const state = awm.getState();
      
      const project = state.createProject({
        name: process.argv[3] || 'Unnamed Project',
        description: process.argv[4] || 'No description',
        status: 'active',
        goals: ['Initial goal'],
        context: 'New project context',
        nextSteps: ['Define next steps'],
      });

      await state.save();
      console.log('Project created:', project);
      process.exit(0);
      break;

    case 'list-projects':
      await awm.initialize();
      const projects = awm.getState().getAllProjects();
      console.log(`\nProjects (${projects.length}):\n`);
      projects.forEach(p => {
        console.log(`  ${p.id} - ${p.name} [${p.status}]`);
        console.log(`    ${p.description}`);
        console.log(`    Hours: ${p.hoursSpent.toFixed(2)}\n`);
      });
      process.exit(0);
      break;

    case 'create-event':
      await awm.initialize();
      const eventState = awm.getState();
      
      const projectId = process.argv[3];
      const trigger = process.argv[4]; // cron expression
      
      if (!projectId || !trigger) {
        console.error('Usage: awm create-event <projectId> <cronExpression>');
        process.exit(1);
      }

      const event = eventState.createEvent({
        type: 'time',
        projectId,
        priority: 'medium',
        trigger,
        enabled: true,
      });

      await eventState.save();
      console.log('Event created:', event);
      process.exit(0);
      break;

    case 'help':
    default:
      console.log(`
AWM - Autonomous Work Manager

Usage:
  awm start                                    Start the AWM daemon
  awm status                                   Show current status
  awm create-project <name> <description>      Create a new project
  awm list-projects                            List all projects
  awm create-event <projectId> <cronExpr>      Create a time-based event
  awm help                                     Show this help

Examples:
  awm start
  awm create-project "My Project" "Work on something cool"
  awm create-event abc123 "0 2 * * *"  # Run at 2 AM daily
      `);
      process.exit(command === 'help' ? 0 : 1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
