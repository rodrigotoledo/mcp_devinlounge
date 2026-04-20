import { object, text, type MCPServer } from "mcp-use/server";
import { z } from "zod";

interface StackInfo {
  name: string;
  description: string;
  path: string;
  runtime: string;
  key_commands: Record<string, string>;
  notes: string[];
}

const STACKS: Record<string, StackInfo> = {
  rails: {
    name: "Rails",
    description: "Ruby on Rails backend with PostgreSQL, Redis, Sidekiq",
    path: "hardhat-fullstack/",
    runtime: "Docker Compose (fullstack service)",
    key_commands: {
      migrate: "docker compose exec fullstack bin/rails db:migrate",
      console: "docker compose exec fullstack bin/rails console",
      tests: "docker compose exec fullstack bin/rspec",
      lint: "docker compose exec fullstack bin/rubocop",
      "security-scan": "docker compose exec fullstack bundle exec brakeman",
      "gem-install": "docker compose exec fullstack bundle install",
      "new-migration":
        "docker compose exec fullstack bin/rails generate migration NameDescriptive",
    },
    notes: [
      "Always use Docker Compose from repo root for runtime commands",
      "Default to PostgreSQL native UUID for new tables",
      "RSpec only (no Minitest)",
      "Keep views focused on rendering, use helpers for logic",
      "Use FactoryBot for test fixtures",
      "Validate only at API boundaries (user input)",
    ],
  },
  expo: {
    name: "Expo / React Native",
    description: "React Native mobile app with Expo Router, TypeScript, NativeWind",
    path: "hardhat-expo/",
    runtime: "Host Node.js / npm (NOT Docker)",
    key_commands: {
      typecheck: "cd hardhat-expo && npm run typecheck",
      start: "cd hardhat-expo && npx expo start",
      test: "cd hardhat-expo && npm run test",
      lint: "cd hardhat-expo && npm run lint",
    },
    notes: [
      "Run on host machine, NOT in Docker",
      "Prefer className with Tailwind/NativeWind utilities",
      "Use style={{}} only for dynamic values, animations, third-party",
      "Keep component logic in hooks/utils, not inline JSX",
      "Use theme/colors.ts for programmatic color access",
    ],
  },
  fastapi: {
    name: "FastAPI",
    description: "Python async API with SQLAlchemy, Pydantic",
    path: "hardhat-backend/",
    runtime: "Docker Compose (api service)",
    key_commands: {
      migrate: "docker compose exec api alembic upgrade head",
      "db-new-migration": "docker compose exec api alembic revision --autogenerate",
      tests: "docker compose exec api pytest",
      shell: "docker compose exec api python -c '...'",
      lint: "docker compose exec api ruff check",
      format: "docker compose exec api ruff format",
    },
    notes: [
      "Always use Docker Compose from repo root",
      "Use Pydantic models for request/response validation",
      "Async functions throughout",
      "Type hints required",
      "SQLAlchemy with async drivers",
    ],
  },
  docker_compose: {
    name: "Docker Compose (Infrastructure)",
    description: "Orchestrates Rails, FastAPI, PostgreSQL, Redis",
    path: "docker-compose.yml",
    runtime: "Docker Compose",
    key_commands: {
      up: "docker compose up --build",
      "up-detached": "docker compose up -d --build",
      down: "docker compose down",
      logs: "docker compose logs -f <service>",
      exec: "docker compose exec <service> <command>",
      restart: "docker compose restart <service>",
    },
    notes: [
      "Run all commands from repo root where docker-compose.yml lives",
      "Use docker compose exec when services are running",
      "Use docker compose run --rm for one-shot commands",
      "After Gemfile changes: docker compose build fullstack",
      "Services: fullstack (Rails), fullstack-worker (Sidekiq), api (FastAPI), postgres, redis",
    ],
  },
};

