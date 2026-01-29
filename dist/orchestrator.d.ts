import { StateManager } from './state';
import { EventManager } from './events';
import { ClawdbotIntegration } from './clawdbot';
import { DiscordIntegration } from './discord';
import type { AWMConfig } from './types';
/**
 * Main orchestrator for autonomous work
 */
export declare class WorkOrchestrator {
    private config;
    private state;
    private events;
    private queue;
    private clawdbot?;
    private discord?;
    private running;
    private processingInterval?;
    constructor(config: AWMConfig, state: StateManager, events: EventManager, clawdbot?: ClawdbotIntegration, discord?: DiscordIntegration);
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
     *
     * This is the core integration point between AWM and Clawdbot.
     * It creates an isolated AI session with project context and
     * monitors it until completion.
     *
     * @param project - The project to work on
     * @param session - The work session record
     */
    private spawnClawdbotSession;
    /**
     * Wait for a Clawdbot session to complete and extract results
     *
     * This implements a polling strategy to detect when the spawned
     * AI session has finished working. It checks the session history
     * every 5 seconds until either:
     * - The session produces output (completion)
     * - The maximum wait time is exceeded (timeout)
     *
     * @param sessionId - AWM session ID
     * @param clawdbotSessionKey - Clawdbot session key to poll
     */
    private waitForSessionCompletion;
    /**
     * Build context message for AI work session
     */
    private buildWorkContext;
    /**
     * Send Discord notification for completed work
     */
    private notifyWorkComplete;
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