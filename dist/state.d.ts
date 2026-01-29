import type { Project, WorkSession, WorkEvent } from './types';
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
export declare class StateManager {
    private dataDir;
    private state;
    constructor(dataDir: string);
    initialize(): Promise<void>;
    private getProjectsPath;
    private getSessionsPath;
    private getEventsPath;
    /**
     * Load state from disk
     *
     * Reads JSON files and populates in-memory Maps.
     * Handles missing files gracefully (ENOENT = file not found).
     * Other errors (permissions, corrupt JSON) are thrown.
     */
    load(): Promise<void>;
    /**
     * Save state to disk
     *
     * Converts in-memory Maps to JSON arrays and writes atomically.
     * All three files are written in parallel for performance.
     */
    save(): Promise<void>;
    createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'hoursSpent'>): Project;
    getProject(id: string): Project | undefined;
    getAllProjects(): Project[];
    updateProject(id: string, updates: Partial<Project>): Project | undefined;
    deleteProject(id: string): boolean;
    createSession(session: Omit<WorkSession, 'id'>): WorkSession;
    getSession(id: string): WorkSession | undefined;
    getSessionsForProject(projectId: string): WorkSession[];
    updateSession(id: string, updates: Partial<WorkSession>): WorkSession | undefined;
    createEvent(event: Omit<WorkEvent, 'id'>): WorkEvent;
    getEvent(id: string): WorkEvent | undefined;
    getAllEvents(): WorkEvent[];
    getEventsForProject(projectId: string): WorkEvent[];
    updateEvent(id: string, updates: Partial<WorkEvent>): WorkEvent | undefined;
    deleteEvent(id: string): boolean;
    markSessionActive(sessionId: string): void;
    markSessionInactive(sessionId: string): void;
    getActiveSessions(): WorkSession[];
    getActiveSessionCount(): number;
}
//# sourceMappingURL=state.d.ts.map