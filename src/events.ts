import EventEmitter from 'events';
import { CronJob } from 'cron';
import type { FSWatcher } from 'chokidar';
import chokidar from 'chokidar';
import type { WorkEvent, Priority, WorkTrigger } from './types';

/**
 * Manages various event sources and emits work triggers
 */
export class EventManager extends EventEmitter {
  private cronJobs: Map<string, CronJob>;
  private fileWatchers: Map<string, FSWatcher>;
  private enabled: boolean;

  constructor() {
    super();
    this.cronJobs = new Map();
    this.fileWatchers = new Map();
    this.enabled = false;
  }

  /**
   * Start monitoring all events
   */
  start(): void {
    this.enabled = true;
    this.cronJobs.forEach(job => job.start());
    console.log('EventManager started');
  }

  /**
   * Stop monitoring all events
   */
  stop(): void {
    this.enabled = false;
    this.cronJobs.forEach(job => job.stop());
    this.fileWatchers.forEach(watcher => watcher.close());
    console.log('EventManager stopped');
  }

  /**
   * Register a time-based event
   */
  registerTimeEvent(event: WorkEvent): void {
    if (event.type !== 'time') {
      throw new Error('Event must be of type "time"');
    }

    // Remove existing job if any
    this.unregisterEvent(event.id);

    try {
      const job = new CronJob(
        event.trigger,
        () => this.triggerEvent(event),
        null,
        this.enabled && event.enabled,
        'UTC'
      );

      this.cronJobs.set(event.id, job);
      console.log(`Registered time event: ${event.id} with schedule ${event.trigger}`);
    } catch (error) {
      console.error(`Failed to register time event ${event.id}:`, error);
      throw error;
    }
  }

  /**
   * Register a file watch event
   */
  registerFileEvent(event: WorkEvent): void {
    if (event.type !== 'file') {
      throw new Error('Event must be of type "file"');
    }

    // Remove existing watcher if any
    this.unregisterEvent(event.id);

    try {
      const watcher = chokidar.watch(event.trigger, {
        persistent: true,
        ignoreInitial: true,
      });

      watcher.on('all', (eventType, path) => {
        console.log(`File event detected: ${eventType} on ${path}`);
        if (event.enabled && this.enabled) {
          this.triggerEvent(event);
        }
      });

      this.fileWatchers.set(event.id, watcher);
      console.log(`Registered file event: ${event.id} watching ${event.trigger}`);
    } catch (error) {
      console.error(`Failed to register file event ${event.id}:`, error);
      throw error;
    }
  }

  /**
   * Manually trigger an event
   */
  triggerEvent(event: WorkEvent): void {
    if (!event.enabled) {
      console.log(`Event ${event.id} is disabled, skipping trigger`);
      return;
    }

    const trigger: WorkTrigger = {
      eventId: event.id,
      projectId: event.projectId,
      priority: event.priority,
      triggeredAt: Date.now(),
    };

    console.log(`Event triggered: ${event.id} for project ${event.projectId}`);
    this.emit('trigger', trigger);
  }

  /**
   * Unregister an event
   */
  unregisterEvent(eventId: string): void {
    const cronJob = this.cronJobs.get(eventId);
    if (cronJob) {
      cronJob.stop();
      this.cronJobs.delete(eventId);
    }

    const watcher = this.fileWatchers.get(eventId);
    if (watcher) {
      watcher.close();
      this.fileWatchers.delete(eventId);
    }
  }

  /**
   * Update an event registration
   */
  updateEvent(event: WorkEvent): void {
    this.unregisterEvent(event.id);
    
    if (event.type === 'time') {
      this.registerTimeEvent(event);
    } else if (event.type === 'file') {
      this.registerFileEvent(event);
    }
  }

  /**
   * Get status of all registered events
   */
  getStatus(): {
    enabled: boolean;
    cronJobs: number;
    fileWatchers: number;
  } {
    return {
      enabled: this.enabled,
      cronJobs: this.cronJobs.size,
      fileWatchers: this.fileWatchers.size,
    };
  }
}
