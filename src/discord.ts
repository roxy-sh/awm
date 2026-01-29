/**
 * Discord notification integration for AWM
 */

export interface DiscordNotificationConfig {
  channelId: string;
  enabled: boolean;
}

export interface DiscordNotifyCallback {
  (message: string): Promise<void>;
}

/**
 * Discord integration via callback
 * Parent process injects the message sending implementation
 */
export class DiscordIntegration {
  constructor(
    private config: DiscordNotificationConfig,
    private sendFn?: DiscordNotifyCallback
  ) {}

  async notifyWorkComplete(data: {
    projectName: string;
    projectId: string;
    sessionId: string;
    clawdbotSessionKey?: string;
    status: 'completed' | 'failed';
    duration: number;
    summary?: string;
    outcome?: string;
    error?: string;
    repository?: string | null;
  }): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    if (!this.sendFn) {
      console.warn('Discord notification callback not configured');
      return;
    }

    const emoji = data.status === 'completed' ? '✅' : '❌';
    const durationMin = (data.duration / 60000).toFixed(1);
    
    let message = `${emoji} **AWM Work Session ${data.status === 'completed' ? 'Complete' : 'Failed'}**\n\n`;
    message += `**Project:** ${data.projectName}\n`;
    message += `**Duration:** ${durationMin} minutes\n`;
    
    if (data.clawdbotSessionKey) {
      message += `**Session:** \`${data.clawdbotSessionKey}\`\n`;
    }
    
    if (data.status === 'completed') {
      if (data.summary) {
        message += `\n**Summary:**\n${data.summary}\n`;
      }
      if (data.outcome) {
        message += `\n**Outcome:**\n${data.outcome.substring(0, 800)}${data.outcome.length > 800 ? '...' : ''}\n`;
      }
    } else if (data.error) {
      message += `\n**Error:** ${data.error}\n`;
    }

    if (data.repository) {
      message += `\n**Repository:** ${data.repository}`;
    }

    try {
      await this.sendFn(message);
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  isConfigured(): boolean {
    return this.config.enabled && !!this.sendFn;
  }
}
