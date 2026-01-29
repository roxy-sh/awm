import type { WorkTrigger } from './types';
/**
 * Priority queue for work items
 */
export declare class WorkQueue {
    private queue;
    private priorityOrder;
    constructor();
    /**
     * Add work to the queue
     */
    enqueue(trigger: WorkTrigger): void;
    /**
     * Get the next work item
     */
    dequeue(): WorkTrigger | undefined;
    /**
     * Peek at the next work item without removing it
     */
    peek(): WorkTrigger | undefined;
    /**
     * Get the size of the queue
     */
    size(): number;
    /**
     * Check if queue is empty
     */
    isEmpty(): boolean;
    /**
     * Clear the queue
     */
    clear(): void;
    /**
     * Get all items in the queue (for inspection)
     */
    getAll(): WorkTrigger[];
    /**
     * Sort queue by priority and time
     */
    private sort;
    /**
     * Remove specific work items by project ID
     */
    removeByProject(projectId: string): number;
}
//# sourceMappingURL=queue.d.ts.map