# AWM Mental Todo Integration for Roxy

## How It Works

Instead of a complex daemon, AWM uses a **signal-based queue** that I check periodically.

### My Workflow:

1. **During heartbeat or when mentioned**: Check `~/.awm/work-queue.json`
2. **If work is queued**: Spawn sessions using `sessions_spawn` tool
3. **Stay responsive**: Spawning is non-blocking
4. **Notifications**: Send to Discord when complete

### Mental Todo Triggers:

I should check AWM queue when:
- User mentions work/projects
- During heartbeat (if queue exists)
- After completing other tasks
- When I have capacity (not overwhelmed)

### Usage from Code:

```typescript
// Check if work is queued
const queueFile = '~/.awm/work-queue.json';
const queue = JSON.parse(await read(queueFile));

if (queue.length > 0) {
  for (const item of queue) {
    // Get project details
    const projects = JSON.parse(await read('~/.awm/projects.json'));
    const project = projects.find(p => p.id === item.projectId);
    
    // Spawn session (non-blocking!)
    const result = await sessions_spawn({
      task: buildWorkContext(project),
      label: `awm-${project.id.substring(0, 8)}`,
      cleanup: 'keep',
      runTimeoutSeconds: 1800,
    });
    
    // Log it
    console.log(`Spawned: ${project.name} → ${result.childSessionKey}`);
  }
  
  // Clear queue
  await write(queueFile, '[]');
}
```

### Queue Work Command:

User or I can queue work:
```bash
cd ~/clawd/awm && ./node_modules/.bin/tsx queue-work.ts <projectId> high ai-decision
```

This is **non-blocking** - just writes to queue file.

### Project Context Builder:

```typescript
function buildWorkContext(project) {
  return `# Autonomous Work Session

## Project: ${project.name}
${project.description}

## Goals
${project.goals.map(g => `- ${g}`).join('\n')}

## Context
${project.context}

## Next Steps
${project.nextSteps.map(s => `- ${s}`).join('\n')}

## Your Task
Work autonomously on this project. Make progress on the next steps.

When done, provide a concise summary of:
1. What you accomplished
2. Any blockers or issues  
3. Recommended next steps

Work directory: ~/clawd/awm-workspace/${project.id}`;
}
```

### Notification Handling:

When sub-agent completes, I check transcript and send Discord notification:

```typescript
// Format completion notification
const notification = `✅ **AWM Work Session Complete**

**Project:** ${project.name}
**Duration:** X minutes
**Session:** \`${sessionKey}\`

**Summary:**
[Extract from session transcript]

**Outcome:**
[Agent's summary]

**Repository:** https://github.com/roxy-sh/awm`;

// Send to Discord
await message.send({
  channel: 'discord',
  target: '1466124749800210656', // #roxy-testing
  message: notification
});
```

## Integration Points

### In AGENTS.md heartbeat section:
```markdown
**Things to check:**
- AWM work queue (~/.awm/work-queue.json)
- Spawn any pending work (non-blocking)
- Check completed sessions for notifications
```

### In MEMORY.md:
```markdown
## AWM Integration
- Queue file: ~/.awm/work-queue.json  
- Projects file: ~/.awm/projects.json
- Check during heartbeat or when capacity available
- Always non-blocking - spawn and continue
- Send Discord notifications on completion
```

## Key Principle

**I am the orchestrator.** AWM is just state management. I:
- Decide when to check queue
- Spawn sessions when ready
- Track completions
- Send notifications
- Stay responsive always

No daemon needed - I'm the daemon! 🤖
