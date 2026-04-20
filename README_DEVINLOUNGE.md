# DevinLounge — Developer Guidance MCP

**A comprehensive MCP (Model Context Protocol) server that aggregates development standards, coding guidelines, stack operations, workflows, and editor configuration.**

DevinLounge consolidates knowledge from multiple projects (like hardhat) into reusable, genericized tools that help you maintain consistent coding practices and workflows across projects.

## 🎯 What It Does

When you open a code editor (Claude Code, Cursor, VS Code, etc.), DevinLounge provides:

1. **Code Guidelines** — Naming conventions, style rules, testing patterns, database design
2. **Stack Reference** — Commands and setup for Rails, Expo, FastAPI, Docker Compose
3. **Development Workflows** — Setup procedures, daily workflows, troubleshooting guides
4. **Editor Configuration** — Setup guides for Claude Code, Cursor, Antigravity, VS Code, Windsurf, Neovim
5. **Command Lookup** — Quick search for commands by goal across all stacks

## 📦 What's Included

### Tools (Query & Action)

#### Guidelines
- `naming-conventions` — Naming rules (general, Rails, TypeScript, Python)
- `code-style-guide` — Comments, functions, organization (avoid premature abstractions)
- `view-structure-guide` — Rails helpers, React hooks, Expo composition
- `testing-principles` — RSpec, Jest, Pytest, Playwright patterns
- `database-guidelines` — UUID policy, migrations, schema design

#### Stacks & Frameworks
- `stack-info` — Rails, Expo, FastAPI, Docker Compose details & commands
- `find-command` — Search commands by goal ("run tests", "migrate DB", etc.)
- `stack-comparison` — Compare two stacks side-by-side
- `mcp-lookup-priority` — Documentation lookup order per framework

#### Workflows
- `project-setup` — Fresh clone, existing env, new feature, local reset
- `dev-workflow` — Daily tasks: start day, tests, style, debug, DB changes
- `troubleshoot` — Fix containers, tests, ports, conflicts, dependencies, git

#### Editor Setup
- `editor-setup` — Configure Claude Code, Cursor, Antigravity, VS Code, Windsurf, Neovim
- `editor-recommendation` — Best editor for your task (review, debugging, refactoring, etc.)
- `editor-comparison` — Compare two editors side-by-side
- `mcp-integration` — Integrate MCP servers for docs & code search

#### Navigation
- `devinlounge-help` — Main help & category overview

### Resources (Structured Data)

- `code-guidelines-catalog` — Index of all guidelines
- `stacks-catalog` — Available stacks and runtimes
- `command-reference` — Commands grouped by goal
- `workflows-catalog` — All available workflows
- `editors-catalog` — Supported editors

## 🚀 Quick Start

### 1. Get Help
```
Use: devinlounge-help
```
Shows all available categories and tools.

### 2. Find Commands
```
Use: find-command "run tests"
```
Searches across all stacks for matching commands.

### 3. Setup a Project
```
Use: project-setup fresh-clone
```
Step-by-step guide for fresh clone, existing env, new feature, or local reset.

### 4. Configure Your Editor
```
Use: editor-setup cursor
```
Setup guide for any supported editor.

### 5. Daily Workflow
```
Use: dev-workflow start-day
```
Morning checklist: pull, dependencies, migrations, tests, dev servers.

### 6. Troubleshoot Issues
```
Use: troubleshoot container-wont-start
```
Diagnosis and fixes for common problems.

## 📂 Project Structure

```
mcp_devinlounge/
├── index.ts                              # Main MCP server & help tool
├── src/
│   ├── mcp-use-enhanced-server.ts       # Rails/Docker/Redis tools
│   ├── guidelines.ts                     # Code standards & best practices
│   ├── stacks.ts                         # Stack-specific commands & info
│   ├── workflows.ts                      # Setup, dev, troubleshooting workflows
│   └── editor-config.ts                  # Editor setup & configuration
├── package.json
├── tsconfig.json
└── README_DEVINLOUNGE.md                 # This file
```