export function registerStackTools(server: MCPServer) {
  // Individual stack info
  server.tool(
    {
      name: "stack-info",
      description: "Get detailed information about a specific stack/framework",
      schema: z.object({
        stack: z
          .enum(["rails", "expo", "fastapi", "docker_compose"])
          .describe("Which stack to learn about"),
      }),
    },
    async ({ stack }) => {
      const info = STACKS[stack];
      if (!info)
        return text(`Stack '${stack}' not found. Available: ${Object.keys(STACKS).join(", ")}`);

      const formatted = `
# ${info.name}

**Description:** ${info.description}
**Path:** \`${info.path}\`
**Runtime:** ${info.runtime}

## Key Commands

${Object.entries(info.key_commands)
  .map(([cmd, cmdText]) => `- **${cmd}:** \`${cmdText}\``)
  .join("\n")}

## Important Notes

${info.notes.map((note) => `- ${note}`).join("\n")}
`;

      return text(formatted);
    }
  );

  // Command lookup across stacks
  server.tool(
    {
      name: "find-command",
      description: "Search for a command across all stacks",
      schema: z.object({
        goal: z
          .string()
          .describe("What you want to do (e.g., 'run tests', 'start dev server', 'migrate DB')"),
        stack: z
          .enum(["rails", "expo", "fastapi", "docker_compose", "any"])
          .default("any")
          .optional(),
      }),
    },
    async ({ goal, stack }) => {
      const goal_lower = goal.toLowerCase();
      const matches: Array<{ stack: string; command: string; full: string }> = [];

      const stacks_to_search =
        stack === "any" ? Object.keys(STACKS) : [stack];

      for (const stack_name of stacks_to_search) {
        const info = STACKS[stack_name as keyof typeof STACKS];
        if (!info) continue;

        Object.entries(info.key_commands).forEach(([cmd, cmdText]: [string, string]) => {
          if (
            cmd.toLowerCase().includes(goal_lower) ||
            cmdText.toLowerCase().includes(goal_lower)
          ) {
            matches.push({ stack: stack_name || '', command: cmd, full: cmdText });
          }
        });
      }

      if (matches.length === 0) {
        return text(`No commands found matching "${goal}".

Try searching for: migrate, test, console, lint, start, up, down, logs, exec`);
      }

      const result = matches
        .map(
          (m) =>
            `**${m.stack}** (${m.command})\n\`${m.full}\``
        )
        .join("\n\n");

      return text(`Found ${matches.length} matching command(s):\n\n${result}`);
    }
  );

  // Stack comparison
  server.tool(
    {
      name: "stack-comparison",
      description: "Compare two stacks side-by-side",
      schema: z.object({
        stack1: z
          .enum(["rails", "expo", "fastapi", "docker_compose"])
          .describe("First stack to compare"),
        stack2: z
          .enum(["rails", "expo", "fastapi", "docker_compose"])
          .describe("Second stack to compare"),
      }),
    },
    async ({ stack1, stack2 }) => {
      const info1 = STACKS[stack1];
      const info2 = STACKS[stack2];

      if (!info1 || !info2) {
        return text("Invalid stack names");
      }

      const comparison = `
# ${info1.name} vs ${info2.name}

| Aspect | ${info1.name} | ${info2.name} |
|--------|${"-".repeat(info1.name.length + 2)}|${"-".repeat(info2.name.length + 2)}|
| Description | ${info1.description} | ${info2.description} |
| Path | \`${info1.path}\` | \`${info2.path}\` |
| Runtime | ${info1.runtime} | ${info2.runtime} |

## ${info1.name} Key Commands
${Object.entries(info1.key_commands)
  .map(([cmd, cmdText]) => `- **${cmd}:** \`${cmdText}\``)
  .join("\n")}

## ${info2.name} Key Commands
${Object.entries(info2.key_commands)
  .map(([cmd, cmdText]) => `- **${cmd}:** \`${cmdText}\``)
  .join("\n")}
