# AWM Project Repository Guidelines

## When to Create a Repository

**Create a GitHub repo when:**
- ✅ Project produces code/documentation
- ✅ Work is shareable/open source
- ✅ Multiple work sessions will contribute
- ✅ Version control is valuable

**Skip repository when:**
- ❌ Personal/private workflows (like self-improvement)
- ❌ One-time tasks with no code output
- ❌ Internal configuration only

## Creating Repositories

When spawning work on a new project:

1. **Check if repo exists** in project.repository field
2. **If null and project needs one:**
   ```bash
   cd ~/clawd/awm-workspace/PROJECT_ID
   git init
   gh repo create PROJECT_NAME --public --source . --remote origin
   git add -A
   git commit -m "Initial commit"
   git push -u origin master
   ```

3. **Update project with URL:**
   ```typescript
   // In projects.json
   "repository": "https://github.com/roxy-sh/project-name"
   ```

## Repository in Notifications

Discord notifications automatically include repository links when available:

```
✅ **AWM Work Session Complete**

**Project:** My Project
**Duration:** 5.2 minutes

**Outcome:**
...

**Repository:** https://github.com/roxy-sh/my-project
```

## Best Practices

1. **One repo per logical project** - Don't create a repo for every work session
2. **Use existing repos** - Documentation work on AWM goes in awm repo
3. **Update repository field** - Always keep projects.json up to date
4. **Initial commit early** - Create repo at project start, not after first session

## Example Project Config

```json
{
  "name": "API Documentation Generator",
  "description": "Automated tool to generate API docs from code",
  "status": "active",
  "repository": "https://github.com/roxy-sh/api-doc-gen",
  ...
}
```

---

**Updated:** 2026-01-29
