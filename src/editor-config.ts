import { object, text, type MCPServer } from "mcp-use/server";
import { z } from "zod";

interface EditorSetup {
  name: string;
  type: string;
  config_path: string;
  description: string;
  setup_steps: string[];
  key_settings: Record<string, string>;
  recommended_extensions?: string[];
}

const EDITORS: Record<string, EditorSetup> = {
  "claude-code": {
    name: "Claude Code",
    type: "Web + CLI",
    config_path: ".claude/ (user) + project .claude/ directory",
    description: "Official Anthropic AI coding assistant integrated with Claude API",
    setup_steps: [
      "Visit claude.ai/code in your browser",
      "Select the project directory or use CLI: claude code .",
      "Check .claude/settings.json and .claude/settings.local.json for project-specific config",
      "Review CLAUDE.md in project root for repository-specific instructions",
    ],
    key_settings: {
      "model": "opus or sonnet (check CLAUDE.md for current recommendation)",
      "permissions":
        "Review permission prompts or pre-allow in .claude/settings.json",
      "hooks":
        "Custom commands can be registered in settings.json for automation",
      "memory":
        "Project memories stored in .claude/projects/.../memory/",
    },
    recommended_extensions: ["Claude Code CLI", "MCP Server integration"],
  },

  cursor: {
    name: "Cursor",
    type: "Desktop IDE (VS Code fork)",
    config_path: ".cursor/rules/ + .cursor/settings.json (optional)",
    description: "AI-first code editor with built-in Claude/GPT models",
    setup_steps: [
      "Download Cursor from https://cursor.com",
      "Open project folder",
      "Check .cursor/rules/ for project-specific Cursor rules",
      "If present, Cursor will auto-load .cursor/rules/*.mdc files",
      "Configure API key in Cursor Settings > Models",
    ],
    key_settings: {
      "composer": "Use for multi-file edits",
      "predictor": "Tab autocomplete using project context",
      "chat": "Inline chat for explaining code",
      "rules":
        "Project rules in .cursor/rules/*.mdc override global settings",
    },
    recommended_extensions: [
      "Codeium (free AI autocomplete)",
      "Aider (git-aware pair programming)",
      "Copilot (optional, for comparison)",
    ],
  },

  antigravity: {
    name: "Antigravity",
    type: "Custom AI Dev Environment",
    config_path: ".agents/workflows/ + .agents/rules/ + config files",
    description: "Custom development environment with specialized agents and workflows",
    setup_steps: [
      "Check .agents/ directory for custom workflows",
      "Look for .agents/workflows/ containing available commands",
      "Review .antigravity.md or ANTIGRAVITY.md for context",
      "Available commands: /run-app, /run-tests, /run-rails-console, etc.",
      "Use /help in Antigravity chat to see available commands",
    ],
    key_settings: {
      "workflows":
        "Specialized commands in .agents/workflows/ (e.g., /run-app, /run-tests)",
      "agents":
        "Custom agent definitions in .agents/ for domain-specific tools",
      "rules": "Domain rules in .agents/rules/ or project CLAUDE.md",
    },
    recommended_extensions: [
      "Custom .agents/workflows/ for project-specific commands",
    ],
  },

  "vs-code": {
    name: "VS Code / Code-OSS",
    type: "Desktop IDE",
    config_path: ".vscode/settings.json + .vscode/extensions.json",
    description: "Open-source code editor with extensive extension ecosystem",
    setup_steps: [
      "Install VS Code or Code-OSS (open-source fork)",
      "Install recommended extensions: code --install-extension <ext>",
      "Check .vscode/settings.json for project-specific settings",
      "Open VS Code integrated terminal for running commands",
      "Install Copilot or Codeium for AI assistance",
    ],
    key_settings: {
      "formatOnSave": "true (auto-format with configured formatter)",
      "ruler": "80, 120 (visual guides)",
      "theme": "Adjust in settings or command palette",
      "rubocop.useBundler": "false if no root Gemfile",
    },
    recommended_extensions: [
      "Ruby (from VS Code marketplace)",
      "ERB (template syntax)",
      "ESLint (JavaScript/TypeScript)",
      "Prettier (formatting)",
      "GitLens (git integration)",
      "Docker (container management)",
      "Code Runner (quick script execution)",
      "Copilot or Codeium (AI assistance)",
    ],
  },

  windsurf: {
    name: "Windsurf",
    type: "Desktop IDE",
    config_path: ".windsurfrules (optional project rules file)",
    description: "AI-powered IDE by Codeium with integrated code generation",
    setup_steps: [
      "Download Windsurf from https://codeium.com/windsurf",
      "Open project folder",
      "If .windsurfrules exists, it will be loaded automatically",
      "Configure API in Windsurf settings",
      "Use Cascade (agentic flow) for multi-step code generation",
    ],
    key_settings: {
      "cascade":
        "Multi-step code generation with reflection and refinement",
      "inline-edit": "Quick edits directly in code",
      "context": "Project rules from .windsurfrules",
    },
  },

  neovim: {
    name: "Neovim",
    type: "Terminal IDE",
    config_path: ".config/nvim/ (personal config, not committed)",
    description: "Highly customizable terminal-based editor",
    setup_steps: [
      "Install Neovim: brew install neovim (or via Linuxbrew)",
      "Configure in ~/.config/nvim/init.lua or init.vim",
      "Install LSP servers: Mason plugin (recommended)",
      "Add AI plugin: e.g., codeium.vim, copilot.vim",
      "Install Telescope for fuzzy search and LSP features",
    ],
    key_settings: {
      "lsp":
        "Neovim 0.5+ has built-in LSP support (use nvim-lspconfig)",
      "ai": "Install copilot.vim, codeium.vim, or similar",
      "keymap": "Customize with your preferences",
    },
    recommended_extensions: [
      "nvim-lspconfig (language server config)",
      "mason.nvim (LSP/tool installer)",
      "telescope.nvim (fuzzy finder)",
      "nvim-treesitter (syntax highlighting)",
      "copilot.vim or codeium.vim (AI)",
    ],
  },
};

