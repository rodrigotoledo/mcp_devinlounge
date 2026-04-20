import { MCPServer, object, text, widget } from "mcp-use/server";
import { z } from "zod";
import {
  registerEnhancedResources,
  registerEnhancedTools,
} from "./src/mcp-use-enhanced-server";
import { registerGuidelineTools } from "./src/guidelines";
import { registerStackTools } from "./src/stacks";
import { registerWorkflowTools } from "./src/workflows";
import { registerEditorConfigTools } from "./src/editor-config";

const server = new MCPServer({
  name: "devinlounge",
  title: "DevinLounge", // display name
  version: "2.0.0",
  description: "Developer guidance MCP with coding standards, stacks, workflows, and editor setup",
  baseUrl: process.env.MCP_URL || "http://localhost:3000", // Full base URL (e.g., https://myserver.com)
  favicon: "favicon.ico",
  websiteUrl: "https://mcp-use.com", // Can be customized later
  icons: [
    {
      src: "icon.svg",
      mimeType: "image/svg+xml",
      sizes: ["512x512"],
    },
  ],
});

/**
 * MAIN CATALOG TOOL
 * Entry point for exploring all available tools and resources
 */
server.tool(
  {
    name: "devinlounge-help",
    description: "Main help and navigation tool - browse all available guidance",
    schema: z.object({
      category: z
        .enum([
          "overview",
          "guidelines",
          "stacks",
          "workflows",
          "editors",
          "commands",
        ])
        .optional()
        .describe("Which category to explore"),
    }),
  },
  async ({ category }) => {
    if (!category || category === "overview") {
      return text(`
# DevinLounge — Developer Guidance MCP

Your comprehensive guide for development standards, stack operations, workflows, and editor setup.

## 📚 Categories

### **Guidelines** — Code Standards & Best Practices
Tools for naming conventions, code style, testing, database design:
- \`naming-conventions\` — Naming rules for variables, functions, classes
- \`code-style-guide\` — Comments, functions, organization patterns
- \`view-structure-guide\` — Rails/React/Expo view best practices
- \`testing-principles\` — RSpec, Jest, Pytest, Playwright patterns
- \`database-guidelines\` — UUID policy, migrations, schema design

### **Stacks** — Framework & Runtime Info
Get command references and setup for each stack:
- \`stack-info\` — Detailed info about Rails, Expo, FastAPI, Docker Compose
- \`find-command\` — Search commands by goal across all stacks
- \`stack-comparison\` — Compare two stacks side-by-side
- \`mcp-lookup-priority\` — Documentation lookup order

### **Workflows** — Development Processes
Step-by-step guides for common development tasks:
- \`project-setup\` — Fresh clone, existing env, new feature, local reset
- \`dev-workflow\` — Daily tasks: start, test, style, debug, DB changes
- \`troubleshoot\` — Fix common issues: containers, tests, ports, conflicts

### **Editors** — Setup & Configuration
Configure your development environment:
- \`editor-setup\` — Instructions for Claude Code, Cursor, Antigravity, VS Code, Windsurf, Neovim
- \`editor-recommendation\` — Best editor for your task
- \`editor-comparison\` — Compare editors side-by-side
- \`mcp-integration\` — Integrate MCP servers with your editor

### **Resources** — Catalogs & Quick Reference
Structured data for all tools and commands:
- \`code-guidelines-catalog\` — Index of all guidelines
- \`stacks-catalog\` — Available stacks and runtimes
- \`command-reference\` — Quick lookup by goal
- \`workflows-catalog\` — All available workflows
- \`editors-catalog\` — Supported editors

## 🚀 Quick Start

1. **Getting oriented?** → \`devinlounge-help guidelines\`
2. **Need a command?** → \`find-command "your goal"\`
3. **Setting up?** → \`project-setup fresh-clone\`
4. **Choosing editor?** → \`editor-recommendation\`
5. **Something broken?** → \`troubleshoot issue-name\`

## 💡 Pro Tips
- Use \`find-command\` with keywords like "test", "migrate", "start"
- \`stack-info rails\` shows all Rails commands
- \`editor-setup cursor\` walks through Cursor configuration
- Resources (catalogs) give you structured lookups

---

**Use \`devinlounge-help <category>\` to dive deeper into any section.**
`);
    }

    const category_info = {
      guidelines: `# Code Guidelines & Standards

Tools for maintaining consistent code quality across the project:

## Available Tools
- **naming-conventions** — Clear naming rules (avoid abbreviations, use domain names)
- **code-style-guide** — Comments (minimal), functions (task-scoped), organization
- **view-structure-guide** — Rails helpers, React hooks, Expo composition
- **testing-principles** — RSpec/Jest/Pytest patterns and best practices
- **database-guidelines** — UUID policy, migrations, types, schema design

## When to Use
- **Writing new code?** → Check \`naming-conventions\` + \`code-style-guide\`
- **Building views/components?** → Use \`view-structure-guide\`
- **Writing tests?** → Check \`testing-principles\` for your framework
- **Schema changes?** → Review \`database-guidelines uuid\`

## Access Catalog
\`\`\`
resource://devinlounge://guidelines/catalog
\`\`\`
`,

      stacks: `# Stacks & Frameworks

Commands and configuration for Rails, Expo, FastAPI, Docker Compose:

## Available Tools
- **stack-info** — Full details: description, commands, notes for any stack
- **find-command** — Search across stacks by goal ("run tests", "migrate DB", etc.)
- **stack-comparison** — Compare two stacks side-by-side
- **mcp-lookup-priority** — Docs lookup order for each framework

## Examples
- \`stack-info rails\` → All Rails commands & setup
- \`find-command "run tests"\` → Find test commands in any stack
- \`find-command "start" stack:docker_compose\` → Docker Compose start commands
- \`stack-comparison rails expo\` → Rails vs Expo comparison

## Access Catalogs
\`\`\`
resource://devinlounge://stacks/catalog
resource://devinlounge://stacks/commands
\`\`\`
`,

      workflows: `# Development Workflows

Step-by-step guides for setting up projects and daily development:

## Available Tools
- **project-setup** — Fresh clone, existing env, new feature, local reset
- **dev-workflow** — Daily tasks: start day, tests, style, debug, DB changes
- **troubleshoot** — Fix containers, tests, ports, conflicts, deps, git

## Common Scenarios
- **First time?** → \`project-setup fresh-clone\`
- **Daily start?** → \`dev-workflow start-day\`
- **Running tests?** → \`dev-workflow run-tests\`
- **Container won't start?** → \`troubleshoot container-wont-start\`

## Access Catalog
\`\`\`
resource://devinlounge://workflows/catalog
\`\`\`
`,

      editors: `# Editor Setup & Configuration

Configure Claude Code, Cursor, Antigravity, VS Code, Windsurf, Neovim:

## Available Tools
- **editor-setup** — Step-by-step setup for any editor
- **editor-recommendation** — Best editor for your task
- **editor-comparison** — Compare two editors side-by-side
- **mcp-integration** — Integrate MCP servers for docs & code search

## Examples
- \`editor-setup cursor\` → Cursor configuration guide
- \`editor-recommendation "large-refactor"\` → Best editor for refactoring
- \`editor-comparison cursor vs-code\` → Compare Cursor vs VS Code
- \`mcp-integration claude-code documentation\` → Set up MCP for docs

## Access Catalog
\`\`\`
resource://devinlounge://editors/catalog
\`\`\`
`,

      commands: `# Command Reference

Quick lookup of common commands by category:

## Search by Goal
Use \`find-command "goal"\` to search across all stacks:
- \`find-command "run tests"\`
- \`find-command "migrate"\`
- \`find-command "lint"\`
- \`find-command "start dev server"\`

## Access Full Reference
\`\`\`
resource://devinlounge://stacks/commands
\`\`\`

This resource groups commands by:
- database (migrations, rollbacks)
- testing (RSpec, Pytest, Expo)
- linting (RuboCop, Ruff)
- infrastructure (Docker Compose)
`,
    };

    const text_content = category_info[category as keyof typeof category_info];
    return text(text_content || "Unknown category");
  }
);

