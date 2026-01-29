/**
 * Callback-based Clawdbot integration
 * Instead of HTTP/CLI, we provide a callback that the orchestrator will use
 */

export interface ClawdbotSpawnCallback {
  (params: {
    task: string;
    label?: string;
    model?: string;
    cleanup?: 'delete' | 'keep';
    runTimeoutSeconds?: number;
  }): Promise<{
    sessionKey: string;
    status: string;
  }>;
}

export interface ClawdbotHistoryCallback {
  (sessionKey: string, limit?: number): Promise<any[]>;
}

/**
 * Clawdbot integration via callbacks
 * This allows the parent process to inject tool-based implementations
 */
export class ClawdbotIntegration {
  constructor(
    private spawnFn?: ClawdbotSpawnCallback,
    private historyFn?: ClawdbotHistoryCallback
  ) {}

  async spawnSession(params: {
    task: string;
    label?: string;
    model?: string;
    cleanup?: 'delete' | 'keep';
    runTimeoutSeconds?: number;
  }): Promise<{
    sessionKey: string;
    status: string;
  }> {
    if (!this.spawnFn) {
      throw new Error('Clawdbot spawn callback not configured');
    }
    
    return await this.spawnFn(params);
  }

  async getSessionHistory(sessionKey: string, limit?: number): Promise<any[]> {
    if (!this.historyFn) {
      throw new Error('Clawdbot history callback not configured');
    }
    
    return await this.historyFn(sessionKey, limit);
  }

  isConfigured(): boolean {
    return !!this.spawnFn && !!this.historyFn;
  }
}
