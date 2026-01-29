import { StateManager } from './state';
import { EventManager } from './events';
import { WorkQueue } from './queue';
import { ClawdbotIntegration } from './clawdbot';
import type { AWMConfig, WorkSession, WorkTrigger, Project } from './types';

/**
 * Main orchestrator for autonomous work
 */
export class WorkOrchestrator {
  private config: AWMConfig;
  private state: StateManager;
  private events: EventManager;
  private queue: WorkQueue;
  private clawdbot?: ClawdbotIntegration;
  private running: boolean;
  private processingInterval?: NodeJS.Timeout;

  constructor(config: AWMConfig, state: StateManager, events: EventManager, clawdbot?: ClawdbotIntegration) {
    this.config = config;
    this.state = state;
    this.events = events;
    this.queue = new WorkQueue();
    this.running = false;
    this.clawdbot = clawdbot;

    if (clawdbot?.isConfigured()) {
      console.log('Clawdbot integration configured');
    }

    // Listen to event triggers
    this.events.on('trigger', (trigger: WorkTrigger) => {
      this.handleTrigger(trigger);
    });
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    if (this.running) {
      console.log('Orchestrator already running');
      return;
    }

    this.running = true;
    this.events.start();

    // Register all existing events
    const events = this.state.getAllEvents();
    for (const event of events) {
      if (event.type === 'time') {
        this.events.registerTimeEvent(event);
      } else if (event.type === 'file') {
        this.events.registerFileEvent(event);
      }
    }

    // Start processing loop
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000); // Check every 5 seconds

