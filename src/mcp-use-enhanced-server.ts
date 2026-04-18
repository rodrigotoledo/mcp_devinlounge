import { Buffer } from "buffer";
import { object, text, type MCPServer } from "mcp-use/server";
import { exec } from "node:child_process";
import process from "node:process";
import { promisify } from "node:util";
import { z } from "zod";

const execAsync = promisify(exec);

const config = {
  railsRoot: process.env.RAILS_ROOT || "./",
  railsService: process.env.RAILS_SERVICE || "app",
  dockerMode: process.env.USE_DOCKER === "true",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

async function commandOutput(command: string) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, stdout: "", stderr: message };
  }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function railsCommand(command: string) {
  return config.dockerMode
    ? `docker compose exec ${shellQuote(config.railsService)} ${command}`
    : `cd ${shellQuote(config.railsRoot)} && ${command}`;
}

function dockerComposeService(service: string) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(service)) {
    throw new Error(`Invalid Docker Compose service name: ${service}`);
  }
  return shellQuote(service);
}

export function registerEnhancedResources(server: MCPServer) {
  server.resource(
    {
      name: "devinlounge-enhanced-config",
      title: "DevinLounge Enhanced MCP Config",
      uri: "devinlounge://enhanced/config",
      description: "Runtime configuration for the enhanced Rails/Docker/Redis MCP layer.",
      mimeType: "application/json",
    },
    async () =>
      object({
        name: "devinlounge-mcp-enhanced",
        version: "2.0.0",
        railsRoot: config.railsRoot,
        railsService: config.railsService,
        dockerMode: config.dockerMode,
        redisUrl: config.redisUrl,
      })
  );

  server.resource(
    {
      name: "devinlounge-enhanced-capabilities",
      title: "DevinLounge Enhanced MCP Capabilities",
      uri: "devinlounge://enhanced/capabilities",
      description: "Read-only catalog of Rails, Docker, Redis, Turbo, and test capabilities.",
      mimeType: "application/json",
    },
    async () =>
      object({
        resources: [
          "devinlounge://enhanced/config",
          "devinlounge://enhanced/capabilities",
          "devinlounge://rails/status",
        ],
        suggestedTools: [
          "rails_console",
          "rails_migrations",
          "turbo_helpers",
          "redis_ops",
          "run_tests",
          "docker_services",
        ],
      })
  );

  server.resource(
    {
      name: "rails-status",
      title: "Rails Status",
      uri: "devinlounge://rails/status",
      description: "Read-only Rails project status collected from the configured Rails root.",
      mimeType: "application/json",
    },
    async () => {
      const routesCommand = config.dockerMode
        ? railsCommand("bin/rails routes")
        : `cd ${shellQuote(config.railsRoot)} && bin/rails routes`;
      const modelsCommand = config.dockerMode
        ? railsCommand(
            'bin/rails runner "puts ActiveRecord::Base.connection.tables.count"'
          )
        : `cd ${shellQuote(config.railsRoot)} && bin/rails runner "puts ActiveRecord::Base.connection.tables.count"`;

      const [routes, models] = await Promise.all([
        commandOutput(`${routesCommand} | wc -l`),
        commandOutput(modelsCommand),
      ]);

      return object({
        railsRoot: config.railsRoot,
        railsService: config.railsService,
        dockerMode: config.dockerMode,
        routesCount: routes.ok ? Number(routes.stdout) : null,
        modelsCount: models.ok ? Number(models.stdout) : null,
        errors: [routes, models]
          .filter((result) => !result.ok)
          .map((result) => result.stderr),
        timestamp: new Date().toISOString(),
      });
    }
  );
}

