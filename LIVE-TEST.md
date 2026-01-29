# AWM Live Test - Manual Orchestration

This document shows how to manually test AWM with real Clawdbot sessions.

## Test Flow

1. **Trigger a work session manually**
2. **I (the AI) will spawn a real session**  
3. **AWM will poll for completion**
4. **Discord notification will be sent**

## Commands

### 1. Check current projects
```bash
cd ~/clawd/awm && node dist/cli.js list-projects
```

### 2. Trigger work (this will request a spawn)
The orchestrator will call the Clawdbot integration callback, which I'll handle.

## Integration Architecture

Since TypeScript can't directly call Clawdbot tools, the integration works like this:

```
┌─────────────┐
│  AWM (TS)   │
│  Daemon     │
└──────┬──────┘
       │ callback
       ↓
┌─────────────┐       ┌──────────────┐
│ Integration │  ───→ │ Tool Call    │
│ Layer       │       │ (this AI)    │
└─────────────┘       └──────────────┘
                             │
                             ↓
                      ┌──────────────┐
                      │  sessions_   │
                      │  spawn       │
                      └──────────────┘
```

## Next Steps

For full integration, AWM needs to run **inside** a Clawdbot session that:
1. Has access to `sessions_spawn`
2. Has access to `message` (Discord)
3. Can execute the AWM daemon with tool-injecting wrappers

This is Phase 3 - making AWM a "meta-agent" that orchestrates other agents.

For NOW, let me demonstrate by:
1. **Creating a test project**
2. **Manually spawning a session for it**
3. **Showing the Discord notification format**
