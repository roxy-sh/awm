"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWM = void 0;
const path_1 = __importDefault(require("path"));
const state_1 = require("./state");
const events_1 = require("./events");
const orchestrator_1 = require("./orchestrator");
/**
 * Main AWM class - entry point for the system
 */
class AWM {
    config;
    state;
    events;
    orchestrator;
    initialized;
    constructor(config, clawdbot, discord) {
        const defaultConfig = {
            dataDir: path_1.default.join(process.env.HOME || '/tmp', '.awm'),
            maxConcurrentSessions: 2,
            defaultSessionDuration: 30 * 60 * 1000, // 30 minutes
            logLevel: 'info',
        };
        this.config = { ...defaultConfig, ...config };
        this.state = new state_1.StateManager(this.config.dataDir);
        this.events = new events_1.EventManager();
        this.orchestrator = new orchestrator_1.WorkOrchestrator(this.config, this.state, this.events, clawdbot, discord);
        this.initialized = false;
    }
    /**
     * Initialize the AWM system
     */
    async initialize() {
        if (this.initialized)
            return;
        console.log('Initializing AWM...');
        await this.state.initialize();
        this.initialized = true;
        console.log(`AWM initialized with data directory: ${this.config.dataDir}`);
    }
    /**
     * Start the AWM system
     */
    async start() {
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
    async stop() {
        console.log('Stopping AWM...');
        await this.orchestrator.stop();
        console.log('AWM stopped');
    }
    /**
     * Get state manager for direct access
     */
    getState() {
        return this.state;
    }
    /**
     * Get event manager for direct access
     */
    getEvents() {
        return this.events;
    }
    /**
     * Get orchestrator for status
     */
    getOrchestrator() {
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
exports.AWM = AWM;
__exportStar(require("./types"), exports);
__exportStar(require("./state"), exports);
__exportStar(require("./events"), exports);
__exportStar(require("./orchestrator"), exports);
__exportStar(require("./queue"), exports);
__exportStar(require("./clawdbot"), exports);
__exportStar(require("./discord"), exports);
__exportStar(require("./config"), exports);
//# sourceMappingURL=index.js.map