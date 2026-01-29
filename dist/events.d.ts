import EventEmitter from 'events';
import type { WorkEvent } from './types';
/**
 * Manages various event sources and emits work triggers
 */
export declare class EventManager extends EventEmitter {
    private cronJobs;
    private fileWatchers;
    private enabled;
    constructor();
    /**
     * Start monitoring all events
     */
    start(): void;
    /**
     * Stop monitoring all events
     */
    stop(): void;
    /**
     * Register a time-based event
     */
    registerTimeEvent(event: WorkEvent): void;
    /**
     * Register a file watch event
     */
    registerFileEvent(event: WorkEvent): void;
    /**
     * Manually trigger an event
     */
    triggerEvent(event: WorkEvent): void;
    /**
     * Unregister an event
     */
    unregisterEvent(eventId: string): void;
    /**
     * Update an event registration
     */
    updateEvent(event: WorkEvent): void;
    /**
     * Get status of all registered events
     */
    getStatus(): {
        enabled: boolean;
        cronJobs: number;
        fileWatchers: number;
    };
}
//# sourceMappingURL=events.d.ts.map