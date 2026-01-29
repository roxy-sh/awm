import { StateManager } from './state';
import { EventManager } from './events';
import { WorkQueue } from './queue';
import type { AWMConfig, WorkSession, WorkTrigger } from './types';

/**
 * Main orchestrator for autonomous work
 */
export class WorkOrchestrator {
  private config: AWMConfig;
  private state: StateManager;
  private events: EventManager;
  private queue: WorkQueue;
  private running: boolean;
  private processingInterval?: NodeJS.Timeout;

  constructor(config: AWMConfig, state: StateManager, events: EventManager) {
    this.config = config;
    this.state = state;
    this.events = events;
    this.queue = new WorkQueue();
    this.running = false;

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
  private async spawnClawdbotSession(project: any, session: WorkSession): Promise<void> {
    // Build context message for the AI
    const contextMessage = this.buildWorkContext(project);

    console.log(`Spawning Clawdbot session for project: ${project.name}`);
    console.log(`Context: ${contextMessage.substring(0, 200)}...`);

    // TODO: Integrate with actual Clawdbot sessions_spawn
    // For now, just simulate and mark as completed
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark session as completed
    const duration = Date.now() - (session.startedAt || Date.now());
    this.state.updateSession(session.id, {
      status: 'completed',
      completedAt: Date.now(),
      duration,
      summary: 'Simulated work session completed',
      outcome: 'Successfully worked on the project',
    });

    // Update project hours
    const hoursSpent = duration / (1000 * 60 * 60);
    this.state.updateProject(project.id, {
      hoursSpent: project.hoursSpent + hoursSpent,
    });

    this.state.markSessionInactive(session.id);
    await this.state.save();

    console.log(`Work session completed for project: ${project.name}`);
  }

  /**
   * Build context message for AI work session
   */
  private buildWorkContext(project: any): string {
    return `
# Autonomous Work Session

## Project: ${project.name}
${project.description}

## Goals
${project.goals.map((g: string) => `- ${g}`).join('\n')}

## Context
${project.context}

## Next Steps
${project.nextSteps.map((s: string) => `- ${s}`).join('\n')}

## Instructions
Work autonomously on this project. Make progress on the next steps, update files, run tests, commit changes, and document your work. When done, provide a summary of what was accomplished.
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
