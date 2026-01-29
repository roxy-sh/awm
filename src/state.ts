import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import type { Project, WorkSession, WorkEvent, AWMState } from './types';

/**
 * Manages persistence of AWM state to disk
 * 
 * StateManager handles all CRUD operations for projects, sessions,
 * and events. It uses JSON files for simple, human-readable storage
 * and maintains in-memory state for fast access.
 * 
 * File structure:
 * - projects.json: All project definitions
 * - sessions.json: Work session history
 * - events.json: Scheduled event triggers
 */
export class StateManager {
  private dataDir: string;
  private state: AWMState;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.state = {
      projects: new Map(),
      sessions: new Map(),
      events: new Map(),
      activeSessionIds: new Set(),
    };
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await this.load();
  }

  private getProjectsPath(): string {
    return path.join(this.dataDir, 'projects.json');
  }

  private getSessionsPath(): string {
    return path.join(this.dataDir, 'sessions.json');
  }

  private getEventsPath(): string {
    return path.join(this.dataDir, 'events.json');
  }

  /**
   * Load state from disk
   * 
   * Reads JSON files and populates in-memory Maps.
   * Handles missing files gracefully (ENOENT = file not found).
   * Other errors (permissions, corrupt JSON) are thrown.
   */
  async load(): Promise<void> {
    try {
      // Load projects
      const projectsData = await fs.readFile(this.getProjectsPath(), 'utf-8');
      const projects = JSON.parse(projectsData) as Project[];
      this.state.projects = new Map(projects.map(p => [p.id, p]));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      // File doesn't exist yet - that's OK, start with empty state
    }

    try {
      // Load sessions
      const sessionsData = await fs.readFile(this.getSessionsPath(), 'utf-8');
      const sessions = JSON.parse(sessionsData) as WorkSession[];
      this.state.sessions = new Map(sessions.map(s => [s.id, s]));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }

    try {
      // Load events
      const eventsData = await fs.readFile(this.getEventsPath(), 'utf-8');
      const events = JSON.parse(eventsData) as WorkEvent[];
      this.state.events = new Map(events.map(e => [e.id, e]));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  /**
   * Save state to disk
   * 
   * Converts in-memory Maps to JSON arrays and writes atomically.
   * All three files are written in parallel for performance.
   */
  async save(): Promise<void> {
    const projects = Array.from(this.state.projects.values());
    const sessions = Array.from(this.state.sessions.values());
    const events = Array.from(this.state.events.values());

    await Promise.all([
      fs.writeFile(this.getProjectsPath(), JSON.stringify(projects, null, 2)),
      fs.writeFile(this.getSessionsPath(), JSON.stringify(sessions, null, 2)),
      fs.writeFile(this.getEventsPath(), JSON.stringify(events, null, 2)),
    ]);
  }

  // Project methods
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'hoursSpent'>): Project {
    const newProject: Project = {
      ...project,
      id: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hoursSpent: 0,
    };
    this.state.projects.set(newProject.id, newProject);
    return newProject;
  }

  getProject(id: string): Project | undefined {
    return this.state.projects.get(id);
  }

  getAllProjects(): Project[] {
    return Array.from(this.state.projects.values());
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.state.projects.get(id);
    if (!project) return undefined;

    const updated = {
      ...project,
      ...updates,
      updatedAt: Date.now(),
    };
    this.state.projects.set(id, updated);
    return updated;
  }

  deleteProject(id: string): boolean {
    return this.state.projects.delete(id);
  }

  // Session methods
  createSession(session: Omit<WorkSession, 'id'>): WorkSession {
    const newSession: WorkSession = {
      ...session,
      id: randomUUID(),
    };
    this.state.sessions.set(newSession.id, newSession);
    return newSession;
  }

  getSession(id: string): WorkSession | undefined {
    return this.state.sessions.get(id);
  }

  getSessionsForProject(projectId: string): WorkSession[] {
    return Array.from(this.state.sessions.values())
      .filter(s => s.projectId === projectId);
  }

  updateSession(id: string, updates: Partial<WorkSession>): WorkSession | undefined {
    const session = this.state.sessions.get(id);
    if (!session) return undefined;

    const updated = { ...session, ...updates };
    this.state.sessions.set(id, updated);
    return updated;
  }

  // Event methods
  createEvent(event: Omit<WorkEvent, 'id'>): WorkEvent {
    const newEvent: WorkEvent = {
      ...event,
      id: randomUUID(),
    };
    this.state.events.set(newEvent.id, newEvent);
    return newEvent;
  }

  getEvent(id: string): WorkEvent | undefined {
    return this.state.events.get(id);
  }

  getAllEvents(): WorkEvent[] {
    return Array.from(this.state.events.values());
  }

  getEventsForProject(projectId: string): WorkEvent[] {
    return Array.from(this.state.events.values())
      .filter(e => e.projectId === projectId);
  }

  updateEvent(id: string, updates: Partial<WorkEvent>): WorkEvent | undefined {
    const event = this.state.events.get(id);
    if (!event) return undefined;

    const updated = { ...event, ...updates };
    this.state.events.set(id, updated);
    return updated;
  }

  deleteEvent(id: string): boolean {
    return this.state.events.delete(id);
  }

  // Active sessions tracking
  markSessionActive(sessionId: string): void {
    this.state.activeSessionIds.add(sessionId);
  }

  markSessionInactive(sessionId: string): void {
    this.state.activeSessionIds.delete(sessionId);
  }

  getActiveSessions(): WorkSession[] {
    return Array.from(this.state.activeSessionIds)
      .map(id => this.state.sessions.get(id))
      .filter((s): s is WorkSession => s !== undefined);
  }

  getActiveSessionCount(): number {
    return this.state.activeSessionIds.size;
  }
}