export function registerEditorConfigTools(server: MCPServer) {
  // Editor Setup Guide
  server.tool(
    {
      name: "editor-setup",
      description: "Get setup instructions for a specific code editor",
      schema: z.object({
        editor: z
          .enum([
            "claude-code",
            "cursor",
            "antigravity",
            "vs-code",
            "windsurf",
            "neovim",
          ])
          .describe("Which editor to set up"),
      }),
    },
    async ({ editor }) => {
      const setup = EDITORS[editor];
      if (!setup) {
        return text(`Editor '${editor}' not found`);
      }

      const formatted = `
# ${setup.name} Setup Guide

**Type:** ${setup.type}
**Config Path:** \`${setup.config_path}\`

## Description
${setup.description}

## Setup Steps
${setup.setup_steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}

## Key Settings
${Object.entries(setup.key_settings)
  .map(([key, value]) => `- **${key}:** ${value}`)
  .join("\n")}

${
  setup.recommended_extensions
    ? `
## Recommended Extensions/Plugins
${setup.recommended_extensions.map((ext) => `- ${ext}`).join("\n")}
`
    : ""
}

## Quick Start
\`\`\`bash
# Open this project in ${setup.name}
${
  editor === "claude-code"
    ? "claude code ."
    : editor === "cursor"
      ? "cursor ."
      : editor === "vs-code"
        ? "code ."
        : "Open manually in your editor"
}
\`\`\`
`;

      return text(formatted);
    }
  );

  // Recommended Editor for Task
  server.tool(
    {
      name: "editor-recommendation",
      description: "Get recommended editor for a specific task",
      schema: z.object({
        task: z
          .enum([
            "code-review",
            "debugging",
            "large-refactor",
            "quick-edit",
            "ai-pair",
            "terminal-work",
          ])
          .default("code-review"),
      }),
    },
    async ({ task }) => {
      const recommendations = {
        "code-review": {
          best: "Claude Code",
          why: "Integrated Claude AI for code review, context understanding, and suggestions",
          alternative: "Cursor (Composer for multi-file review)",
        },

        debugging: {
          best: "VS Code + RubyDebugger / Debugpy",
          why: "Excellent breakpoint support, watch variables, debug console",
          alternative: "Cursor (with integrated terminal for logs)",
        },

        "large-refactor": {
          best: "Windsurf (Cascade)",
          why: "Agentic multi-step refactoring with reflection",
          alternative: "Cursor (Composer for coordinated changes)",
        },

        "quick-edit": {
          best: "Cursor",
          why: "Fast, inline edits, prediction-based autocomplete",
          alternative: "Neovim (terminal-native, fastest if you know vim)",
        },

        "ai-pair": {
          best: "Cursor (Composer) or Claude Code",
          why: "Cursor for real-time pairing, Claude Code for deep analysis",
          alternative: "Windsurf (Cascade for structured generation)",
        },

        "terminal-work": {
          best: "Neovim",
          why: "Native terminal, all git/shell commands available, fast",
          alternative: "VS Code (integrated terminal, more accessible)",
        },
      };

      const rec = recommendations[task];
      if (!rec) {
        return text("Task not recognized");
      }

      return text(`
# Recommended Editor for "${task}"

**Best Choice:** ${rec.best}

**Why:** ${rec.why}

**Alternative:** ${rec.alternative}

## Next Steps
1. Make sure you have the editor installed
2. Use "editor-setup" tool to configure it
3. Open your project and start coding
`);
    }
  );

  // Editor Comparison
  server.tool(
    {
      name: "editor-comparison",
      description: "Compare two editors side-by-side",
      schema: z.object({
        editor1: z
          .enum([
            "claude-code",
            "cursor",
            "antigravity",
            "vs-code",
            "windsurf",
            "neovim",
          ])
          .describe("First editor"),
        editor2: z
          .enum([
            "claude-code",
            "cursor",
            "antigravity",
            "vs-code",
            "windsurf",
            "neovim",
          ])
          .describe("Second editor"),
      }),
    },
    async ({ editor1, editor2 }) => {
      const e1 = EDITORS[editor1];
      const e2 = EDITORS[editor2];

      if (!e1 || !e2) {
        return text("Invalid editor names");
      }

      const comparison = `
# ${e1.name} vs ${e2.name}

| Aspect | ${e1.name} | ${e2.name} |
|--------|${"-".repeat(e1.name.length + 2)}|${"-".repeat(e2.name.length + 2)}|
| Type | ${e1.type} | ${e2.type} |
| Config | \`${e1.config_path}\` | \`${e2.config_path}\` |
| Learn Curve | Varies | Varies |

## ${e1.name}
${e1.description}

## ${e2.name}
${e2.description}

## When to Use Each
- **${e1.name}:** ${e1.setup_steps[0]}
- **${e2.name}:** ${e2.setup_steps[0]}
`;

      return text(comparison);
    }
  );

  // Project-specific MCP Configuration
  server.tool(
    {
      name: "mcp-integration",
      description: "Guide for integrating MCP servers into your editor",
      schema: z.object({
        editor: z
          .enum(["claude-code", "cursor", "vs-code"])
          .default("claude-code"),
        purpose: z
          .enum(["documentation", "code-search", "framework-docs", "all"])
          .default("all"),
      }),
    },
    async ({ editor, purpose }) => {
      const integrations = {
        "claude-code": `
# MCP Integration with Claude Code

## What are MCPs?
Model Context Protocols (MCPs) are servers that provide specialized tools and resources to Claude:
- **Documentation lookups** (React, Rails, Next.js, etc.)
- **Repository operations** (code search, file operations)
- **External integrations** (Stripe, GitHub, etc.)

## Configure MCP in Claude Code
MCPs are configured in \`.claude/settings.json\` in the project root.

Example:
\`\`\`json
{
  "mcpServers": {
    "rails-docs": {
      "command": "node",
      "args": ["path/to/mcp-server.js"]
    }
  }
}
\`\`\`

## Available MCPs for This Project
- **code search** - Search codebase using patterns
- **documentation** - Query framework docs (Rails, React, etc.)
- **git** - Repository operations
- **filesystem** - File and directory operations

## Usage
Once configured, MCPs appear in the Claude Code interface:
1. Open "MCP Server" panel
2. Browse available tools and resources
3. Use them in your chat to get accurate, up-to-date info

## Benefits
- Get latest docs without web search
- Search code efficiently
- Reduced context window usage
- Faster, more accurate responses
`,

        cursor: `
# MCP Integration with Cursor

Cursor supports MCPs through its configuration:

## Setup
1. Open Cursor Settings (Ctrl+,)
2. Search for "MCP"
3. Configure MCP servers in settings

## Configuration Example
\`\`\`json
{
  "mcpServers": {
    "rails": {
      "command": "node",
      "args": ["./mcp-rails-server.js"]
    }
  }
}
\`\`\`

## Available Tools in Chat
Once configured, use MCPs in Cursor Chat:
- Type @ to see available resources
- Use MCP tools in your prompts
- Get context from configured servers

## Benefits
- Accurate framework documentation
- Codebase search without hallucination
- Faster, more reliable responses
`,

        "vs-code": `
# MCP Integration with VS Code

VS Code can integrate MCPs through extensions or custom configurations.

## Setup Options
1. **Using CodeWhisperer / Copilot:** Configure through extension settings
2. **Using extension:** Install MCP client extension if available
3. **Manual:** Edit \`.vscode/settings.json\` for project-specific config

## Best Practices
- Use MCP for framework docs lookup
- Use extension marketplace for stable, maintained MCPs
- Test MCP availability before relying on it in workflows
`,
      };

      const content = integrations[editor] || integrations["claude-code"];

      let final = content;
      if (purpose !== "all") {
        final += `

## Focus: ${purpose}
When using MCPs primarily for **${purpose}**:
- Prioritize documentation servers for docs lookup
- Use code search MCPs for repository operations
- Enable only what you need to keep things responsive
`;
      }

      return text(final);
    }
  );

  // Resource: Editor Catalog
  server.resource(
    {
      name: "editors-catalog",
      title: "Available Editors Catalog",
      uri: "devinlounge://editors/catalog",
      description: "Complete catalog of supported editors and their setup",
      mimeType: "application/json",
    },
    async () =>
      object({
        editors: Object.entries(EDITORS).map(([key, info]) => ({
          id: key,
          name: info.name,
          type: info.type,
          config_path: info.config_path,
          summary: info.description.substring(0, 100) + "...",
        })),
        quick_start: {
          "AI Pair Programmer": "claude-code or cursor",
          "Terminal Developer": "neovim",
          "IDE User": "vs-code or windsurf",
          "All-in-one": "cursor or windsurf",
        },
      })
  );
}
