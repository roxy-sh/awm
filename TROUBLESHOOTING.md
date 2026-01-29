# AWM Troubleshooting Guide

Common issues and their solutions when working with the Autonomous Work Manager.

## Installation Issues

### Command `awm` not found

**Problem:** After running `npm link`, the `awm` command is not available.

**Solutions:**

1. **Check npm global bin path:**
   ```bash
   npm bin -g
   # Should output something like /usr/local/bin or ~/.npm-global/bin
   ```

2. **Ensure global bin is in PATH:**
   ```bash
   echo $PATH | grep -o "$(npm bin -g)"
   ```
   
   If empty, add to your shell profile:
   ```bash
   # For bash: ~/.bashrc
   # For zsh: ~/.zshrc
   export PATH="$(npm bin -g):$PATH"
   ```

3. **Re-link the package:**
   ```bash
   cd ~/clawd/awm
   npm unlink
   npm run build
   npm link
   ```

4. **Use npx as alternative:**
   ```bash
   npx awm status
   ```

### TypeScript compilation errors

**Problem:** `npm run build` fails with type errors.

**Solution:**
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

If still failing, check Node.js version:
```bash
node --version  # Should be >= 18
```

## Configuration Issues

### Clawdbot sessions won't spawn

**Problem:** Daemon runs but sessions stay in "simulation mode".

**Diagnosis:**
```bash
awm config show
```

**Required settings:**
```bash
awm config set clawdbotGatewayUrl http://localhost:18789
awm config set clawdbotAuthToken your-token-here
```

**Verify gateway is running:**
```bash
# Check if gateway is accessible
curl http://localhost:18789/health
# Should return 200 OK
```

**Check logs:**
```bash
awm start  # Look for "Clawdbot integration configured"
```

### Discord notifications not appearing

**Problem:** Sessions complete but no Discord messages.

**Checklist:**

1. **Is Discord enabled?**
   ```bash
   awm config show
   # Look for: discord.enabled: true
   ```

2. **Is channel ID correct?**
   ```bash
   awm config set discord.channelId YOUR_CHANNEL_ID
   ```
   
   How to get channel ID:
   - Right-click channel in Discord
   - Select "Copy Channel ID"
   - Enable Developer Mode if option not visible

3. **Check permissions:**
   - Bot must have `SEND_MESSAGES` permission in the channel
   - Bot must be a member of the server

4. **Test manually:**
   ```typescript
   // Create test-discord.ts
   import { DiscordIntegration } from './dist/discord.js';
   
   const discord = new DiscordIntegration('YOUR_CHANNEL_ID');
   discord.send('Test message from AWM');
   ```

## Runtime Issues

### Daemon won't start

**Problem:** `awm start` exits immediately or hangs.

**Check for existing process:**
```bash
ps aux | grep awm
# Kill if found:
kill <PID>
```

**Check data directory permissions:**
```bash
ls -la ~/.awm/
# Should be writable by your user
chmod 755 ~/.awm/
```

**Run with debug output:**
```bash
# Enable debug logging
AWM_LOG_LEVEL=debug awm start
```

**Check for port conflicts:**
```bash
# If using webhook server (future feature)
lsof -i :3000
```

### Events not triggering

**Problem:** Cron schedule set, but work never starts.

**Verify cron syntax:**
```bash
# Test cron expression
# Format: "second minute hour day month weekday"
# Examples:
"0 2 * * *"      # 2 AM daily ✅
"0 */4 * * *"    # Every 4 hours ✅
"0 0 * * 1"      # Mondays at midnight ✅
"*/30 * * * *"   # Every 30 minutes ✅
```

**Check event status:**
```bash
awm status
# Look at "events" section
```

**Verify event is enabled:**
```bash
# Check ~/.awm/events.json
cat ~/.awm/events.json
# enabled: true
```

**Check system time:**
```bash
date
# Ensure timezone is correct
# Cron uses system time, not timezone-aware
```