`;

      return text(comparison);
    }
  );

  // MCP Priority Policy
  server.tool(
    {
      name: "mcp-lookup-priority",
      description: "Get the recommended lookup order for documentation",
      schema: z.object({
        for_stack: z
          .enum(["rails", "python", "docker", "javascript", "any"])
          .default("any"),
      }),
    },
    async ({ for_stack }) => {
      const priorities = {
        any: [
          "1. Project code and local docs",
          "2. Configured MCP servers",
          "3. Official framework/package docs",
          "4. Web search as fallback",
        ],
        rails: [
          "1. Project code (app/, spec/, db/migrate/)",
          "2. CLAUDE.md & AGENTS.md in this repo",
          "3. Configured MCP (Rails, Docker, Ruby docs)",
          "4. Rails official guides",
          "5. Web search",
        ],
        python: [
          "1. Project code (src/, tests/)",
          "2. Configured MCP (Python docs)",
          "3. Framework docs (FastAPI, SQLAlchemy, etc)",
          "4. Official Python docs",
          "5. Web search",
        ],
        docker: [
          "1. docker-compose.yml in this repo",
          "2. Configured MCP (Docker docs)",
          "3. Docker official docs",
          "4. Web examples",
        ],
        javascript: [
          "1. Project code (src/, package.json)",
          "2. Configured MCP (Node/TypeScript docs)",
          "3. Framework docs (React, Expo, Next.js, etc)",
          "4. Official JavaScript docs",
          "5. Web search",
        ],
      };

      const result = priorities[for_stack] || priorities.any;
      return text(
        `**Lookup Priority for ${for_stack}:**\n\n${result.join("\n")}`
      );
    }
  );

  // Resource: Stack Catalog
  server.resource(
    {
      name: "stacks-catalog",
      title: "Available Stacks Catalog",
      uri: "devinlounge://stacks/catalog",
      description: "Complete catalog of all available stacks and their commands",
      mimeType: "application/json",
    },
    async () =>
      object({
        stacks: Object.keys(STACKS).map((key) => ({
          id: key,
          name: STACKS[key].name,
          path: STACKS[key].path,
          runtime: STACKS[key].runtime,
          summary: STACKS[key].description,
        })),
        key_principles: [
          "Rails/FastAPI: Always use Docker Compose from repo root",
          "Expo: Always run on host machine with Node.js",
          "Docker Compose: All commands from where docker-compose.yml lives",
          "MCP: Prefer local code + configured servers before web search",
        ],
      })
  );

  // Resource: Command Reference
  server.resource(
    {
      name: "command-reference",
      title: "Complete Command Reference",
      uri: "devinlounge://stacks/commands",
      description: "Quick lookup of all common commands by category",
      mimeType: "application/json",
    },
    async () => {
      const by_goal: Record<string, Record<string, string>> = {
        database: {
          "Rails Migrate":
            "docker compose exec fullstack bin/rails db:migrate",
          "Rails Rollback":
            "docker compose exec fullstack bin/rails db:rollback STEP=N",
          "FastAPI Migrate": "docker compose exec api alembic upgrade head",
          "View Schema": "docker compose exec fullstack bin/rails db:migrate:status",
        },
        testing: {
          "RSpec All": "docker compose exec fullstack bin/rspec",
          "RSpec File": "docker compose exec fullstack bin/rspec spec/models/user_spec.rb",
          "RSpec Pattern": "docker compose exec fullstack bin/rspec --pattern '**/user*'",
          "Pytest All": "docker compose exec api pytest",
          "Expo Typecheck": "cd hardhat-expo && npm run typecheck",
        },
        linting: {
          "RuboCop Check": "docker compose exec fullstack bin/rubocop",
          "RuboCop Auto-Fix": "docker compose exec fullstack bin/rubocop -A",
          "Ruff Check": "docker compose exec api ruff check",
          "Ruff Format": "docker compose exec api ruff format",
        },
        infrastructure: {
          "Start All": "docker compose up --build",
          "Start Detached": "docker compose up -d --build",
          "Stop All": "docker compose down",
          "Logs Rails": "docker compose logs -f fullstack",
          "Logs Worker": "docker compose logs -f fullstack-worker",
          "Logs API": "docker compose logs -f api",
          "Shell Rails": "docker compose exec fullstack bash",
          "Shell API": "docker compose exec api sh",
        },
      };

      return object(by_goal);
    }
  );
}
