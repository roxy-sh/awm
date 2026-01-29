import path from 'path';
import { StateManager } from './state';
import { EventManager } from './events';
import { WorkOrchestrator } from './orchestrator';
import { ClawdbotIntegration } from './clawdbot';
import { DiscordIntegration } from './discord';
import type { AWMConfig } from './types';

/**
 * Main AWM class - entry point for the system
 */
export class AWM {
  private config: AWMConfig;
  private state: StateManager;
  private events: EventManager;
  private orchestrator: WorkOrchestrator;
  private initialized: boolean;

  constructor(config?: Partial<AWMConfig>, clawdbot?: ClawdbotIntegration, discord?: DiscordIntegration) {
    const defaultConfig: AWMConfig = {
      dataDir: path.join(process.env.HOME || '/tmp', '.awm'),
      maxConcurrentSessions: 2,
      defaultSessionDuration: 30 * 60 * 1000, // 30 minutes
      logLevel: 'info',
    };

    this.config = { ...defaultConfig, ...config };
    this.state = new StateManager(this.config.dataDir);
    this.events = new EventManager();
    this.orchestrator = new WorkOrchestrator(this.config, this.state, this.events, clawdbot, discord);
    this.initialized = false;
  }

  /**
   * Initialize the AWM system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('Initializing AWM...');
    await this.state.initialize();
    this.initialized = true;
    console.log(`AWM initialized with data directory: ${this.config.dataDir}`);
  }

  /**
   * Start the AWM system
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('Starting AWM...');
    await this.orchestrator.start();
    console.log('AWM started successfully');
  }

  /**
   * Stop the AWM system
   */
  async stop(): Promise<void> {
    console.log('Stopping AWM...');
    await this.orchestrator.stop();
    console.log('AWM stopped');
  }

  /**
   * Get state manager for direct access
   */
  getState(): StateManager {
    return this.state;
  }

  /**
   * Get event manager for direct access
   */
  getEvents(): EventManager {
    return this.events;
  }

  /**
   * Get orchestrator for status
   */
  getOrchestrator(): WorkOrchestrator {
    return this.orchestrator;
  }

  /**
   * Get current system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      config: this.config,
      orchestrator: this.orchestrator.getStatus(),
      projects: this.state.getAllProjects().length,
      events: this.state.getAllEvents().length,
    };
  }
}

export * from './types';
export * from './state';
export * from './events';
export * from './orchestrator';
export * from './queue';
export * from './clawdbot';
export * from './discord';
export * from './config';