**Manual trigger test:**
Create a test event with near-immediate trigger:
```bash
# Trigger in next minute
awm create-event <project-id> "*/1 * * * *"
# Wait 1 minute, check logs
```

### Session stuck in "running" state

**Problem:** Work session never completes.

**Possible causes:**

1. **Clawdbot session actually running:**
   ```bash
   # Check Clawdbot status
   clawdbot sessions list
   ```

2. **Polling failed:**
   - Check network connectivity
   - Verify gateway URL is accessible
   - Look for errors in daemon logs

3. **Session timeout not implemented:**
   - Currently sessions may run indefinitely
   - Manual intervention needed:
   ```bash
   # Edit ~/.awm/sessions.json
   # Change status from "running" to "failed"
   # Or delete the session entry
   ```

**Workaround:**
```bash
# Stop daemon
pkill -f "awm start"

# Edit state files
nano ~/.awm/sessions.json
# Change "running" → "completed" or "failed"

# Restart
awm start
```

### High CPU usage

**Problem:** AWM daemon consuming excessive CPU.

**Common causes:**

1. **Aggressive polling:**
   - Default: 5-second intervals
   - Multiple active sessions
   - **Solution:** Increase poll interval (requires code change)

2. **File watcher loops:**
   - Too many watched files
   - Rapid file changes triggering events
   - **Solution:** Use more specific file patterns

3. **Large state files:**
   - Many projects/sessions
   - **Solution:** Archive old sessions

**Monitor:**
```bash
top -p $(pgrep -f "awm start")
```

## Data Issues

### Lost project data

**Problem:** Projects disappeared after restart.

**Recovery:**

1. **Check backup:**
   ```bash
   ls -la ~/.awm/*.json.backup
   # AWM creates backups on save (if implemented)
   ```

2. **Check git history (if repo is versioned):**
   ```bash
   cd ~/.awm/
   git log --all -- projects.json
   git show <commit>:projects.json
   ```

3. **Restore from last known good state:**
   ```bash
   cp ~/.awm/projects.json.backup ~/.awm/projects.json
   ```

**Prevention:**
```bash
# Create periodic backups
crontab -e
# Add:
0 */6 * * * cp ~/.awm/projects.json ~/.awm/projects.json.$(date +\%Y\%m\%d\%H\%M)
```

### Corrupted JSON files

**Problem:** Daemon fails to start with JSON parse errors.

**Fix:**
```bash
# Validate JSON
cat ~/.awm/projects.json | jq .
# If error, fix manually or restore backup

# Quick fix: Reset to empty state
echo '[]' > ~/.awm/projects.json
echo '[]' > ~/.awm/sessions.json  
echo '[]' > ~/.awm/events.json
```

**Format files properly:**
```bash
# Pretty-print JSON
jq . ~/.awm/projects.json > temp.json && mv temp.json ~/.awm/projects.json
```

## Integration Issues

### Sessions spawn but don't do anything

**Problem:** Clawdbot sessions start but produce no output.

**Check project context:**
```bash
cat ~/.awm/projects.json | jq '.[] | {name, context, nextSteps}'
```

**Ensure context is specific:**
- ❌ "Work on the project"
- ✅ "Refactor the authentication module in src/auth.ts to use JWT tokens instead of sessions"

**Verify work directory exists:**
```bash
mkdir -p ~/clawd/awm-workspace/<project-id>
```

**Check session history:**
```bash
# If using Clawdbot integration
clawdbot sessions show <session-key>
```

### Environment variables not passed

**Problem:** Sessions can't access API keys or config.

**Solution:**
Pass environment to session spawn:
```typescript
// In orchestrator.ts (requires code change)
await this.clawdbot.spawnSession({
  task: contextMessage,
  env: {
    API_KEY: process.env.API_KEY,
    // ... other vars
  },
});
```

## Performance Issues

### Slow session spawning

**Problem:** Long delay between event trigger and session start.

