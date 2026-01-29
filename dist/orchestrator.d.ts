import { StateManager } from './state';
import { EventManager } from './events';
import type { AWMConfig } from './types';
/**
 * Main orchestrator for autonomous work
 */
export declare class WorkOrchestrator {
    private config;
    private state;
    private events;
    private queue;
    private running;
    private processingInterval?;
    constructor(config: AWMConfig, state: StateManager, events: EventManager);
    /**
     * Start the orchestrator
     */
    start(): Promise<void>;
    /**
     * Stop the orchestrator
     */
    stop(): Promise<void>;
    /**
     * Handle an event trigger
     */
    private handleTrigger;
    /**
     * Process the work queue
     */
    private processQueue;
    /**
     * Start a work session for a project
     */
    private startWorkSession;
    /**
     * Spawn a Clawdbot session for autonomous work
     */
    private spawnClawdbotSession;
    /**
     * Build context message for AI work session
     */
    private buildWorkContext;
    /**
     * Get orchestrator status
     */
    getStatus(): {
        running: boolean;
        queueSize: number;
        activeSessions: number;
        maxConcurrent: number;
        events: {
            enabled: boolean;
            cronJobs: number;
            fileWatchers: number;
        };
    };
}
//# sourceMappingURL=orchestrator.d.ts.map