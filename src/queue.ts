import type { WorkTrigger, Priority } from './types';

interface QueuedWork {
  trigger: WorkTrigger;
  queuedAt: number;
}

/**
 * Priority queue for work items
 */
export class WorkQueue {
  private queue: QueuedWork[];
  private priorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  constructor() {
    this.queue = [];
  }

  /**
   * Add work to the queue
   */
  enqueue(trigger: WorkTrigger): void {
    const work: QueuedWork = {
      trigger,
      queuedAt: Date.now(),
    };

    this.queue.push(work);
    this.sort();
    
    console.log(`Work queued: project=${trigger.projectId}, priority=${trigger.priority}, queue size=${this.queue.length}`);
  }

  /**
   * Get the next work item
   */
  dequeue(): WorkTrigger | undefined {
    const work = this.queue.shift();
    return work?.trigger;
  }

  /**
   * Peek at the next work item without removing it
   */
  peek(): WorkTrigger | undefined {
    return this.queue[0]?.trigger;
  }

  /**
   * Get the size of the queue
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get all items in the queue (for inspection)
   */
  getAll(): WorkTrigger[] {
    return this.queue.map(w => w.trigger);
  }

  /**
   * Sort queue by priority and time
   */
  private sort(): void {
    this.queue.sort((a, b) => {
      // First by priority
      const priorityDiff = this.priorityOrder[a.trigger.priority] - this.priorityOrder[b.trigger.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by queued time (FIFO within same priority)
      return a.queuedAt - b.queuedAt;
    });
  }

  /**
   * Remove specific work items by project ID
   */
  removeByProject(projectId: string): number {
    const initialSize = this.queue.length;
    this.queue = this.queue.filter(w => w.trigger.projectId !== projectId);
    return initialSize - this.queue.length;
  }
}
