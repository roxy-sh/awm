#!/usr/bin/env tsx

/**
 * Roxy's AWM Integration - Helper functions for AI-driven work orchestration
 * 
 * These functions allow me (Roxy) to:
 * - Check my mental todos
 * - Trigger work non-blockingly
 * - Process notifications
 * - Stay responsive while work happens
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const AWM_DIR = path.join(process.env.HOME!, '.awm');
const QUEUE_FILE = path.join(AWM_DIR, 'work-queue.json');
const NOTIF_FILE = path.join(AWM_DIR, 'notifications.jsonl');

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  goals: string[];
  context: string;
  nextSteps: string[];
  lastWorkedAt?: number;
  hoursSpent: number;
}

/**
 * Get all active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  const projectsFile = path.join(AWM_DIR, 'projects.json');
  const data = await fs.readFile(projectsFile, 'utf-8');
  const projects: Project[] = JSON.parse(data);
  return projects.filter(p => p.status === 'active');
}

/**
 * Queue work for a project (non-blocking)
 */
export async function queueWork(
  projectId: string,
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  notifyHere: boolean = false
): Promise<void> {
  const queueData = await fs.readFile(QUEUE_FILE, 'utf-8').catch(() => '[]');
  const queue = JSON.parse(queueData);

  queue.push({
    projectId,
    priority,
    triggeredBy: 'ai-decision',
    triggeredAt: Date.now(),
    notifyChannel: notifyHere ? 'current-chat' : undefined,
  });

  await fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Process pending Discord notifications
 * Returns notifications that need to be sent
 */
export async function getPendingNotifications(): Promise<Array<{
  channel: string;
  message: string;
  timestamp: number;
}>> {
  const data = await fs.readFile(NOTIF_FILE, 'utf-8').catch(() => '');
  
  if (!data.trim()) return [];

  const lines = data.trim().split('\n');
  const notifications = lines.map(line => JSON.parse(line));

  // Clear file after reading
  await fs.writeFile(NOTIF_FILE, '');

  return notifications;
}

/**
 * Check daemon status
 */
export async function isDaemonRunning(): Promise<boolean> {
  const pidFile = path.join(AWM_DIR, 'daemon.pid');
  
  try {
    const pid = await fs.readFile(pidFile, 'utf-8');
    const { stdout } = await execAsync(`ps -p ${pid.trim()} -o comm=`);
    return stdout.includes('tsx') || stdout.includes('node');
  } catch {
    return false;
  }
}

/**
 * Get daemon PID
 */
export async function getDaemonPid(): Promise<number | null> {
  const pidFile = path.join(AWM_DIR, 'daemon.pid');
  
  try {
    const pid = await fs.readFile(pidFile, 'utf-8');
    return parseInt(pid.trim(), 10);
  } catch {
    return null;
  }
}

/**
 * My mental todo checker - decides what work is ready
 * This is where I use my judgment to trigger autonomous work
 */
export async function checkTodos(): Promise<{
  shouldWork: Project[];
  reasons: string[];
}> {
  const projects = await getActiveProjects();
  const shouldWork: Project[] = [];
  const reasons: string[] = [];

  for (const project of projects) {
    // Logic: Work on projects that haven't been touched recently
    const hoursSinceWork = project.lastWorkedAt
      ? (Date.now() - project.lastWorkedAt) / (1000 * 60 * 60)
      : Infinity;

    // Work if:
    // - Never worked on, OR
    // - Haven't worked in 24+ hours, OR
    // - Has specific next steps ready
    
    if (hoursSinceWork === Infinity) {
      shouldWork.push(project);
      reasons.push(`${project.name}: Never worked on, ready to start`);
    } else if (hoursSinceWork >= 24) {
      shouldWork.push(project);
      reasons.push(`${project.name}: Last worked ${hoursSinceWork.toFixed(1)}h ago`);
    } else if (project.nextSteps.length > 0 && hoursSinceWork >= 12) {
      shouldWork.push(project);
      reasons.push(`${project.name}: Has clear next steps, been 12+ hours`);
    }
  }

  return { shouldWork, reasons };
}

/**
 * Trigger work based on my AI judgment
 */
export async function triggerReadyWork(): Promise<{
  queued: number;
  projects: string[];
}> {
  const { shouldWork, reasons } = await checkTodos();

  for (const project of shouldWork) {
    await queueWork(project.id, 'medium');
  }

  return {
    queued: shouldWork.length,
    projects: shouldWork.map(p => p.name),
  };
}
