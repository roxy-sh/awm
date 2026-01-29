# AWM - Autonomous Work Manager

Event-driven system for autonomous AI project work. Built for Clawdbot.

## 🎯 Concept

AWM gives your AI assistant dedicated time to work on projects autonomously. Instead of always being reactive to user commands, the AI can:
- Work on projects during scheduled time blocks
- Respond to file changes or external events
- Make progress without constant supervision
- Report back with summaries when done

## 🏗️ Architecture

```
┌─────────────────┐
│  Event Sources  │
│ (cron, files)   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Events  │
    └────┬─────┘
         │
    ┌────▼──────────┐
    │  Work Queue   │
    │ (prioritized) │
    └────┬──────────┘
         │
    ┌────▼──────────────┐
    │  Orchestrator     │
    │  (spawn sessions) │
    └───────────────────┘
```

### Components

- **StateManager**: Persists projects, sessions, and events to JSON files
- **EventManager**: Monitors cron schedules and file watchers
- **WorkQueue**: Priority queue for work triggers
- **WorkOrchestrator**: Spawns Clawdbot sessions and manages concurrency

## 📦 Installation

```bash
npm install
npm run build
npm link  # Makes 'awm' command available globally
```

## 🚀 Usage

### Start the daemon

```bash
awm start
```

### Create a project

```bash
awm create-project "My Cool Project" "Build something awesome"
```

### Create a time-based event

```bash
# Work on project every day at 2 AM
awm create-event <project-id> "0 2 * * *"
```

### Check status

```bash
awm status
```

### List projects

```bash
awm list-projects
```

## 📁 Data Structure

AWM stores data in `~/.awm/` by default:

```
~/.awm/
├── projects.json   # All projects
├── sessions.json   # Work session history
└── events.json     # Event triggers
```

### Project Schema

```typescript
{
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  goals: string[];
  context: string;        // Rich context for the AI
  nextSteps: string[];
  createdAt: number;
  updatedAt: number;
  lastWorkedAt?: number;
  hoursSpent: number;
}
```

### Event Types

- **time**: Cron-based scheduling (e.g., "0 2 * * *" for 2 AM daily)
- **file**: File system watchers (future)
- **webhook**: External triggers (future)
- **manual**: User-initiated (future)

## 🎛️ Configuration

Set via environment variables or constructor:

```typescript
const awm = new AWM({
  dataDir: '/path/to/data',
  maxConcurrentSessions: 2,
  defaultSessionDuration: 30 * 60 * 1000, // 30 min
  logLevel: 'info',
  clawdbotGatewayUrl: 'http://localhost:18789',
  clawdbotAuthToken: 'your-token',
});
```

## 🔄 Event Loop

1. Events fire based on schedule/watchers
2. Triggers added to priority queue
3. Orchestrator checks queue every 5 seconds
4. If capacity available, spawns work session
5. Session runs autonomously with project context
6. Results saved, project updated

## 🛠️ Development

```bash
# Run in dev mode with auto-reload
npm run dev start

# Build TypeScript
npm run build

# Run built version
npm start
```

## 📝 TODO

- [ ] Integrate with Clawdbot sessions_spawn
- [ ] Add webhook support
- [ ] File watcher implementation
- [ ] Progress notifications
- [ ] Web dashboard
- [ ] Session timeout handling
- [ ] Resource limits per project
- [ ] Project templates

## 🧪 Example Workflow

```bash
# Create a project
awm create-project "Code Refactor" "Refactor legacy API endpoints"

# Edit the project JSON to add goals and context
# (or build a CLI command for this)

# Schedule daily work at 2 AM
awm create-event <project-id> "0 2 * * *"

# Start the daemon
awm start
```

Now the AI will work on the refactor every day at 2 AM, make progress, and save the results!

## 🔐 Security

- Projects can contain sensitive context - protect the data directory
- Work sessions run with full AI capabilities - only schedule trusted work
- Review session outcomes before deploying changes

## 📄 License

ISC
