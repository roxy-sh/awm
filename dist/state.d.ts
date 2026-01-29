import type { Project, WorkSession, WorkEvent } from './types';
/**
 * Manages persistence of AWM state to disk
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
     */
    load(): Promise<void>;
    /**
     * Save state to disk
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