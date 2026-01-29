"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = void 0;
const crypto_1 = require("crypto");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Manages persistence of AWM state to disk
 */
class StateManager {
    dataDir;
    state;
    constructor(dataDir) {
        this.dataDir = dataDir;
        this.state = {
            projects: new Map(),
            sessions: new Map(),
            events: new Map(),
            activeSessionIds: new Set(),
        };
    }
    async initialize() {
        await promises_1.default.mkdir(this.dataDir, { recursive: true });
        await this.load();
    }
    getProjectsPath() {
        return path_1.default.join(this.dataDir, 'projects.json');
    }
    getSessionsPath() {
        return path_1.default.join(this.dataDir, 'sessions.json');
    }
    getEventsPath() {
        return path_1.default.join(this.dataDir, 'events.json');
    }
    /**
     * Load state from disk
     */
    async load() {
        try {
            // Load projects
            const projectsData = await promises_1.default.readFile(this.getProjectsPath(), 'utf-8');
            const projects = JSON.parse(projectsData);
            this.state.projects = new Map(projects.map(p => [p.id, p]));
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        try {
            // Load sessions
            const sessionsData = await promises_1.default.readFile(this.getSessionsPath(), 'utf-8');
            const sessions = JSON.parse(sessionsData);
            this.state.sessions = new Map(sessions.map(s => [s.id, s]));
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        try {
            // Load events
            const eventsData = await promises_1.default.readFile(this.getEventsPath(), 'utf-8');
            const events = JSON.parse(eventsData);
            this.state.events = new Map(events.map(e => [e.id, e]));
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
    }
    /**
     * Save state to disk
     */
    async save() {
        const projects = Array.from(this.state.projects.values());
        const sessions = Array.from(this.state.sessions.values());
        const events = Array.from(this.state.events.values());
        await Promise.all([
            promises_1.default.writeFile(this.getProjectsPath(), JSON.stringify(projects, null, 2)),
            promises_1.default.writeFile(this.getSessionsPath(), JSON.stringify(sessions, null, 2)),
            promises_1.default.writeFile(this.getEventsPath(), JSON.stringify(events, null, 2)),
        ]);
    }
    // Project methods
    createProject(project) {
        const newProject = {
            ...project,
            id: (0, crypto_1.randomUUID)(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            hoursSpent: 0,
        };
        this.state.projects.set(newProject.id, newProject);
        return newProject;
    }
    getProject(id) {
        return this.state.projects.get(id);
    }
    getAllProjects() {
        return Array.from(this.state.projects.values());
    }
    updateProject(id, updates) {
        const project = this.state.projects.get(id);
        if (!project)
            return undefined;
        const updated = {
            ...project,
            ...updates,
            updatedAt: Date.now(),
        };
        this.state.projects.set(id, updated);
        return updated;
    }
    deleteProject(id) {
        return this.state.projects.delete(id);
    }
    // Session methods
    createSession(session) {
        const newSession = {
            ...session,
            id: (0, crypto_1.randomUUID)(),
        };
        this.state.sessions.set(newSession.id, newSession);
        return newSession;
    }
    getSession(id) {
        return this.state.sessions.get(id);
    }
    getSessionsForProject(projectId) {
        return Array.from(this.state.sessions.values())
            .filter(s => s.projectId === projectId);
    }
    updateSession(id, updates) {
        const session = this.state.sessions.get(id);
        if (!session)
            return undefined;
        const updated = { ...session, ...updates };
        this.state.sessions.set(id, updated);
        return updated;
    }
    // Event methods
    createEvent(event) {
        const newEvent = {
            ...event,
            id: (0, crypto_1.randomUUID)(),
        };
        this.state.events.set(newEvent.id, newEvent);
        return newEvent;
    }
    getEvent(id) {
        return this.state.events.get(id);
    }
    getAllEvents() {
        return Array.from(this.state.events.values());
    }
    getEventsForProject(projectId) {
        return Array.from(this.state.events.values())
            .filter(e => e.projectId === projectId);
    }
    updateEvent(id, updates) {
        const event = this.state.events.get(id);
        if (!event)
            return undefined;
        const updated = { ...event, ...updates };
        this.state.events.set(id, updated);
        return updated;
    }
    deleteEvent(id) {
        return this.state.events.delete(id);
    }
    // Active sessions tracking
    markSessionActive(sessionId) {
        this.state.activeSessionIds.add(sessionId);
    }
    markSessionInactive(sessionId) {
        this.state.activeSessionIds.delete(sessionId);
    }
    getActiveSessions() {
        return Array.from(this.state.activeSessionIds)
            .map(id => this.state.sessions.get(id))
            .filter((s) => s !== undefined);
    }
    getActiveSessionCount() {
        return this.state.activeSessionIds.size;
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=state.js.map