**Check:**
1. Queue size: `awm status`
2. Concurrent session limit: Check config
3. Gateway response time

**Optimize:**
```bash
# Increase concurrent sessions (if resources allow)
awm config set maxConcurrentSessions 4

# Adjust processing interval (requires code change in orchestrator.ts)
# Default: 5000ms
```

### Memory leaks

**Problem:** AWM daemon memory grows over time.

**Monitor:**
```bash
watch -n 5 "ps aux | grep 'awm start' | grep -v grep"
```

**Mitigation:**
```bash
# Restart daemon periodically (crude but effective)
crontab -e
# Add:
0 3 * * * pkill -f "awm start" && sleep 5 && awm start
```

**Better solution:**
- Archive old sessions
- Implement session cleanup in code
- Use process monitoring (PM2, systemd)

## Common Mistakes

### 1. Forgetting to rebuild after changes

```bash
# After editing TypeScript files:
npm run build  # Required!
```

### 2. Using wrong project ID

```bash
# Get project IDs:
awm list-projects
# Copy exact ID, don't guess
```

### 3. Invalid cron expressions

```bash
# Test cron: https://crontab.guru/
# Remember: 5 fields (minute hour day month weekday)
# NOT 6 fields (no seconds in standard cron)
```

### 4. Not setting work directory

Projects need a workspace. Create it:
```bash
mkdir -p ~/clawd/awm-workspace/my-project-id
```

### 5. Expecting instant results

- Cron events trigger at scheduled time, not immediately
- Sessions take time to complete
- Polling interval is 5 seconds
- Be patient! 

## Getting Help

### Debug checklist

Before asking for help:

1. ✅ Check `awm config show`
2. ✅ Run `awm status`
3. ✅ Review `~/.awm/*.json` files
4. ✅ Check system time/timezone
5. ✅ Verify Clawdbot gateway is running
6. ✅ Look for error messages in daemon output
7. ✅ Try test-phase2.ts to isolate issue

### Collect debug info

```bash
# Create debug bundle
mkdir ~/awm-debug
awm config show > ~/awm-debug/config.txt
awm status > ~/awm-debug/status.txt
awm list-projects > ~/awm-debug/projects.txt
cp ~/.awm/*.json ~/awm-debug/
tar -czf awm-debug.tar.gz ~/awm-debug/
```

### Enable verbose logging

```bash
# Set log level to debug
awm config set logLevel debug
# Or use environment variable
AWM_LOG_LEVEL=debug awm start
```

### Community resources

- GitHub Issues: https://github.com/roxy-sh/awm/issues
- Discord: Check #roxy-testing channel
- Documentation: Read README.md, PROJECT.md

## Known Limitations

1. **No session timeout handling** - Sessions may run indefinitely
2. **No resource limits** - No token/time budgets yet
3. **JSON file storage** - Not suitable for high-frequency updates
4. **No distributed locking** - Don't run multiple daemons
5. **No webhook support yet** - Phase 3 feature
6. **Polling-based completion** - Could be callback-based (future)
7. **No web UI** - CLI only for now

## Experimental Features

### File watchers (not fully tested)

```bash
# Create file-based event
awm create-event <project-id> "file:~/project/src/**/*.ts"
```

**Known issues:**
- May trigger too frequently
- Glob patterns not fully implemented
- Use with caution

## Emergency Recovery

### Nuclear option: Full reset

```bash
# ⚠️ WARNING: Deletes all data
rm -rf ~/.awm/
mkdir ~/.awm/

# Recreate projects from scratch
awm create-project "New Project" "Description"
```

### Preserve projects, reset sessions

```bash
cp ~/.awm/projects.json ~/projects.backup.json
echo '[]' > ~/.awm/sessions.json
echo '[]' > ~/.awm/events.json
# Then recreate events
```

---

**Still stuck?** Open an issue with:
- Output of `awm config show`
- Output of `awm status`
- Error messages
- Steps to reproduce
