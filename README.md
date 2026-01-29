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

## 🚀 Quick Start

### 1. Install and Build

```bash
cd ~/clawd/awm
npm install
npm run build
npm link  # Makes 'awm' globally available
```

### 2. Configure (Optional)

```bash
# For real Clawdbot sessions (not simulation)
awm config set clawdbotGatewayUrl http://localhost:18789
awm config set clawdbotAuthToken your-token

# For Discord notifications
awm config set discord.enabled true
awm config set discord.channelId YOUR_CHANNEL_ID
```

### 3. Create Your First Project

```bash
# Create the project
awm create-project "Nightly Linter" "Run prettier and ESLint auto-fix"

# Get the project ID
awm list-projects

# Edit project details (add goals, context, nextSteps)
nano ~/.awm/projects.json
```

**Example project configuration:**

```json
{
  "name": "Nightly Linter",
  "description": "Run prettier and ESLint auto-fix",
  "goals": [
    "Format all TypeScript files",
    "Fix auto-fixable ESLint issues",
    "Commit changes if any"
  ],
  "context": "Repository: ~/clawd/my-app\n\nRun prettier and eslint --fix, commit if changes made.",
  "nextSteps": [
    "cd ~/clawd/my-app",
    "npx prettier --write 'src/**/*.ts'",
    "npx eslint --fix 'src/**/*.ts'",
    "git commit -am 'chore: auto format'"
  ]
}
```

### 4. Schedule Work

```bash
# Run every night at 2 AM
awm create-event <project-id> "0 2 * * *"

# Or for testing: every 5 minutes
awm create-event <project-id> "*/5 * * * *"
```

### 5. Start the Daemon

```bash
awm start
```

The daemon will now monitor events and spawn work sessions autonomously!

## 📚 Documentation

- **[TUTORIAL.md](./TUTORIAL.md)** - Step-by-step getting started guide
- **[EXAMPLES.md](./EXAMPLES.md)** - Real-world use cases and patterns
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[PROJECT.md](./PROJECT.md)** - Development roadmap

## 🎯 Common Use Cases

### Nightly Code Cleanup
```bash
awm create-project "Code Formatter" "Auto-format code and fix linting issues"
# Schedule: 0 2 * * * (2 AM daily)
```

### Dependency Updates
```bash
awm create-project "Dependency Patrol" "Update packages and check security"
# Schedule: 0 9 * * 1 (Monday mornings)
```

### Documentation Sync
```bash
awm create-project "README Keeper" "Keep README in sync with code changes"
# Schedule: 0 3 * * * (3 AM daily)
```

### Test Coverage
```bash
awm create-project "Test Bot" "Write tests for untested modules"
# Schedule: 0 1 * * 2 (Tuesday nights)
```

See [EXAMPLES.md](./EXAMPLES.md) for complete project configurations.

## 💡 Key Commands

```bash
# Daemon management
awm start                           # Start daemon
awm stop                            # Stop daemon (Ctrl+C)
awm status                          # Show status

# Project management
awm create-project <name> <desc>    # Create project
awm list-projects                   # List all projects

# Event management
awm create-event <proj-id> <cron>   # Schedule work
awm list-events                     # List events (if implemented)

# Configuration
awm config set <key> <value>        # Set config
awm config show                     # View config
```

## 🔧 Cron Schedule Examples

```bash
"0 2 * * *"      # 2 AM daily
"0 9 * * 1-5"    # 9 AM weekdays
"*/30 * * * *"   # Every 30 minutes
"0 */4 * * *"    # Every 4 hours
"0 0 * * 0"      # Midnight Sundays
```

Test expressions at https://crontab.guru

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

### Via CLI

```bash
# Set Clawdbot gateway
awm config set clawdbotGatewayUrl http://localhost:18789
awm config set clawdbotAuthToken your-token-here

# Configure Discord notifications
awm config set discord.channelId 1466124749800210656
awm config set discord.enabled true

# View current config
awm config show
```

### Via Code

```typescript
const awm = new AWM({
  dataDir: '/path/to/data',
  maxConcurrentSessions: 2,
  defaultSessionDuration: 30 * 60 * 1000, // 30 min
  logLevel: 'info',
  discord: {
    channelId: '1466124749800210656',
    enabled: true,
  },
});
```

## 📢 Discord Notifications

AWM can post work session results to Discord:

```
✅ **AWM Work Session Complete**

**Project:** My Project
**Duration:** 5.2 minutes
**Session:** `session-key-123`

**Summary:**
Successfully refactored authentication system

**Outcome:**
1. ✅ Updated 12 API endpoints
2. ✅ Added comprehensive tests
3. ✅ Documented changes

Repository: https://github.com/...
```

Configure with:
```bash
awm config set discord.channelId YOUR_CHANNEL_ID
awm config set discord.enabled true
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

## 📝 Status

### ✅ Phase 1: Architecture (Complete)
- [x] Event-driven system design
- [x] State management with JSON persistence
- [x] Work queue with priorities
- [x] Session orchestration
- [x] Cron-based scheduling

### ✅ Phase 2: Integration (Complete)
- [x] Clawdbot session spawning (callback-based)
- [x] Session polling and completion detection
- [x] Discord notifications
- [x] Config management
- [x] Test suite with mocks

### 🚧 Phase 3: Production (Next)
- [ ] Meta-agent wrapper with real tool injection
- [ ] Webhook server for external triggers
- [ ] File watcher implementation
- [ ] Web dashboard
- [ ] Session timeout handling
- [ ] Resource limits per project
- [ ] Project templates

## ❓ Troubleshooting

### Command not found after `npm link`

```bash
# Check npm global bin path
echo $PATH | grep -o "$(npm bin -g)"

# If empty, add to PATH:
export PATH="$(npm bin -g):$PATH"

# Or use npx:
npx awm status
```

### Sessions stay in simulation mode

Ensure Clawdbot is configured:
```bash
awm config set clawdbotGatewayUrl http://localhost:18789
awm config set clawdbotAuthToken your-token-here
```

### Events not triggering

1. Verify cron syntax at https://crontab.guru
2. Check system time: `date`
3. Ensure event is enabled in `~/.awm/events.json`
4. Check daemon logs for errors

### Discord notifications not working

1. Verify config: `awm config show`
2. Check channel ID (right-click channel → Copy ID)
3. Ensure bot has `SEND_MESSAGES` permission
4. Test manually with test script

**For more issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

## 🔐 Security

- Projects can contain sensitive context - protect the data directory
- Work sessions run with full AI capabilities - only schedule trusted work
- Review session outcomes before deploying changes
- Use `.gitignore` to exclude `~/.awm/` if versioning workspace

## 🤝 Contributing

Contributions welcome! Please:
1. Read [PROJECT.md](./PROJECT.md) for architecture overview
2. Add tests for new features
3. Update documentation
4. Follow TypeScript strict mode

## 📄 License

ISC

---

**Built with ❤️ for autonomous AI workflows**
