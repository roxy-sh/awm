#!/usr/bin/env node

import { AWM } from './index';
import { loadConfig, saveConfig, getDefaultGatewayConfig } from './config';

/**
 * CLI entry point for AWM daemon
 */
async function main() {
  const command = process.argv[2];

  // Load config from file
  const fileConfig = await loadConfig();
  const envConfig = getDefaultGatewayConfig();
  
  const awm = new AWM({
    dataDir: process.env.AWM_DATA_DIR || `${process.env.HOME}/.awm`,
    logLevel: 'info',
    ...envConfig,
    ...fileConfig,
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
      const awmStatus = awm.getStatus();
      console.log(JSON.stringify(awmStatus, null, 2));
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

    case 'config':
      const configAction = process.argv[3];
      
      if (configAction === 'set') {
        const key = process.argv[4];
        const value = process.argv[5];
        
        if (!key || !value) {
          console.error('Usage: awm config set <key> <value>');
          process.exit(1);
        }

        const currentConfig = await loadConfig();
        (currentConfig as any)[key] = value;
        await saveConfig(currentConfig);
        console.log(`Configuration updated: ${key} = ${value}`);
        process.exit(0);
      } else if (configAction === 'show') {
        const config = await loadConfig();
        console.log(JSON.stringify(config, null, 2));
        process.exit(0);
      } else {
        console.error('Usage: awm config [set|show]');
        process.exit(1);
      }
      break;

    case 'trigger':
      await awm.initialize();
      const triggerProjectId = process.argv[3];
      
      if (!triggerProjectId) {
        console.error('Usage: awm trigger <projectId>');
        process.exit(1);
      }

      const triggerProject = awm.getState().getProject(triggerProjectId);
      if (!triggerProject) {
        console.error(`Project not found: ${triggerProjectId}`);
        process.exit(1);
      }

      console.log(`Manually triggering work for: ${triggerProject.name}`);
      
      // Create a manual trigger
      const manualTrigger = {
        eventId: 'manual',
        projectId: triggerProjectId,
        priority: 'high' as const,
        triggeredAt: Date.now(),
      };

      // Start orchestrator briefly to process this one trigger
      await awm.start();
      awm.getOrchestrator()['handleTrigger'](manualTrigger);
      
      // Wait a bit for it to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const triggerStatus = awm.getStatus();
      console.log('\nStatus:', JSON.stringify(triggerStatus.orchestrator, null, 2));
      
      console.log('\nWork triggered! Check status or sessions for progress.');
      console.log('The daemon will continue running. Press Ctrl+C to stop.\n');
      
      // Keep process alive to let work complete
      process.on('SIGINT', async () => {
        console.log('\nShutting down...');
        await awm.stop();
        process.exit(0);
      });
      
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
  awm config set <key> <value>                 Set configuration value
  awm config show                              Show current configuration
  awm help                                     Show this help

Configuration Keys:
  clawdbotGatewayUrl      Gateway URL (default: http://localhost:18789)
  clawdbotAuthToken       Gateway auth token
  maxConcurrentSessions   Max concurrent work sessions (default: 2)
  defaultSessionDuration  Session timeout in ms (default: 1800000)

Examples:
  awm start
  awm create-project "My Project" "Work on something cool"
  awm create-event abc123 "0 2 * * *"  # Run at 2 AM daily
  awm config set clawdbotGatewayUrl http://localhost:18789
  awm config set clawdbotAuthToken your-token-here
      `);
      process.exit(command === 'help' ? 0 : 1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