## 🔧 How It Works

### For Claude Code Users
1. Open claude.ai/code
2. Open your project directory
3. Access DevinLounge tools in the MCP panel
4. Query: "naming-conventions" → Get naming rules for your task
5. Query: "find-command run tests" → Get test commands for all stacks

### For Cursor Users
1. Open Cursor
2. Open your project directory
3. Use Cursor Chat to query DevinLounge tools
4. @-mention MCP resources in prompts for context

### For VS Code / Terminal Users
1. Configure this MCP server in your editor settings
2. Query tools for guidance before writing code
3. Copy-paste commands from structured references

## 📚 Common Use Cases

### I'm starting a new project
```
→ project-setup fresh-clone
→ stack-info <your-stack>
```

### I need to know naming conventions
```
→ naming-conventions <context: general, rails, typescript, python>
```

### I want to run tests
```
→ find-command "run tests"
  OR
→ dev-workflow run-tests
```

### Something is broken
```
→ troubleshoot <issue-type>
```

### I'm setting up a new editor
```
→ editor-setup <editor>
```

### Which editor should I use?
```
→ editor-recommendation <task>
```

## 🎓 Information Architecture

### By Role

**Frontend Developer (Expo/React)**
- Start: `editor-setup cursor`
- Commands: `find-command typecheck` or `stack-info expo`
- Standards: `naming-conventions typescript` + `view-structure-guide react`

**Backend Developer (Rails)**
- Start: `editor-setup claude-code`
- Commands: `find-command migrate` or `stack-info rails`
- Standards: `naming-conventions rails` + `testing-principles rspec`
- Database: `database-guidelines uuid`

**Full-Stack Developer**
- Start: `project-setup fresh-clone`
- Daily: `dev-workflow start-day`
- Commands: `find-command <goal>` (searches all stacks)
- Standards: `code-style-guide` (applies to all)

**DevOps/Infrastructure**
- Commands: `stack-info docker_compose`
- Troubleshooting: `troubleshoot container-wont-start`

## 🔗 Integration

### With Existing Projects

Copy the `src/` directory into your project's MCP setup:
```bash
cp -r mcp_devinlounge/src/ your-project/.mcp-use/
```

Reference in your MCP configuration:
```json
{
  "mcpServers": {
    "devinlounge": {
      "command": "node",
      "args": ["path/to/index.js"]
    }
  }
}
```

### Customization

Each tool accepts parameters to narrow results:
- `naming-conventions context: "rails"` → Rails-specific naming
- `find-command goal: "run tests" stack: "rspec"` → RSpec only
- `editor-setup editor: "cursor"` → Cursor instructions
- `troubleshoot issue: "container-wont-start"` → Specific problem

## 📖 Data Sources

All information is extracted from and compatible with:
- hardhat project (CLAUDE.md, AGENTS.md, CODEX.md, ANTIGRAVITY.md)
- Best practices from Rails, Expo, FastAPI communities
- Docker Compose documentation
- MCP specification

### How to Update

To add new guidelines, stacks, or workflows:
1. Edit the relevant file in `src/`
2. Add new tool or update existing `key_commands` / `notes` / `steps`
3. Rebuild: `npm run build`
4. Restart your editor's MCP server

## 🛠️ Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Deploy
```bash
npm run deploy
```

## 📋 Version History

### v2.0.0 (Current)
- Added guidelines (naming, style, testing, database)
- Added stacks reference (Rails, Expo, FastAPI, Docker)
- Added workflows (setup, daily, troubleshooting)
- Added editor configuration (6 supported editors)
- Consolidated from hardhat project documentation

### v1.0.0
- Initial MCP server scaffold with Rails/Docker/Redis tools

## 🤝 Contributing

To improve DevinLounge:
1. Identify missing guidance
2. Add to relevant tool in `src/`
3. Test with your editor
4. Submit PR

---

**DevinLounge** is your always-available developer assistant. Access it whenever you need guidance on code standards, commands, workflows, or editor setup.

For quick help: Use `devinlounge-help` in any MCP interface.