/**
 * LEGACY FRUIT EXAMPLE TOOLS (kept for backward compatibility)
 */
const fruits = [
  { fruit: "mango", color: "bg-[#FBF1E1] dark:bg-[#FBF1E1]/10" },
  { fruit: "pineapple", color: "bg-[#f8f0d9] dark:bg-[#f8f0d9]/10" },
  { fruit: "cherries", color: "bg-[#E2EDDC] dark:bg-[#E2EDDC]/10" },
  { fruit: "coconut", color: "bg-[#fbedd3] dark:bg-[#fbedd3]/10" },
  { fruit: "apricot", color: "bg-[#fee6ca] dark:bg-[#fee6ca]/10" },
  { fruit: "blueberry", color: "bg-[#e0e6e6] dark:bg-[#e0e6e6]/10" },
  { fruit: "grapes", color: "bg-[#f4ebe2] dark:bg-[#f4ebe2]/10" },
  { fruit: "watermelon", color: "bg-[#e6eddb] dark:bg-[#e6eddb]/10" },
  { fruit: "orange", color: "bg-[#fdebdf] dark:bg-[#fdebdf]/10" },
  { fruit: "avocado", color: "bg-[#ecefda] dark:bg-[#ecefda]/10" },
  { fruit: "apple", color: "bg-[#F9E7E4] dark:bg-[#F9E7E4]/10" },
  { fruit: "pear", color: "bg-[#f1f1cf] dark:bg-[#f1f1cf]/10" },
  { fruit: "plum", color: "bg-[#ece5ec] dark:bg-[#ece5ec]/10" },
  { fruit: "banana", color: "bg-[#fdf0dd] dark:bg-[#fdf0dd]/10" },
  { fruit: "strawberry", color: "bg-[#f7e6df] dark:bg-[#f7e6df]/10" },
  { fruit: "lemon", color: "bg-[#feeecd] dark:bg-[#feeecd]/10" },
];

