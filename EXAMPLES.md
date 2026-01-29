# AWM Examples - Real-World Use Cases

Practical examples and patterns for autonomous work with AWM.

## Table of Contents

1. [Development Workflows](#development-workflows)
2. [Documentation Maintenance](#documentation-maintenance)
3. [Code Quality & Testing](#code-quality--testing)
4. [DevOps & Monitoring](#devops--monitoring)
5. [Content & Writing](#content--writing)
6. [Research & Learning](#research--learning)
7. [Advanced Patterns](#advanced-patterns)

---

## Development Workflows

### 1. Nightly Code Cleanup

**Goal:** Automatically format code and fix linting issues.

```json
{
  "name": "Nightly Linter",
  "description": "Run prettier and ESLint auto-fix every night",
  "status": "active",
  "goals": [
    "Format all code with prettier",
    "Fix auto-fixable ESLint issues",
    "Commit changes if any were made"
  ],
  "context": "Repository: ~/clawd/my-app\n\nRun these commands:\n1. npx prettier --write 'src/**/*.{ts,js,json}'\n2. npx eslint --fix 'src/**/*.ts'\n3. If files changed, commit with message 'chore: automated code formatting'\n\nOnly commit if changes were actually made.",
  "nextSteps": [
    "cd ~/clawd/my-app",
    "Run prettier",
    "Run eslint --fix",
    "Check git status",
    "Commit if needed"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 2 * * *` (2 AM daily)

**Why it works:**
- Keeps codebase consistently formatted
- Catches common style issues automatically
- Doesn't disrupt developers during work hours

---

### 2. Dependency Update Bot

**Goal:** Keep dependencies up to date safely.

```json
{
  "name": "Dependency Patrol",
  "description": "Check for outdated packages and security vulnerabilities",
  "status": "active",
  "goals": [
    "Identify outdated packages",
    "Update patch and minor versions",
    "Run tests to ensure nothing broke",
    "Create report of changes"
  ],
  "context": "Repository: ~/clawd/my-app\n\nSteps:\n1. Run 'npm outdated' to see what's available\n2. Run 'npm audit' to check security issues\n3. Update patch versions (e.g., 1.2.3 → 1.2.4) safely\n4. Avoid major version bumps without review\n5. Run 'npm test' to verify\n6. Commit with detailed message listing updated packages\n7. Create a summary in DEPENDENCY-LOG.md\n\nIf tests fail, revert changes and report the issue.",
  "nextSteps": [
    "npm outdated",
    "npm audit",
    "Update safe dependencies",
    "npm test",
    "Commit if tests pass"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 9 * * 1` (Mondays at 9 AM)

**Output example:**
```
Updated dependencies:
- axios: 1.6.0 → 1.6.2
- lodash: 4.17.20 → 4.17.21 (security fix)
- typescript: 5.3.2 → 5.3.3

Tests: ✅ All passed
Security: ✅ No vulnerabilities
```

---

### 3. PR Description Generator

**Goal:** Generate helpful PR descriptions from commits.

```json
{
  "name": "PR Helper",
  "description": "Generate PR descriptions for feature branches",
  "status": "active",
  "goals": [
    "Scan recent commits on feature branches",
    "Generate clear PR description",
    "Identify related issues",
    "Suggest reviewers based on changed files"
  ],
  "context": "Repository: ~/clawd/my-app\n\nFor any branch matching 'feature/*':\n1. Get commits since branching: git log main..HEAD\n2. Analyze changed files: git diff main...HEAD --name-only\n3. Generate description covering:\n   - What changed\n   - Why it changed\n   - How to test\n   - Any breaking changes\n4. Save to PR-TEMPLATE.md\n5. Look for issue references (e.g., #123)\n\nUse conventional commit format for the summary.",
  "nextSteps": [
    "Check for feature branches",
    "Analyze commits and diffs",
    "Generate PR description",
    "Save to file"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 */4 * * *` (Every 4 hours)

---

### 4. Database Migration Checker

**Goal:** Verify database migrations are safe.

```json
{
  "name": "Migration Safety Check",
  "description": "Analyze new database migrations for common issues",
  "status": "active",
  "goals": [
    "Detect new migration files",
    "Check for risky operations",
    "Verify rollback scripts exist",
    "Report potential issues"
  ],
  "context": "Repository: ~/clawd/my-app\n\nCheck migrations in db/migrations/\n\nRed flags:\n- DROP TABLE without backup\n- ALTER TABLE without default values\n- Missing rollback (down) migration\n- No transaction wrapper\n- Foreign key changes\n\nFor each new migration (committed in last 24h):\n1. Read the migration file\n2. Check for red flags\n3. Verify rollback exists\n4. Create safety report in MIGRATION-REVIEW.md\n\nIf critical issues found, post to Discord.",
  "nextSteps": [
    "Find new migration files",
    "Analyze for safety",
    "Generate report",
    "Alert if critical"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 10 * * *` (Daily at 10 AM)

---

## Documentation Maintenance

### 5. README Sync Bot

**Goal:** Keep README in sync with code changes.

```json
{
  "name": "README Keeper",
  "description": "Update README when API or features change",
  "status": "active",
  "goals": [
    "Detect API changes in source code",
    "Update README examples accordingly",
    "Ensure all public functions are documented",
    "Fix broken links"
  ],
  "context": "Repository: ~/clawd/my-app\n\nCompare README.md with:\n- src/api/*.ts (API endpoints)\n- src/index.ts (public exports)\n- package.json (scripts, dependencies)\n\nUpdate README if:\n1. New API endpoints added\n2. Function signatures changed\n3. New npm scripts added\n4. Dependencies significantly updated\n\nKeep examples accurate and test code snippets if possible.",
  "nextSteps": [
    "Parse source code for exports",
    "Read current README",
    "Identify gaps",
    "Update with examples",
    "Verify links"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 3 * * *` (3 AM daily)

---

### 6. API Documentation Generator

**Goal:** Auto-generate API docs from JSDoc comments.

```json
{
  "name": "API Doc Generator",
  "description": "Generate API documentation from code comments",
  "status": "active",
  "goals": [
    "Extract JSDoc from source files",
    "Generate markdown API documentation",
    "Create table of contents",
    "Update docs/ directory"
  ],
  "context": "Repository: ~/clawd/my-app\n\nScan src/**/*.ts for JSDoc comments.\n\nFor each public function/class:\n1. Extract @param, @returns, @example tags\n2. Generate markdown entry\n3. Organize by module\n4. Create docs/API.md\n\nFormat:\n## ModuleName\n### functionName(param1, param2)\nDescription...\n**Parameters:**\n- `param1` (type): description\n**Returns:** type - description\n**Example:**\n```typescript\ncode example\n```",
  "nextSteps": [
    "Scan source files",
    "Extract JSDoc",
    "Format as markdown",
    "Save to docs/API.md",
    "Commit changes"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 4 * * *` (4 AM daily)

---

## Code Quality & Testing

### 7. Test Coverage Monitor

**Goal:** Identify untested code and add tests.

```json
{
  "name": "Test Coverage Bot",
  "description": "Find untested modules and write basic tests",
  "status": "active",
  "goals": [
    "Run coverage report",
    "Identify files with <50% coverage",
    "Write unit tests for critical functions",
    "Improve overall coverage by 5%"
  ],
  "context": "Repository: ~/clawd/my-app\n\nSteps:\n1. Run: npm run test:coverage\n2. Parse coverage report (coverage/lcov-report/index.html)\n3. Identify files with lowest coverage\n4. For each critical file:\n   - Read the source code\n   - Write unit tests in __tests__/\n   - Focus on edge cases and error paths\n5. Run tests to verify they pass\n6. Commit with message 'test: improve coverage for [module]'\n\nPriority: src/core/*.ts files first.",
  "nextSteps": [
    "Run coverage",
    "Find gaps",
    "Write tests",
    "Verify they pass",
    "Commit"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 1 * * 2` (Tuesdays at 1 AM)

---

### 8. Code Smell Detector

**Goal:** Find and refactor code smells.

```json
{
  "name": "Refactor Assistant",
  "description": "Identify code smells and suggest improvements",
  "status": "active",
  "goals": [
    "Find functions longer than 50 lines",
    "Detect duplicated code blocks",
    "Identify complex conditionals",
    "Suggest refactoring opportunities"
  ],
  "context": "Repository: ~/clawd/my-app\n\nLook for:\n- Functions > 50 lines → suggest splitting\n- Cyclomatic complexity > 10 → suggest simplifying\n- Duplicated code → suggest extracting function\n- Deep nesting (>3 levels) → suggest early returns\n\nFor each issue:\n1. Create entry in REFACTOR-LOG.md\n2. Include file, line, and suggestion\n3. Estimate effort (small/medium/large)\n\nDon't make changes automatically, just report.",
  "nextSteps": [
    "Scan source files",
    "Calculate complexity metrics",
    "Find code smells",
    "Generate report",
    "Save to REFACTOR-LOG.md"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 8 * * 5` (Fridays at 8 AM)

---

## DevOps & Monitoring

### 9. Build Health Monitor

**Goal:** Check build status and notify on failures.

```json
{
  "name": "Build Monitor",
  "description": "Monitor CI/CD pipelines and report issues",
  "status": "active",
  "goals": [
    "Check latest CI run status",
    "Identify failing tests",
    "Parse error logs",
    "Post summary to Discord"
  ],
  "context": "Repository: ~/clawd/my-app\n\nCheck GitHub Actions status:\n1. gh run list --limit 5\n2. For failed runs: gh run view <run-id>\n3. Parse logs for error messages\n4. Identify failing test names\n5. Create summary:\n   - Which tests failed\n   - Error messages\n   - Commit that broke it\n   - Link to run\n6. Post to Discord if failures\n\nRequires: gh CLI tool installed and authenticated.",
  "nextSteps": [
    "Check CI status",
    "Parse failures",
    "Generate summary",
    "Post to Discord"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `*/30 * * * *` (Every 30 minutes)

---

### 10. Log Analyzer

**Goal:** Analyze application logs for errors.

```json
{
  "name": "Log Analyzer",
  "description": "Scan logs for errors and patterns",
  "status": "active",
  "goals": [
    "Parse recent log files",
    "Count error types",
    "Identify new error patterns",
    "Create daily digest"
  ],
  "context": "Log files: ~/clawd/my-app/logs/*.log\n\nAnalyze logs from last 24 hours:\n1. Parse all ERROR and WARN lines\n2. Group by error message pattern\n3. Count occurrences\n4. Identify:\n   - New errors (first seen today)\n   - Spike in existing errors\n   - Critical errors (DB, auth, etc.)\n5. Create LOG-DIGEST.md with:\n   - Top 10 errors\n   - New patterns\n   - Recommended actions\n\nFormat counts as: [ERROR_NAME] (count): first line of message",
  "nextSteps": [
    "Read log files",
    "Parse errors",
    "Group and count",
    "Generate digest"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 6 * * *` (6 AM daily)

---

## Content & Writing

### 11. Changelog Maintainer

**Goal:** Generate changelog from commits.

```json
{
  "name": "Changelog Bot",
  "description": "Update CHANGELOG.md with recent commits",
  "status": "active",
  "goals": [
    "Parse git commits since last release",
    "Group by type (feat, fix, chore)",
    "Format as changelog entry",
    "Prepend to CHANGELOG.md"
  ],
  "context": "Repository: ~/clawd/my-app\n\nGenerate weekly changelog:\n1. Get commits: git log --since='7 days ago' --pretty=format:'%s'\n2. Parse conventional commits:\n   - feat: → Features\n   - fix: → Bug Fixes\n   - docs: → Documentation\n   - chore: → Chores\n3. Format as markdown:\n## [Unreleased] - YYYY-MM-DD\n### Features\n- Added X\n### Bug Fixes\n- Fixed Y\n4. Prepend to CHANGELOG.md\n5. Commit with message 'docs: update changelog'",
  "nextSteps": [
    "Get recent commits",
    "Parse and categorize",
    "Format as markdown",
    "Update CHANGELOG.md"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 9 * * 1` (Monday mornings)

---

### 12. Blog Post Proofreader

**Goal:** Check blog drafts for typos and clarity.

```json
{
  "name": "Writing Assistant",
  "description": "Proofread blog posts and suggest improvements",
  "status": "active",
  "goals": [
    "Check spelling and grammar",
    "Suggest clearer phrasing",
    "Verify code examples work",
    "Check link validity"
  ],
  "context": "Blog posts: ~/clawd/my-blog/content/posts/*.md\n\nFor each draft (files modified in last 24h):\n1. Check spelling and grammar\n2. Verify:\n   - Headers are hierarchical\n   - Code blocks have language tags\n   - Links are not broken\n   - Images exist and have alt text\n3. Test code examples if possible\n4. Suggest improvements for:\n   - Passive voice\n   - Long sentences (>30 words)\n   - Unclear technical terms\n5. Create REVIEW.md with feedback\n\nDon't modify original files, just create review notes.",
  "nextSteps": [
    "Find draft posts",
    "Check spelling/grammar",
    "Verify formatting",
    "Test code",
    "Create review"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 20 * * *` (8 PM daily)

---

## Research & Learning

### 13. Documentation Crawler

**Goal:** Summarize changes in library documentation.

```json
{
  "name": "Docs Watcher",
  "description": "Monitor library docs for API changes",
  "status": "active",
  "goals": [
    "Check documentation sites for updates",
    "Identify API changes",
    "Summarize what's new",
    "Create migration guide if needed"
  ],
  "context": "Libraries to watch:\n- React: https://react.dev/blog\n- TypeScript: https://devblogs.microsoft.com/typescript/\n- Node.js: https://nodejs.org/en/blog/\n\nFor each:\n1. Fetch latest blog posts\n2. Check for version announcements\n3. Identify breaking changes\n4. Extract migration notes\n5. Create summary in TECH-UPDATES.md\n6. Flag critical updates in Discord\n\nFocus on libraries we use (check package.json).",
  "nextSteps": [
    "Fetch blog feeds",
    "Parse for updates",
    "Extract key points",
    "Create summary"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 10 * * 1,4` (Mondays and Thursdays)

---

### 14. Stack Overflow Monitor

**Goal:** Track questions related to your project.

```json
{
  "name": "SO Monitor",
  "description": "Find and answer Stack Overflow questions about our library",
  "status": "active",
  "goals": [
    "Search for questions mentioning our project",
    "Identify unanswered questions",
    "Draft helpful responses",
    "Report in digest"
  ],
  "context": "Project name: my-awesome-lib\n\nSearch Stack Overflow for:\n1. Tag: [my-awesome-lib]\n2. Recent questions (last 7 days)\n3. Unanswered questions\n\nFor each question:\n1. Read the question and code\n2. Check if it's a bug, usage issue, or feature request\n3. Draft a helpful answer\n4. Save to SO-RESPONSES.md for human review\n5. If it's a bug, create GitHub issue\n\nDon't post automatically - save drafts for review.",
  "nextSteps": [
    "Search Stack Overflow API",
    "Filter relevant questions",
    "Draft responses",
    "Save for review"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 11 * * *` (11 AM daily)

---

## Advanced Patterns

### 15. Multi-Project Orchestrator

**Goal:** Coordinate work across multiple related projects.

```json
{
  "name": "Monorepo Sync",
  "description": "Keep related projects in sync",
  "status": "active",
  "goals": [
    "Update shared types across packages",
    "Bump version numbers consistently",
    "Run tests in all packages",
    "Create unified changelog"
  ],
  "context": "Monorepo: ~/clawd/my-monorepo/\nPackages: packages/core, packages/ui, packages/cli\n\nWhen core changes:\n1. Bump core version\n2. Update dependents in other packages\n3. Run lerna bootstrap or npm workspaces install\n4. Run tests in all packages\n5. Update root CHANGELOG.md\n6. Commit with message 'chore: sync packages'\n\nEnsure version consistency across workspace.",
  "nextSteps": [
    "Check for changes",
    "Update versions",
    "Install dependencies",
    "Run tests",
    "Update changelog"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 3 * * *` (3 AM daily)

---

### 16. Conditional Workflow

**Goal:** Run different tasks based on repository state.

```json
{
  "name": "Smart Assistant",
  "description": "Adapt work based on repo state",
  "status": "active",
  "goals": [
    "Check repository state",
    "Choose appropriate task",
    "Execute and report"
  ],
  "context": "Repository: ~/clawd/my-app\n\nDecision tree:\n\nIF branch = main AND tests failing:\n  → Focus on fixing tests\n  \nELSE IF open PRs > 5:\n  → Review and provide feedback\n  \nELSE IF last commit > 7 days ago:\n  → Update dependencies\n  \nELSE IF test coverage < 70%:\n  → Write tests\n  \nELSE:\n  → Run standard cleanup (lint, format)\n\nAlways commit work with appropriate message.",
  "nextSteps": [
    "Check repo state",
    "Decide on task",
    "Execute chosen work",
    "Report outcome"
  ],
  "hoursSpent": 0
}
```

**Schedule:** `0 2 * * *` (2 AM daily)

---

### 17. Event-Driven Responder (Future: File Watchers)

**Goal:** React to file changes immediately.

```json
{
  "name": "Hot Reactor",
  "description": "Respond to specific file changes",
  "status": "active",
  "goals": [
    "Watch for changes in critical files",
    "Trigger appropriate actions",
    "Validate changes",
    "Report issues immediately"
  ],
  "context": "Watch:\n- package.json → Run npm install, check for security issues\n- .env.example → Update documentation\n- tsconfig.json → Rebuild project, check for errors\n- schema.sql → Regenerate types\n\nFor each trigger:\n1. Identify which file changed\n2. Run appropriate action\n3. Report success/failure to Discord immediately\n4. On failure, create GitHub issue",
  "nextSteps": [
    "Detect file change",
    "Run validation",
    "Execute action",
    "Report result"
  ],
  "hoursSpent": 0
}
```

**Event type:** `file` (Phase 3 feature)  
**Trigger:** `file:~/clawd/my-app/{package.json,.env.example,tsconfig.json}`

---

## Tips for Creating Effective Projects

### 1. Be Specific

❌ **Bad:**
```json
{
  "context": "Work on the project",
  "nextSteps": ["Make improvements"]
}
```

✅ **Good:**
```json
{
  "context": "Repository: ~/clawd/my-app. Focus on src/auth/ module. Update to use JWT instead of sessions. Ensure tests pass.",
  "nextSteps": [
    "Read current auth implementation",
    "Install jsonwebtoken library",
    "Refactor auth.ts to use JWT",
    "Update tests",
    "Verify integration tests pass"
  ]
}
```

### 2. Include Commands

The AI can run shell commands. Tell it exactly what to run:

```json
{
  "context": "Run these commands in order:\n1. npm install\n2. npm run build\n3. npm test\n4. If tests pass, commit with 'build: rebuild after dependency update'"
}
```

### 3. Define Success Criteria

```json
{
  "goals": [
    "Test coverage > 80%",
    "All linter warnings fixed",
    "Documentation updated with examples",
    "Changes committed with conventional commit message"
  ]
}
```

### 4. Handle Failures Gracefully

```json
{
  "context": "...\n\nIf tests fail:\n1. Don't commit changes\n2. Revert changes: git checkout .\n3. Report failure details\n4. Create issue in GitHub with error log"
}
```

### 5. Limit Scope

Don't try to do too much in one session:

```json
{
  "goals": [
    "Refactor one module at a time",
    "Start with smallest file",
    "Maximum 3 files per session"
  ]
}
```

---

## Combining Projects

Create complementary projects that work together:

**Morning:** Dependency updates  
**Afternoon:** Run tests  
**Evening:** Generate reports  
**Night:** Code cleanup  

Stagger schedules so they don't conflict:

```bash
awm create-event proj-deps "0 9 * * 1"    # Monday 9 AM
awm create-event proj-tests "0 14 * * 1"  # Monday 2 PM (after deps)
awm create-event proj-report "0 17 * * 1" # Monday 5 PM (after tests)
awm create-event proj-cleanup "0 2 * * 2" # Tuesday 2 AM (overnight)
```

---

## Template Project Structure

Use this as a starting point:

```json
{
  "id": "proj-xxx",
  "name": "Project Name",
  "description": "One-line summary",
  "status": "active",
  "goals": [
    "Specific, measurable goal 1",
    "Specific, measurable goal 2",
    "Specific, measurable goal 3"
  ],
  "context": "Repository: ~/path/to/repo\n\nDetailed context:\n- What to work on\n- Where files are located\n- Commands to run\n- What success looks like\n- How to handle failures\n\nConstraints:\n- Don't modify X\n- Always run tests before committing\n- Use conventional commit messages",
  "nextSteps": [
    "Step 1: Action verb",
    "Step 2: Action verb",
    "Step 3: Action verb",
    "Step 4: Commit changes"
  ],
  "createdAt": 0,
  "updatedAt": 0,
  "hoursSpent": 0
}
```

---

## More Examples

For more inspiration, check:
- [test-phase2.ts](./test-phase2.ts) - Mock examples used in testing
- [run-production.ts](./run-production.ts) - Production orchestrator setup
- Community examples (coming soon)

**Contribute your own examples via PR!**

---

**Ready to automate?** Start with a simple project and iterate. The AI learns from your instructions!