export function registerEnhancedTools(server: MCPServer) {
  server.tool(
    {
      name: "rails_console",
      description: "Execute Ruby code in Rails runner with optional Redis caching.",
      schema: z.object({
        code: z.string().describe("Ruby code to execute"),
        use_cache: z.boolean().default(true).describe("Use Redis cache for results"),
      }),
    },
    async ({ code, use_cache }) => {
      const cacheKey = `rails:console:${Buffer.from(code).toString("base64")}`;

      if (use_cache) {
        const cached = await commandOutput(
          `redis-cli -u ${shellQuote(config.redisUrl)} GET ${shellQuote(cacheKey)}`
        );
        if (cached.ok && cached.stdout) {
          return text(`Cached result:\n${cached.stdout}`);
        }
      }

      const result = await commandOutput(
        railsCommand(`bin/rails runner ${shellQuote(code)}`)
      );
      const output = result.stdout || result.stderr;

      if (use_cache && result.ok && output) {
        await commandOutput(
          `redis-cli -u ${shellQuote(config.redisUrl)} SETEX ${shellQuote(cacheKey)} 3600 ${shellQuote(output)}`
        );
      }

      return text(output || "Executed successfully with no output.");
    }
  );

  server.tool(
    {
      name: "rails_migrations",
      description: "Manage Rails database migrations with rollback support.",
      schema: z.object({
        action: z.enum(["migrate", "rollback", "redo", "status"]),
        steps: z.number().int().positive().default(1),
      }),
    },
    async ({ action, steps }) => {
      const commands = {
        migrate: "bin/rails db:migrate",
        rollback: `bin/rails db:rollback STEP=${steps}`,
        redo: `bin/rails db:migrate:redo STEP=${steps}`,
        status: "bin/rails db:migrate:status",
      };
      const result = await commandOutput(railsCommand(commands[action]));
      return text(`${action} completed:\n${result.stdout || result.stderr}`);
    }
  );

  server.tool(
    {
      name: "turbo_helpers",
      description: "Generate Turbo Streams and Frames code",
      schema: z.object({
        type: z.enum(["stream", "frame", "broadcast"]),
        action: z.string().describe("replace, append, prepend, etc."),
        target: z.string().describe("DOM ID target"),
        template: z.string().optional().describe("HTML template or partial name"),
      }),
    },
    async ({ type, action, target, template }) => {
      const templates = {
        stream: `turbo_stream.${action}("${target}", "${template || "<div>Content</div>"}")`,
        frame: `<turbo-frame id="${target}">\n  ${template || "Loading..."}\n</turbo-frame>`,
        broadcast: `# app/models/${target}.rb\nbroadcast_${action}_to "${target}"`,
      };

      return text(`Turbo ${type} code:\n\`\`\`ruby\n${templates[type]}\n\`\`\``);
    }
  );

  server.tool(
    {
      name: "redis_ops",
      description: "Redis operations for caching and queues.",
      schema: z.object({
        operation: z.enum(["get", "set", "del", "keys", "flush"]),
        key: z.string().optional(),
        value: z.string().optional(),
        ttl: z.number().int().positive().default(3600),
      }),
    },
    async ({ operation, key, value, ttl }) => {
      const redisCmd = `redis-cli -u ${shellQuote(config.redisUrl)}`;

      if (operation !== "keys" && operation !== "flush" && !key) {
        return text("Key is required for this Redis operation.");
      }

      switch (operation) {
        case "get": {
          const result = await commandOutput(`${redisCmd} GET ${shellQuote(key!)}`);
          return text(`Value: ${result.stdout || "(nil)"}`);
        }
        case "set": {
          if (!value) return text("Value is required for set.");
          await commandOutput(
            `${redisCmd} SETEX ${shellQuote(key!)} ${ttl} ${shellQuote(value)}`
          );
          return text(`Set ${key} with TTL ${ttl}s.`);
        }
        case "keys": {
          const result = await commandOutput(
            `${redisCmd} KEYS ${shellQuote(key || "*")}`
          );
          return text(`Keys:\n${result.stdout}`);
        }
        case "del": {
          await commandOutput(`${redisCmd} DEL ${shellQuote(key!)}`);
          return text(`Deleted ${key}.`);
        }
        case "flush": {
          await commandOutput(`${redisCmd} FLUSHALL`);
          return text("All Redis data flushed.");
        }
      }
    }
  );

  server.tool(
    {
      name: "run_tests",
      description: "Run RSpec tests with filters.",
      schema: z.object({
        type: z.enum(["all", "models", "controllers", "requests", "specific"]),
        path: z.string().optional().describe("Specific test file path"),
        flags: z.string().optional().describe("Additional RSpec flags"),
      }),
    },
    async ({ type, path, flags }) => {
      const testPaths = {
        all: "spec",
        models: "spec/models",
        controllers: "spec/controllers",
        requests: "spec/requests",
        specific: path || "spec",
      };
      const result = await commandOutput(
        railsCommand(`bin/rspec ${shellQuote(testPaths[type])} ${flags || ""}`)
      );
      return text(`Test results:\n${result.stdout || result.stderr}`);
    }
  );

  server.tool(
    {
      name: "docker_services",
      description: "Manage Docker Compose services.",
      schema: z.object({
        action: z.enum(["status", "restart", "logs", "exec"]),
        service: z.string().default("all").describe("Docker Compose service name, or 'all'"),
        command: z.string().optional().describe("Command for exec action"),
      }),
    },
    async ({ action, service, command }) => {
      const services = service === "all" ? "" : dockerComposeService(service);

      switch (action) {
        case "status": {
          const result = await commandOutput(`docker compose ps ${services}`);
          return text(`Service status:\n${result.stdout || result.stderr}`);
        }
        case "restart": {
          const result = await commandOutput(`docker compose restart ${services}`);
          return text(result.stdout || `Restarted ${service}.`);
        }
        case "logs": {
          const result = await commandOutput(
            `docker compose logs --tail=50 ${services}`
          );
          return text(`Last 50 lines:\n${result.stdout || result.stderr}`);
        }
        case "exec": {
          if (!command) return text("Command is required for exec.");
          if (service === "all") return text("Choose one service for exec.");
          const result = await commandOutput(
            `docker compose exec ${dockerComposeService(service)} ${command}`
          );
          return text(`Output:\n${result.stdout || result.stderr}`);
        }
      }
    }
  );
}
