import { StateManager } from './state';
import { EventManager } from './events';
import { WorkOrchestrator } from './orchestrator';
import { ClawdbotIntegration } from './clawdbot';
import type { AWMConfig } from './types';
/**
 * Main AWM class - entry point for the system
 */
export declare class AWM {
    private config;
    private state;
    private events;
    private orchestrator;
    private initialized;
    constructor(config?: Partial<AWMConfig>, clawdbot?: ClawdbotIntegration);
    /**
     * Initialize the AWM system
     */
    initialize(): Promise<void>;
    /**
     * Start the AWM system
     */
    start(): Promise<void>;
    /**
     * Stop the AWM system
     */
    stop(): Promise<void>;
    /**
     * Get state manager for direct access
     */
    getState(): StateManager;
    /**
     * Get event manager for direct access
     */
    getEvents(): EventManager;
    /**
     * Get orchestrator for status
     */
    getOrchestrator(): WorkOrchestrator;
    /**
     * Get current system status
     */
    getStatus(): {
        initialized: boolean;
        config: AWMConfig;
        orchestrator: {
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
        projects: number;
        events: number;
    };
}
export * from './types';
export * from './state';
export * from './events';
export * from './orchestrator';
export * from './queue';
export * from './clawdbot';
export * from './config';
//# sourceMappingURL=index.d.ts.map