    console.log('WorkOrchestrator started');
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    this.running = false;
    this.events.stop();

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    await this.state.save();
    console.log('WorkOrchestrator stopped');
  }

  /**
   * Handle an event trigger
   */
  private handleTrigger(trigger: WorkTrigger): void {
    console.log(`Handling trigger for project ${trigger.projectId}`);

    // Update event last triggered time
    const event = this.state.getEvent(trigger.eventId);
    if (event) {
      this.state.updateEvent(trigger.eventId, {
        lastTriggered: trigger.triggeredAt,
      });
    }

    // Add to queue
    this.queue.enqueue(trigger);

    // Try to process immediately
    this.processQueue();
  }

  /**
   * Process the work queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.isEmpty()) return;

    const activeCount = this.state.getActiveSessionCount();
    if (activeCount >= this.config.maxConcurrentSessions) {
      console.log(`Max concurrent sessions reached (${activeCount}/${this.config.maxConcurrentSessions}), waiting...`);
      return;
    }

    const trigger = this.queue.dequeue();
    if (!trigger) return;

    await this.startWorkSession(trigger);
  }

  /**
   * Start a work session for a project
   */
  private async startWorkSession(trigger: WorkTrigger): Promise<void> {
    const project = this.state.getProject(trigger.projectId);
    if (!project) {
      console.error(`Project not found: ${trigger.projectId}`);
      return;
    }

    if (project.status !== 'active') {
      console.log(`Project ${project.name} is not active, skipping`);
      return;
    }

    console.log(`Starting work session for project: ${project.name}`);

    // Create session record
    const session = this.state.createSession({
      projectId: project.id,
      status: 'running',
      startedAt: Date.now(),
    });

    this.state.markSessionActive(session.id);

    try {
      // Spawn Clawdbot session
      await this.spawnClawdbotSession(project, session);

      // Update project last worked time
      this.state.updateProject(project.id, {
        lastWorkedAt: Date.now(),
      });

      await this.state.save();
    } catch (error) {
      console.error(`Failed to start work session:`, error);
      this.state.updateSession(session.id, {
        status: 'failed',
        completedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.state.markSessionInactive(session.id);
      await this.state.save();
    }
  }

  /**
   * Spawn a Clawdbot session for autonomous work
   */
  private async spawnClawdbotSession(project: Project, session: WorkSession): Promise<void> {
    const contextMessage = this.buildWorkContext(project);

    console.log(`Spawning Clawdbot session for project: ${project.name}`);

    if (!this.clawdbot) {
      console.warn('Clawdbot client not configured, running in simulation mode');
      
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 2000));

      const duration = Date.now() - (session.startedAt || Date.now());
      this.state.updateSession(session.id, {
        status: 'completed',
        completedAt: Date.now(),
        duration,
        summary: 'Simulated work session (no Clawdbot client configured)',
        outcome: 'Simulation mode - configure clawdbotGatewayUrl and clawdbotAuthToken',
      });

      const hoursSpent = duration / (1000 * 60 * 60);
      this.state.updateProject(project.id, {
        hoursSpent: project.hoursSpent + hoursSpent,
      });

      this.state.markSessionInactive(session.id);
      await this.state.save();
      return;
    }

    try {
      // Spawn real Clawdbot session
      const result = await this.clawdbot.spawnSession({
        task: contextMessage,
        label: `awm-${project.id}`,
        cleanup: 'keep', // Keep session for review
        runTimeoutSeconds: Math.floor(this.config.defaultSessionDuration / 1000),
      });

      console.log(`Clawdbot session spawned: ${result.sessionKey}`);

      // Update session with Clawdbot session key
      this.state.updateSession(session.id, {
        clawdbotSessionKey: result.sessionKey,
      });

      await this.state.save();

      // Wait for session to complete (poll or wait for callback)
      await this.waitForSessionCompletion(session.id, result.sessionKey);

    } catch (error) {
      console.error('Failed to spawn Clawdbot session:', error);
      
      const duration = Date.now() - (session.startedAt || Date.now());
      this.state.updateSession(session.id, {
        status: 'failed',
        completedAt: Date.now(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      this.state.markSessionInactive(session.id);
      await this.state.save();
    }
  }

  /**
   * Wait for a Clawdbot session to complete and extract results
   */
  private async waitForSessionCompletion(sessionId: string, clawdbotSessionKey: string): Promise<void> {
    // Poll for completion (simple approach for now)
    const maxWaitTime = this.config.defaultSessionDuration + 60000; // +1 minute buffer
    const startTime = Date.now();
    const pollInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      try {
        if (!this.clawdbot) break;

        // Get session history to check if it's done
        const history = await this.clawdbot.getSessionHistory(clawdbotSessionKey, 10);
        
        if (history.length > 0) {
          // Session has completed (has messages)
          const lastMessage = history[history.length - 1];
          
          const duration = Date.now() - (this.state.getSession(sessionId)?.startedAt || Date.now());
          
          this.state.updateSession(sessionId, {
            status: 'completed',
            completedAt: Date.now(),
            duration,
            summary: 'Session completed - check history for details',
            outcome: lastMessage.content?.substring(0, 500) || 'No output',
          });

          // Update project hours
          const session = this.state.getSession(sessionId);
          const project = this.state.getProject(session!.projectId);
          if (project) {
            const hoursSpent = duration / (1000 * 60 * 60);
            this.state.updateProject(project.id, {
              hoursSpent: project.hoursSpent + hoursSpent,
            });
          }

          this.state.markSessionInactive(sessionId);
          await this.state.save();

          console.log(`Session ${clawdbotSessionKey} completed successfully`);
          return;
        }
      } catch (error) {
        console.error('Error polling session:', error);
      }
    }

    // Timeout
    console.warn(`Session ${clawdbotSessionKey} timed out`);
    const duration = Date.now() - (this.state.getSession(sessionId)?.startedAt || Date.now());
    
    this.state.updateSession(sessionId, {
      status: 'failed',
      completedAt: Date.now(),
      duration,
      error: 'Session timeout',
    });

    this.state.markSessionInactive(sessionId);
    await this.state.save();
  }

  /**
   * Build context message for AI work session
   */
  private buildWorkContext(project: Project): string {
    return `
# Autonomous Work Session

## Project: ${project.name}
${project.description}

## Goals
${project.goals.map(g => `- ${g}`).join('\n')}

## Context
${project.context}

## Next Steps
${project.nextSteps.map(s => `- ${s}`).join('\n')}

## Your Task
Work autonomously on this project. Make progress on the next steps, update files, run tests, commit changes, and document your work. 

When done, provide a concise summary of:
1. What you accomplished
2. Any blockers or issues
3. Recommended next steps

Work directory: ~/clawd/awm-workspace/${project.id}
`.trim();
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    return {
      running: this.running,
      queueSize: this.queue.size(),
      activeSessions: this.state.getActiveSessionCount(),
      maxConcurrent: this.config.maxConcurrentSessions,
      events: this.events.getStatus(),
    };
  }
}
