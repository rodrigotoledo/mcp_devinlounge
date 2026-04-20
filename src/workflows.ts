import { object, text, type MCPServer } from "mcp-use/server";
import { z } from "zod";

export function registerWorkflowTools(server: MCPServer) {
  // Project Setup Workflow
  server.tool(
    {
      name: "project-setup",
      description: "Get setup instructions for a new project or existing environment",
      schema: z.object({
        scenario: z
          .enum(["fresh-clone", "existing-env", "new-feature", "local-reset"])
          .describe("What setup scenario you're in"),
        stacks: z
          .array(z.enum(["rails", "expo", "fastapi", "docker"]))
          .default(["rails", "expo", "docker"])
          .optional(),
      }),
    },
    async ({ scenario, stacks = ["rails", "expo", "docker"] }) => {
      const setups = {
        "fresh-clone": `
# Fresh Clone Setup

1. **Clone and navigate**
   \`\`\`bash
   git clone <repo>
   cd <repo>
   \`\`\`

2. **Install dependencies (if on host)**
   ${stacks.includes("expo") ? "- Expo: \`cd hardhat-expo && npm install\`" : ""}

3. **Create environment files**
   \`\`\`bash
   # From .env.example if it exists
   cp .env.example .env
   ./scripts/sync-env-from-example.sh  # if available
   \`\`\`

4. **Start Docker services**
   ${stacks.includes("docker")
     ? `\`\`\`bash
   docker compose up --build
   \`\`\`
   This starts:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   ${stacks.includes("rails") ? "- Rails (port 3000)" : ""}
   ${stacks.includes("fastapi") ? "- FastAPI (port 8000)" : ""}
   \`\`\`\n`
     : ""
   }

5. **Run migrations** (in another terminal)
   ${stacks.includes("rails")
     ? "\`docker compose exec fullstack bin/rails db:migrate\`"
     : ""
   }

6. **Start Expo dev server** (if applicable, in another terminal)
   ${stacks.includes("expo")
     ? "\`cd hardhat-expo && npx expo start\`"
     : ""
   }

7. **Verify setup**
   - Rails: http://localhost:3000
   - Expo: Scan QR code in terminal
   ${stacks.includes("fastapi") ? "- FastAPI: http://localhost:8000/docs" : ""}
`,

        "existing-env": `
# Existing Environment Setup

1. **Pull latest code**
   \`\`\`bash
   git pull origin main
   \`\`\`

2. **Check dependencies**
   ${stacks.includes("expo")
     ? "- Expo: \`cd hardhat-expo && npm ci\`"
     : ""
   }
   ${stacks.includes("rails")
     ? "- Rails: \`docker compose build fullstack\` (if Gemfile changed)"
     : ""
   }

3. **Run pending migrations**
   ${stacks.includes("rails")
     ? "\`docker compose exec fullstack bin/rails db:migrate\`"
     : ""
   }

4. **Restart services**
   \`\`\`bash
   docker compose restart
   \`\`\`

5. **Verify**
   - Check logs for errors: \`docker compose logs\`
   - Run tests: See "Testing" workflow
`,

        "new-feature": `
# New Feature Workflow

1. **Create feature branch**
   \`\`\`bash
   git checkout -b feature/description
   \`\`\`

2. **Understand the codebase**
   - Read CLAUDE.md, AGENTS.md, CODEX.md for context
   - Use "stack-info" tool to understand affected stack(s)
   - Review related code and tests

3. **Start development**
   ${stacks.includes("rails")
     ? `- **Rails:**
     - Create model: \`docker compose exec fullstack bin/rails generate model Name --no-migration\`
     - Create migration: \`docker compose exec fullstack bin/rails generate migration\`
     - Create controller: \`docker compose exec fullstack bin/rails generate controller\``
     : ""
   }
   ${stacks.includes("expo")
     ? `- **Expo:**
     - Use existing component structure in \`components/\`
     - Routes in \`app/\``
     : ""
   }

4. **Write tests first (TDD)**
   ${stacks.includes("rails")
     ? "- \`docker compose exec fullstack bin/rspec spec/models/your_spec.rb\`"
     : ""
   }

5. **Verify code style**
   \`\`\`bash
   ${stacks.includes("rails")
     ? "docker compose exec fullstack bin/rubocop\n  "
     : ""
   }${stacks.includes("expo") ? "cd hardhat-expo && npm run typecheck" : ""}
   \`\`\`

6. **Commit with meaningful message**
   \`\`\`bash
   git add .
   git commit -m "feat: description of what changed and why"
   \`\`\`

7. **Push and create PR**
   \`\`\`bash
   git push origin feature/description
   # Create PR on GitHub
   \`\`\`
`,

        "local-reset": `
# Local Reset / Cleanup

## Full Reset (start from docker-compose.yml)
\`\`\`bash
docker compose down
docker compose up -d --build
${stacks.includes("rails") ? "docker compose exec fullstack bin/rails db:drop db:create db:migrate" : ""}
\`\`\`

## Database Reset (keep containers)
${stacks.includes("rails")
  ? "\`docker compose exec fullstack bin/rails db:drop db:create db:migrate\`"
  : ""
}

## Test Database Reset
\`\`\`bash
${stacks.includes("rails")
  ? "docker compose exec fullstack env RAILS_ENV=test bin/rails db:drop db:create db:migrate"
  : ""
}
\`\`\`

## Cache Clear
\`\`\`bash
docker compose exec fullstack bin/rails tmp:clear
${stacks.includes("fastapi") ? "docker compose exec api rm -rf __pycache__" : ""}
\`\`\`

## Full Cleanup (nuclear option)
\`\`\`bash
docker compose down -v  # Removes volumes
docker system prune -a  # Removes unused images/containers
# Then: docker compose up --build (fresh start)
\`\`\`
`,
      };

      return text(setups[scenario] || setups["fresh-clone"]);
    }
  );

  // Development Workflow
  server.tool(
    {
      name: "dev-workflow",
      description: "Daily development workflow and common tasks",
      schema: z.object({
        task: z
          .enum([
            "start-day",
            "run-tests",
            "check-style",
            "debug",
            "database-change",
          ])
          .default("start-day"),
      }),
    },
    async ({ task }) => {
      const workflows = {
        "start-day": `
# Start Your Day

1. **Pull latest changes**
   \`\`\`bash
   git checkout main
   git pull origin main
   \`\`\`

2. **Update dependencies**
   \`\`\`bash
   # Rails (in Docker):
   docker compose build fullstack
   docker compose up -d
   
   # Expo (on host):
   cd hardhat-expo && npm ci
   \`\`\`

3. **Run migrations**
   \`\`\`bash
   docker compose exec fullstack bin/rails db:migrate
   \`\`\`

4. **Check tests**
   \`\`\`bash
   docker compose exec fullstack bin/rspec
   \`\`\`

5. **Start dev servers** (in separate terminals)
   \`\`\`bash
   # Terminal 1: Docker services
   docker compose up

   # Terminal 2: Rails logs
   docker compose logs -f fullstack

   # Terminal 3: Expo
   cd hardhat-expo && npx expo start
   \`\`\`

6. **Open your editor** and start coding
`,

        "run-tests": `
# Running Tests

## All RSpec tests
\`\`\`bash
docker compose exec fullstack bin/rspec
\`\`\`

## Specific test file
\`\`\`bash
docker compose exec fullstack bin/rspec spec/models/user_spec.rb
\`\`\`

## Tests matching pattern
\`\`\`bash
docker compose exec fullstack bin/rspec --pattern '**/job*'
\`\`\`

## Tests for specific feature
\`\`\`bash
docker compose exec fullstack bin/rspec spec/requests/jobs_spec.rb
\`\`\`

## Watch mode (re-run on changes)
\`\`\`bash
docker compose exec fullstack bin/rspec --watch
\`\`\`

## Only failing tests
\`\`\`bash
docker compose exec fullstack bin/rspec --only-failures
\`\`\`

### Expo TypeCheck
\`\`\`bash
cd hardhat-expo && npm run typecheck
\`\`\`

## Best Practices
- Write tests BEFORE implementation (TDD)
- Test behavior, not implementation details
- Use factories (FactoryBot) for fixtures
- Don't assert exact error message strings
- Keep tests focused and readable
`,

        "check-style": `
# Code Style & Linting

## RuboCop (Rails)
\`\`\`bash
# Check for style issues
docker compose exec fullstack bin/rubocop

# Auto-fix what can be auto-fixed
docker compose exec fullstack bin/rubocop -A
\`\`\`

## Ruff (Python/FastAPI)
\`\`\`bash
# Check code
docker compose exec api ruff check

# Format
docker compose exec api ruff format
\`\`\`

## TypeScript (Expo)
\`\`\`bash
cd hardhat-expo && npm run typecheck
\`\`\`

## Security Scanning
\`\`\`bash
# Rails: Brakeman for security issues
docker compose exec fullstack bundle exec brakeman
\`\`\`

### Fix Before Committing
All style issues must be resolved before committing. Make it part of your workflow:
1. Make code changes
2. Run linters
3. Fix issues
4. Run tests
5. Commit
`,

        debug: `
# Debugging & Troubleshooting

## View logs
\`\`\`bash
# All services
docker compose logs

# Specific service (last 50 lines, follow)
docker compose logs -f fullstack
docker compose logs -f fullstack-worker
docker compose logs -f api
\`\`\`

## Interactive shell
\`\`\`bash
# Rails console
docker compose exec fullstack bin/rails console

# Python shell
docker compose exec api python

# Bash shell in service
docker compose exec fullstack bash
\`\`\`

## Database inspection
\`\`\`bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d <database_name>

# SQL query:
SELECT * FROM jobs LIMIT 10;
\`\`\`

## Redis inspection
\`\`\`bash
redis-cli -u redis://localhost:6379
KEYS *
GET <key>
FLUSHALL
\`\`\`

## Common Issues
- **Containers won't start:** \`docker compose logs\` to see errors
- **Port already in use:** \`docker compose down && docker system prune\`
- **Database locked:** \`docker compose down -v && docker compose up\`
- **Tests failing locally but not in CI:** Check .env file settings
`,

        "database-change": `
# Making Database Changes

## Schema Change Workflow

1. **Create migration**
   \`\`\`bash
   docker compose exec fullstack bin/rails generate migration AddFieldToTable
   \`\`\`

2. **Edit migration file** (hardhat-fullstack/db/migrate/)
   - Use \`type: :uuid\` for new references (default UUID PK/FK policy)
   - Make migrations reversible (use \`change\` not \`up/down\`)
   - Add comments for non-obvious changes

3. **Run migration**
   \`\`\`bash
   docker compose exec fullstack bin/rails db:migrate
   \`\`\`

4. **Test in Rails console**
   \`\`\`bash
   docker compose exec fullstack bin/rails console
   # Inspect the change:
   ActiveRecord::Base.connection.columns(:table_name)
   \`\`\`

5. **Update model** if needed
   \`\`\`bash
   # Add validations, associations, etc.
   # Update spec/factories/model.rb
   \`\`\`

6. **Write/update tests**
   \`\`\`bash
   docker compose exec fullstack bin/rspec spec/models/model_spec.rb
   \`\`\`

7. **Rollback if needed**
   \`\`\`bash
   docker compose exec fullstack bin/rails db:rollback STEP=1
   \`\`\`

## Test Database
Always ensure test DB is in sync:
\`\`\`bash
docker compose exec fullstack env RAILS_ENV=test bin/rails db:migrate
\`\`\`

## UUID Policy
- Use PostgreSQL native UUID for all new primary keys
- Use \`pgcrypto\` with \`gen_random_uuid()\`
- Keep FK types aligned with UUID tables
- In tests, don't assume insertion order—use \`find_by!\` instead of \`Model.last\`
`,
      };

      return text(workflows[task] || workflows["start-day"]);
    }
  );

  // Troubleshooting Guide
  server.tool(
    {
      name: "troubleshoot",
      description: "Diagnose and fix common development issues",
      schema: z.object({
        issue: z
          .enum([
            "container-wont-start",
            "tests-failing",
            "port-conflict",
            "database-locked",
            "dependency-issue",
            "git-conflict",
          ])
          .describe("What problem you're experiencing"),
      }),
    },
    async ({ issue }) => {
      const fixes = {
        "container-wont-start": `
# Container Won't Start

## 1. Check logs
\`\`\`bash
docker compose logs
# or specific service:
docker compose logs fullstack
\`\`\`

## 2. Common causes
- **Gemfile.lock out of sync:** \`docker compose build fullstack\`
- **Database connection fail:** Ensure postgres service is running: \`docker compose ps\`
- **Port conflict:** \`lsof -i :3000\` (find what's using port 3000)
- **Environment variables:** Check .env file is created

## 3. Nuclear reset
\`\`\`bash
docker compose down -v
docker system prune -a
docker compose up --build
\`\`\`

## 4. Check individual service
\`\`\`bash
docker compose up postgres  # Start only postgres
# In another terminal:
docker compose logs postgres
\`\`\`
`,

        "tests-failing": `
# Tests Failing Locally

## 1. Run full test suite
\`\`\`bash
docker compose exec fullstack bin/rspec --format progress
\`\`\`

## 2. Check test database
\`\`\`bash
# Ensure test DB is migrated
docker compose exec fullstack env RAILS_ENV=test bin/rails db:migrate

# Reset test DB
docker compose exec fullstack env RAILS_ENV=test bin/rails db:drop db:create db:migrate
\`\`\`

## 3. Run single failing test
\`\`\`bash
docker compose exec fullstack bin/rspec spec/path/to/failing_spec.rb:123
\`\`\`

## 4. Check dependencies
\`\`\`bash
# Gems updated? Rebuild:
docker compose build fullstack

# Factories? Make sure spec/factories/ exists and is loaded
docker compose exec fullstack bin/rspec -e "factory"
\`\`\`

## 5. Common test issues
- **"record not found":** Test didn't set up fixture properly (use factories)
- **"connection refused":** Redis or Postgres down
- **"validation failed":** Model missing factory attribute or default
- **"undefined method":** Check imports/requires in test file
`,

        "port-conflict": `
# Port Already in Use

## 1. Find what's using the port
\`\`\`bash
lsof -i :3000    # Rails
lsof -i :5432    # PostgreSQL
lsof -i :6379    # Redis
lsof -i :8000    # FastAPI
\`\`\`

## 2. Kill the process
\`\`\`bash
kill -9 <PID>
\`\`\`

Or better:

## 3. Use Docker Compose to clean up
\`\`\`bash
docker compose down
docker system prune  # Remove unused containers
docker compose up --build
\`\`\`

## 4. Change port (temporary)
Edit .env:
\`\`\`bash
FULLSTACK_PORT=3001  # Use different port
POSTGRES_PORT=5433
\`\`\`

Then: \`docker compose up\`
`,

        "database-locked": `
# Database is Locked / Transactions Hung

## 1. Kill hanging connections
\`\`\`bash
docker compose exec postgres psql -U postgres -d <db> -c "
  SELECT pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = '<db>' AND pid <> pg_backend_pid();
"
\`\`\`

## 2. Full database reset
\`\`\`bash
docker compose exec fullstack bin/rails db:drop db:create db:migrate
docker compose exec fullstack env RAILS_ENV=test bin/rails db:drop db:create db:migrate
\`\`\`

## 3. Restart PostgreSQL
\`\`\`bash
docker compose restart postgres
docker compose exec fullstack bin/rails db:migrate
\`\`\`

## 4. Nuclear option
\`\`\`bash
docker compose down -v  # Remove volumes (data loss!)
docker compose up
\`\`\`

**Be careful!** This deletes your local database. Only use if truly stuck.
`,

        "dependency-issue": `
# Dependency/Package Issues

## Rails (Ruby Gems)
\`\`\`bash
# Rebuild after Gemfile change
docker compose build fullstack

# Reinstall all gems
docker compose exec fullstack bundle install --redownload

# Check for issues
docker compose exec fullstack bundle check
\`\`\`

## Expo (npm)
\`\`\`bash
cd hardhat-expo

# Clean install
rm -rf node_modules package-lock.json
npm install

# Update all packages
npm update

# Check for vulnerabilities
npm audit
\`\`\`

## FastAPI (Python)
\`\`\`bash
# Reinstall dependencies
docker compose exec api pip install --upgrade pip
docker compose exec api pip install -r requirements.txt

# Check for issues
docker compose exec api pip check
\`\`\`
`,

        "git-conflict": `
# Git Merge Conflicts

## 1. See conflicting files
\`\`\`bash
git status
\`\`\`

## 2. Open in editor and resolve
Look for markers:
\`\`\`
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name
\`\`\`

Choose which version to keep or combine them.

## 3. After resolving
\`\`\`bash
git add <file>
git commit -m "Merge main into feature/description"
\`\`\`

## 4. If completely stuck
\`\`\`bash
# Abort merge and start over
git merge --abort

# Pull latest main
git checkout main
git pull origin main

# Rebase your branch on latest main
git checkout your-branch
git rebase main
# Resolve conflicts again
git rebase --continue
\`\`\`

## Prevention
- Pull before starting new work
- Merge main frequently into feature branches
- Communicate with team about large refactors
`,
      };

      return text(fixes[issue] || fixes["container-wont-start"]);
    }
  );

  // Resource: Workflow Catalog
  server.resource(
    {
      name: "workflows-catalog",
      title: "Development Workflows Catalog",
      uri: "devinlounge://workflows/catalog",
      description: "Index of all available development workflows",
      mimeType: "application/json",
    },
    async () =>
      object({
        workflows: {
          setup: [
            "project-setup - Initial setup scenarios",
            "Options: fresh-clone, existing-env, new-feature, local-reset",
          ],
          daily: [
            "dev-workflow - Daily development tasks",
            "Options: start-day, run-tests, check-style, debug, database-change",
          ],
          troubleshooting: [
            "troubleshoot - Common issues and fixes",
            "Options: container-wont-start, tests-failing, port-conflict, database-locked, dependency-issue, git-conflict",
          ],
        },
        quick_access: {
          "First time?": "project-setup (fresh-clone)",
          "Daily start": "dev-workflow (start-day)",
          "Running tests": "dev-workflow (run-tests)",
          "Code style": "dev-workflow (check-style)",
          "Something broke": "troubleshoot",
          "New feature": "project-setup (new-feature)",
        },
      })
  );
}
