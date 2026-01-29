/**
 * Core types for the Autonomous Work Manager
 */

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';
export type WorkSessionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type EventType = 'time' | 'file' | 'webhook' | 'manual';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * A project that can be worked on autonomously
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  goals: string[];
  context: string; // Rich context for the AI
  nextSteps: string[];
  createdAt: number;
  updatedAt: number;
  lastWorkedAt?: number;
  estimatedHours?: number;
  hoursSpent: number;
  repository?: string | null; // GitHub repository URL
}

/**
 * A work session represents autonomous work time
 */
export interface WorkSession {
  id: string;
  projectId: string;
  status: WorkSessionStatus;
  startedAt?: number;
  completedAt?: number;
  duration?: number; // milliseconds
  clawdbotSessionKey?: string;
  summary?: string;
  outcome?: string;
  error?: string;
}

/**
 * An event that can trigger work
 */
export interface WorkEvent {
  id: string;
  type: EventType;
  projectId: string;
  priority: Priority;
  scheduledAt?: number;
  trigger: string; // cron expression, file path, etc.
  enabled: boolean;
  lastTriggered?: number;
}

/**
 * Configuration for the AWM system
 */
export interface AWMConfig {
  dataDir: string;
  maxConcurrentSessions: number;
  defaultSessionDuration: number; // milliseconds
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  clawdbotGatewayUrl?: string;
  clawdbotAuthToken?: string;
  discord?: {
    channelId: string;
    enabled: boolean;
  };
}

/**
 * State of the AWM system
 */
export interface AWMState {
  projects: Map<string, Project>;
  sessions: Map<string, WorkSession>;
  events: Map<string, WorkEvent>;
  activeSessionIds: Set<string>;
}

/**
 * A work trigger from an event
 */
export interface WorkTrigger {
  eventId: string;
  projectId: string;
  priority: Priority;
  triggeredAt: number;
}
