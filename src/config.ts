import fs from 'fs/promises';
import path from 'path';
import type { AWMConfig } from './types';

/**
 * Load AWM configuration from file
 */
export async function loadConfig(configPath?: string): Promise<Partial<AWMConfig>> {
  const defaultPath = path.join(process.env.HOME || '/tmp', '.awm', 'config.json');
  const targetPath = configPath || defaultPath;

  try {
    const content = await fs.readFile(targetPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Config doesn't exist, return empty
      return {};
    }
    throw error;
  }
}

/**
 * Save AWM configuration to file
 */
export async function saveConfig(config: Partial<AWMConfig>, configPath?: string): Promise<void> {
  const defaultPath = path.join(process.env.HOME || '/tmp', '.awm', 'config.json');
  const targetPath = configPath || defaultPath;

  const dir = path.dirname(targetPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2));
}

/**
 * Get default Clawdbot gateway config from environment or local
 */
export function getDefaultGatewayConfig(): Pick<AWMConfig, 'clawdbotGatewayUrl' | 'clawdbotAuthToken'> | {} {
  // Try to read from Clawdbot config
  const gatewayUrl = process.env.CLAWDBOT_GATEWAY_URL || 'http://localhost:18789';
  const authToken = process.env.CLAWDBOT_AUTH_TOKEN;

  if (authToken) {
    return {
      clawdbotGatewayUrl: gatewayUrl,
      clawdbotAuthToken: authToken,
    };
  }

  return {};
}
