# AWM - Autonomous Work Manager

## 📖 Project Overview

**Status:** Phase 1 Complete ✅  
**Started:** 2026-01-29  
**Model:** local-devstral/devstral-small-2-24b  

### Vision
A reactive, event-loop-based system that gives AI assistants dedicated autonomous time to work on projects without constant human supervision.

### Core Problem Solved
Traditional AI assistants are purely reactive - they only work when prompted. AWM enables **proactive, scheduled, and event-driven work** where the AI can make progress on projects during allocated time blocks.

## 🏗️ Architecture

### Components Built (Phase 1)

1. **StateManager** (`src/state.ts`)
   - File-based persistence (JSON)
   - CRUD operations for projects, sessions, events
   - Active session tracking
   - Auto-save capability

2. **EventManager** (`src/events.ts`)
   - Time-based triggers (cron)
   - File system watchers (chokidar)
   - Event registration/unregistration
   - Emits work triggers

3. **WorkQueue** (`src/queue.ts`)
   - Priority-based queue
   - FIFO within same priority
   - Project-based filtering
   - Queue management

4. **WorkOrchestrator** (`src/orchestrator.ts`)
   - Main event loop
   - Concurrency management
   - Session spawning
   - State persistence

5. **CLI** (`src/cli.ts`)
   - Daemon mode
   - Project management
   - Event management
   - Status reporting

### Data Flow

```
Event Trigger (cron/file)
    ↓
EventManager.emit('trigger')
    ↓
WorkOrchestrator.handleTrigger()
    ↓
WorkQueue.enqueue()
    ↓
WorkOrchestrator.processQueue()
    ↓
Spawn Clawdbot Session
    ↓
Update State & Save
```

## 📂 File Structure

```
awm/
├── src/
│   ├── types.ts          # Core TypeScript types
│   ├── state.ts          # State management
│   ├── events.ts         # Event system
│   ├── queue.ts          # Priority queue
│   ├── orchestrator.ts   # Main orchestrator
│   ├── cli.ts            # CLI entry point
│   └── index.ts          # Public API
├── dist/                 # Compiled JS (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Current Capabilities

✅ **Working:**
- TypeScript project with strict mode
- State persistence to JSON
- Cron-based scheduling
- File system watching
- Priority queue
- Concurrency control
- CLI interface

⏳ **TODO (Phase 2-4):**
- Actual Clawdbot session spawning integration
- Webhook support
- Progress notifications (Discord/etc)
- Session timeout handling
- Web dashboard
- Resource limits
- Project templates
- Better error recovery

## 🚀 Usage

### Install

```bash
cd ~/clawd/awm
npm install
npm run build
npm link  # Makes 'awm' command global
```

### Create a Project

```bash
awm create-project "Code Refactor" "Refactor legacy API endpoints"
```

This creates a project with default structure. Edit `~/.awm/projects.json` to add:
- Detailed goals
- Rich context for the AI
- Specific next steps

### Schedule Work

```bash
# Work on it every day at 2 AM UTC
awm create-event <project-id> "0 2 * * *"
```

### Start the Daemon

```bash
awm start
```

The daemon will:
- Monitor all registered events
- Add triggered work to the queue
- Spawn sessions when capacity allows
- Save progress continuously

## 🔧 Technical Details

### Programming Best Practices Applied

1. **TypeScript Strict Mode**
   - Full type safety
   - No implicit any
   - Proper null checks

2. **Separation of Concerns**
   - Each module has single responsibility
   - Clean interfaces between components
   - Easy to test and extend

3. **Event-Driven Architecture**
   - Loose coupling via EventEmitter
   - Scalable to many event sources
   - Easy to add new trigger types

4. **Proper Error Handling**
   - Try-catch blocks
   - Error propagation
   - Graceful degradation

5. **State Management**
   - Immutable updates
   - Atomic saves
   - Recovery from crashes

6. **Concurrency Control**
   - Max concurrent sessions limit
   - Queue-based scheduling
   - Fair prioritization

## 📊 Data Models

### Project
```typescript
{
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  goals: string[];
  context: string;
  nextSteps: string[];
  hoursSpent: number;
  // ... timestamps
}
```

### WorkEvent
```typescript
{
  id: string;
  type: 'time' | 'file' | 'webhook' | 'manual';
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  trigger: string;  // cron expr or file path
  enabled: boolean;
}
```

### WorkSession
```typescript
{
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  summary?: string;
  outcome?: string;
  // ... timestamps
}
```

## 🔮 Future Enhancements

### Phase 2: Integration
- [ ] Real Clawdbot sessions_spawn integration
- [ ] HTTP client for gateway API
- [ ] Authentication handling
- [ ] Session result parsing

### Phase 3: Features
- [ ] Webhook server for external triggers
- [ ] File watcher patterns (glob support)
- [ ] Project dependencies/ordering
- [ ] Work session templates
- [ ] Resource budgets (token limits, time limits)

### Phase 4: Polish
- [ ] Web dashboard (React + Express)
- [ ] Real-time status monitoring
- [ ] Session logs viewer
- [ ] Project analytics
- [ ] Export/import projects

## 💡 Example Use Cases

1. **Nightly Code Review**
   - Schedule: `0 2 * * *` (2 AM daily)
   - AI reviews PRs, runs linters, suggests improvements

2. **Documentation Updates**
   - Trigger: File changes in `/src/**/*.ts`
   - AI updates docs when code changes

3. **Dependency Audits**
   - Schedule: `0 9 * * 1` (9 AM every Monday)
   - AI checks for outdated packages, security issues

4. **Build Monitoring**
   - Webhook: GitHub Actions failure
   - AI investigates CI failures, suggests fixes

## 🎓 Lessons & Decisions

- **Why JSON files?** Simple, human-readable, git-friendly. Can migrate to DB later.
- **Why separate event sources?** Each type has different lifecycle and requirements.
- **Why priority queue?** Not all work is equal - critical fixes before nice-to-haves.
- **Why TypeScript?** Type safety prevents runtime bugs in long-running daemon.

---

Built with ❤️ using local-devstral model on 2026-01-29
