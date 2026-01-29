# AWM Tutorial - Getting Started

A step-by-step guide to setting up and running your first autonomous work session with AWM.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [First-Time Setup](#first-time-setup)
4. [Creating Your First Project](#creating-your-first-project)
5. [Scheduling Work](#scheduling-work)
6. [Running the Daemon](#running-the-daemon)
7. [Monitoring Progress](#monitoring-progress)
8. [Understanding Results](#understanding-results)
9. [Next Steps](#next-steps)

## Prerequisites

Before starting, ensure you have:

- **Node.js** v18 or higher
- **npm** (comes with Node.js)
- **Clawdbot** installed and running (if you want real sessions)
- **Discord bot** configured (optional, for notifications)
- **Basic terminal knowledge**

Check your versions:
```bash
node --version  # Should be >= v18
npm --version   # Should be >= 8
```

## Installation

### Step 1: Clone or Download AWM

```bash
cd ~/clawd
git clone https://github.com/roxy-sh/awm.git
cd awm
```

Or if you already have it:
```bash
cd ~/clawd/awm
git pull
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs TypeScript, cron, axios, and other required packages.

### Step 3: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 4: Make AWM Available Globally

```bash
npm link
```

This creates a global symlink so you can run `awm` from anywhere.

### Step 5: Verify Installation

```bash
awm --help
```

You should see the AWM command help text.

## First-Time Setup

### Configure Clawdbot Integration (Optional but Recommended)

If you want real autonomous work sessions (not just simulations):

```bash
# Set Clawdbot gateway URL (default: localhost:18789)
awm config set clawdbotGatewayUrl http://localhost:18789

# Set authentication token (get from your Clawdbot setup)
awm config set clawdbotAuthToken your-secret-token-here
```

**How to get your auth token:**
- Check your Clawdbot configuration
- Look in `~/.clawdbot/config.json` for `authToken`
- Or ask your Clawdbot instance: `clawdbot config show`

### Configure Discord Notifications (Optional)

For work completion notifications in Discord:

```bash
# Enable Discord integration
awm config set discord.enabled true

# Set target channel ID
awm config set discord.channelId 1234567890123456789
```

**How to get Discord channel ID:**
1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click on the channel
3. Select "Copy Channel ID"

### Verify Configuration

```bash
awm config show
```

You should see something like:
```json
{
  "dataDir": "/home/you/.awm",
  "maxConcurrentSessions": 2,
  "defaultSessionDuration": 1800000,
  "logLevel": "info",
  "clawdbotGatewayUrl": "http://localhost:18789",
  "clawdbotAuthToken": "***",
  "discord": {
    "enabled": true,
    "channelId": "1234567890123456789"
  }
}
```

## Creating Your First Project

Let's create a simple project to demonstrate AWM.

### Step 1: Create the Project

```bash
awm create-project "Documentation Update" "Keep README in sync with code changes"
```

This creates a project with:
- A unique ID (e.g., `proj-1738155600000-abc123`)
- Status: `active`
- Empty goals, context, and next steps

### Step 2: Get the Project ID

```bash
awm list-projects
```

Output:
```
Projects:
- [proj-1738155600000-abc123] Documentation Update (active)
  Last worked: Never
  Hours spent: 0
```

Copy the project ID (the part in brackets).

### Step 3: Edit Project Details

AWM stores projects in `~/.awm/projects.json`. Let's add more details:

```bash
# Open the file
nano ~/.awm/projects.json
```

Find your project and enhance it:

```json
{
  "id": "proj-1738155600000-abc123",
  "name": "Documentation Update",
  "description": "Keep README in sync with code changes",
  "status": "active",
  "goals": [
    "Ensure README reflects latest API changes",
    "Add code examples for new features",
    "Fix any outdated information"
  ],
  "context": "This project maintains the README.md file in ~/clawd/my-app. Compare the README with source code in src/ and update as needed. Focus on accuracy and clarity. Use TypeScript examples.",
  "nextSteps": [
    "Read current README.md",
    "Scan src/ for new functions/classes",
    "Update README with missing documentation",
    "Commit changes with clear message"
  ],
  "createdAt": 1738155600000,
  "updatedAt": 1738155600000,
  "hoursSpent": 0
}
```

**Important:** The `context` and `nextSteps` fields guide the AI during work sessions. Be specific!

### Step 4: Create Work Directory

Create a workspace for this project:

```bash
mkdir -p ~/clawd/awm-workspace/proj-1738155600000-abc123
```

(Replace with your actual project ID)

## Scheduling Work

Now let's schedule when the AI should work on this project.

### Option 1: Daily Schedule

Work on it every day at 2 AM:

```bash
awm create-event proj-1738155600000-abc123 "0 2 * * *"
```

### Option 2: Weekday Mornings

Every weekday at 9 AM:

```bash
awm create-event proj-1738155600000-abc123 "0 9 * * 1-5"
```

### Option 3: Frequent Testing

Every 5 minutes (good for testing):

```bash
awm create-event proj-1738155600000-abc123 "*/5 * * * *"
```

### Understanding Cron Syntax

Format: `minute hour day month weekday`

Examples:
- `0 2 * * *` - 2:00 AM every day
- `30 14 * * *` - 2:30 PM every day
- `0 */4 * * *` - Every 4 hours
- `0 0 * * 0` - Midnight every Sunday
- `*/15 * * * *` - Every 15 minutes

**Tip:** Test cron expressions at https://crontab.guru

### Verify Event Created

```bash
awm status
```

Look for your event in the output:
```
Events:
- evt-xxx (time) for proj-xxx
  Next trigger: in 4 minutes
  Priority: medium
```

## Running the Daemon

### Start the Daemon

```bash
awm start
```

You should see:
```
Loading AWM configuration...
Initializing state manager...
Starting Work Orchestrator...
Clawdbot integration configured
Discord notifications configured
WorkOrchestrator started

AWM daemon is running...
```

**The daemon will:**
- Monitor your scheduled events
- Trigger work sessions at the right time
- Spawn Clawdbot sessions
- Save results continuously

### Run in Background

For long-term operation, run in a detached screen or tmux session:

```bash
# Using screen
screen -S awm
awm start
# Press Ctrl+A, then D to detach

# Reattach later with:
screen -r awm
```

Or with tmux:
```bash
tmux new -s awm
awm start
# Press Ctrl+B, then D to detach

# Reattach later with:
tmux attach -t awm
```

### Stop the Daemon

Press `Ctrl+C` in the terminal where AWM is running.

Or if running in background:
```bash
pkill -f "awm start"
```

## Monitoring Progress

### Check Current Status

```bash
awm status
```

Output shows:
- Running state
- Queue size
- Active sessions
- Event schedules

Example:
```json
{
  "running": true,
  "queueSize": 0,
  "activeSessions": 1,
  "maxConcurrent": 2,
  "events": {
    "time": 1,
    "file": 0
  }
}
```

### List All Projects

```bash
awm list-projects
```

Shows:
- Project names and IDs
- Current status
- Last work time
- Hours spent

### View Raw Data

```bash
# Projects
cat ~/.awm/projects.json | jq .

# Sessions (work history)
cat ~/.awm/sessions.json | jq .

# Events (schedules)
cat ~/.awm/events.json | jq .
```

### Watch Live Logs

If running in foreground, watch the console output:

```
Handling trigger for project proj-xxx
Starting work session for project: Documentation Update
Spawning Clawdbot session for project: Documentation Update
Clawdbot session spawned: awm-proj-xxx-123
Polling for completion...
Session awm-proj-xxx-123 completed successfully
```

### Check Discord Notifications

If configured, completed sessions post to your Discord channel:

```
✅ **AWM Work Session Complete**

**Project:** Documentation Update
**Duration:** 3.4 minutes
**Session:** `awm-proj-xxx-123`

**Summary:**
Updated README with new API documentation

**Outcome:**
1. ✅ Added examples for auth module
2. ✅ Fixed outdated setup instructions
3. ✅ Committed changes
```

## Understanding Results

### Session Outcomes

After a work session completes, check `~/.awm/sessions.json`:

```json
{
  "id": "sess-xxx",
  "projectId": "proj-xxx",
  "status": "completed",
  "startedAt": 1738155700000,
  "completedAt": 1738155900000,
  "duration": 200000,
  "clawdbotSessionKey": "awm-proj-xxx-123",
  "summary": "Session completed - check history for details",
  "outcome": "Updated README.md with latest API changes..."
}
```

**Key fields:**
- `status`: `completed`, `failed`, or `running`
- `duration`: Milliseconds spent working
- `outcome`: AI's summary of what was accomplished
- `clawdbotSessionKey`: Reference to the spawned session

### Project Updates

Projects track cumulative hours:

```json
{
  "id": "proj-xxx",
  "name": "Documentation Update",
  "hoursSpent": 0.055,  // ~3.3 minutes
  "lastWorkedAt": 1738155900000,
  // ...
}
```

### Reviewing Work

To see what the AI actually did:

1. **Check the work directory:**
   ```bash
   cd ~/clawd/awm-workspace/proj-xxx
   git log  # If versioned
   git diff HEAD~1
   ```

2. **Read session outcome:**
   ```bash
   cat ~/.awm/sessions.json | jq '.[-1].outcome'
   ```

3. **Query Clawdbot session history** (if integrated):
   ```bash
   clawdbot sessions show awm-proj-xxx-123
   ```

## Next Steps

### Experiment with Schedules

Try different cron patterns:

```bash
# Hourly during work hours
awm create-event <project-id> "0 9-17 * * 1-5"

# Twice a day
awm create-event <project-id> "0 9,15 * * *"

# Every Monday morning
awm create-event <project-id> "0 8 * * 1"
```

### Create More Projects

```bash
# Code review project
awm create-project "Code Quality" "Run linters and fix common issues"

# Dependency updates
awm create-project "Dependency Patrol" "Check for outdated npm packages"

# Testing project
awm create-project "Test Coverage" "Write tests for untested modules"
```

Then edit their JSON entries with specific context and goals.

### Adjust Concurrency

If you have resources, run more sessions simultaneously:

```bash
awm config set maxConcurrentSessions 4
```

### Set Session Durations

Default is 30 minutes. Adjust based on task complexity:

```bash
# 15 minutes (in milliseconds)
awm config set defaultSessionDuration 900000

# 1 hour
awm config set defaultSessionDuration 3600000
```

### Pause and Resume Projects

Edit `~/.awm/projects.json` and change `status`:

```json
{
  "status": "paused"  // Won't trigger new work
}
```

Or:
```json
{
  "status": "completed"  // Marks as done
}
```

### Archive Old Sessions

To keep files manageable, periodically archive old sessions:

```bash
# Move old sessions to backup
cat ~/.awm/sessions.json | jq 'map(select(.completedAt > 1700000000000))' > ~/.awm/sessions-new.json
mv ~/.awm/sessions.json ~/.awm/sessions-archive.json
mv ~/.awm/sessions-new.json ~/.awm/sessions.json
```

### Explore Advanced Features

See [EXAMPLES.md](./EXAMPLES.md) for:
- File-based triggers
- Webhook integration (Phase 3)
- Project dependencies
- Custom session templates

### Read More Documentation

- [README.md](./README.md) - Overview and architecture
- [PROJECT.md](./PROJECT.md) - Development roadmap
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

## Common Patterns

### The "Nightly Cleanup" Project

```json
{
  "name": "Nightly Cleanup",
  "description": "Code formatting, linting, and minor fixes",
  "goals": ["Run prettier", "Fix linter warnings", "Update imports"],
  "context": "Repository at ~/clawd/my-app. Run `npm run lint:fix` and commit changes if any.",
  "nextSteps": ["Run linter", "Check for auto-fixable issues", "Commit with message 'chore: automated cleanup'"]
}
```

Schedule: `0 2 * * *` (2 AM daily)

### The "Weekly Report" Project

```json
{
  "name": "Weekly Summary",
  "description": "Summarize commits from past week",
  "goals": ["Generate changelog", "Post to Discord", "Update CHANGELOG.md"],
  "context": "Read git log from past 7 days in ~/clawd/my-app, create human-readable summary",
  "nextSteps": ["Run git log --since='7 days ago'", "Parse commits", "Write CHANGELOG.md entry"]
}
```

Schedule: `0 9 * * 1` (Monday 9 AM)

### The "Dependency Guardian" Project

```json
{
  "name": "Dependency Guardian",
  "description": "Check for security updates",
  "goals": ["Run npm audit", "Update safe packages", "Report vulnerabilities"],
  "context": "Project at ~/clawd/my-app. Check for outdated or vulnerable dependencies.",
  "nextSteps": ["npm audit", "npm outdated", "Update patch versions", "Run tests"]
}
```

Schedule: `0 10 * * 1` (Monday 10 AM)

## Tips for Success

### 1. Start Small

Begin with one simple project and a frequent schedule (every 5 minutes) to see how it works.

### 2. Be Specific in Context

The AI only knows what you tell it. Include:
- Exact file paths
- Commands to run
- Expected outcomes
- Quality criteria

### 3. Version Your Workspace

```bash
cd ~/clawd/awm-workspace/proj-xxx
git init
git add .
git commit -m "Initial state"
```

This lets you track what the AI changes.

### 4. Monitor First Sessions Closely

Don't schedule and forget! Watch the first few sessions to ensure they do what you expect.

### 5. Iterate on Instructions

If a session doesn't do what you want:
1. Read the outcome
2. Update project's `context` and `nextSteps`
3. Try again

### 6. Use Realistic Schedules

Don't schedule 50 projects every 5 minutes. The queue will back up. Stagger events.

### 7. Review Regularly

Check `~/.awm/sessions.json` weekly to see what's been accomplished and adjust as needed.

## Troubleshooting Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Command not found | `npm run build && npm link` |
| Sessions stuck | Stop daemon, edit `sessions.json`, restart |
| No notifications | Check `awm config show`, verify Discord settings |
| Events not firing | Verify cron syntax at crontab.guru |
| Out of sync | `awm status` and check system time |

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Congratulations! 🎉

You've successfully:
- ✅ Installed AWM
- ✅ Configured integrations
- ✅ Created your first project
- ✅ Scheduled autonomous work
- ✅ Monitored results

AWM is now managing autonomous work for you. The AI will continue working on your projects according to the schedules you've set.

**Welcome to autonomous AI project management!**

---

**Next:** Check out [EXAMPLES.md](./EXAMPLES.md) for real-world use cases and advanced patterns.