server.tool(
  {
    name: "search-tools",
    description: "Search for fruits and display the results in a visual widget",
    schema: z.object({
      query: z.string().optional().describe("Search query to filter fruits"),
    }),
    widget: {
      name: "product-search-result",
      invoking: "Searching...",
      invoked: "Results loaded",
    },
  },
  async ({ query }) => {
    const results = fruits.filter(
      (f) => !query || f.fruit.toLowerCase().includes(query.toLowerCase())
    );

    // let's emulate a delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return widget({
      props: { query: query ?? "", results },
      output: text(
        `Found ${results.length} fruits matching "${query ?? "all"}"`
      ),
    });
  }
);

server.tool(
  {
    name: "get-fruit-details",
    description: "Get detailed information about a specific fruit",
    schema: z.object({
      fruit: z.string().describe("The fruit name"),
    }),
    outputSchema: z.object({
      fruit: z.string(),
      color: z.string(),
      facts: z.array(z.string()),
    }),
  },
  async ({ fruit }) => {
    const found = fruits.find(
      (f) => f.fruit?.toLowerCase() === fruit?.toLowerCase()
    );
    return object({
      fruit: found?.fruit ?? fruit,
      color: found?.color ?? "unknown",
      facts: [
        `${fruit} is a delicious fruit`,
        `Color: ${found?.color ?? "unknown"}`,
      ],
    });
  }
);

// Register all tool modules
registerEnhancedResources(server);
registerEnhancedTools(server);
registerGuidelineTools(server);
registerStackTools(server);
registerWorkflowTools(server);
registerEditorConfigTools(server);

server.listen().then(() => {
  console.log(`DevinLounge MCP server running`);
});
