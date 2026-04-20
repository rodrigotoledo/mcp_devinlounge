import { object, text, type MCPServer } from "mcp-use/server";
import { z } from "zod";

export function registerGuidelineTools(server: MCPServer) {
  // Naming & Code Clarity Guidelines
  server.tool(
    {
      name: "naming-conventions",
      description: "Best practices for variable, function, and class naming across stacks",
      schema: z.object({
        context: z
          .enum(["general", "rails", "typescript", "python"])
          .default("general")
          .describe("Which context to show naming rules for"),
      }),
    },
    async ({ context }) => {
      const guidelines = {
        general: {
          clear_names: [
            "✓ category, category_key, status_label, service_type",
            "✗ cat, st, svc, lbl, tmp",
          ],
          avoid_abbreviations: [
            "✓ account, account_controller, jobs_relation",
            "✗ rel, ac, j = create(:job), u = create(:user)",
          ],
          domain_entities: [
            "For domain objects: use full names, never one-letter shortcuts",
            "Tests: job = create(:job) not j = create(:job)",
          ],
        },
        rails: {
          models: [
            "Use clear names for ActiveRecord models and attributes",
            "Avoid cryptic names like rel, ac, st in validations/associations",
          ],
          variables: [
            "Tests: user = create(:user), not u = create(:user)",
            "Helpers: prefer descriptive names for presentation logic",
          ],
          database: [
            "Column names: use lowercase with underscores (snake_case)",
            "Associations: use plural for has_many, singular for belongs_to",
          ],
        },
        typescript: {
          interfaces: [
            "PascalCase: User, UserProfile, JobStatus",
            "Clear names: UserPermission not UserPerm",
          ],
          functions: [
            "camelCase: getUserById(), fetchUserProfile()",
            "Avoid: getU(), fetchUP()",
          ],
          variables: [
            "camelCase for regular vars: const userId, let userName",
            "Avoid: const uid, let un",
          ],
        },
        python: {
          classes: ["PascalCase: UserProfile, JobQueue, DataValidator"],
          functions: ["snake_case: get_user_by_id(), fetch_profile()"],
          variables: ["snake_case: user_id, account_name"],
        },
      };

      const content = JSON.stringify(
        {
          summary: `Naming conventions for ${context}`,
          rules: guidelines[context],
          principles: [
            "Prefer clear, descriptive names that explain intent",
            "Avoid abbreviations unless universally understood",
            "Domain entities should never use single-letter shortcuts",
            "Keep diffs readable by maintaining consistent naming",
          ],
        },
        null,
        2
      );

      return text(content);
    }
  );

  // Code Style & Structure
  server.tool(
    {
      name: "code-style-guide",
      description: "Code structure, comments, and organization best practices",
      schema: z.object({
        topic: z
          .enum([
            "comments",
            "functions",
            "organization",
            "imports",
            "error-handling",
          ])
          .default("comments"),
      }),
    },
    async ({ topic }) => {
      const styles = {
        comments: {
          rule: "Default to NO comments",
          when_to_add: [
            "Hidden constraint that isn't obvious from reading code",
            "Subtle invariant that would surprise a reader",
            "Workaround for a specific bug",
            "Behavior that contradicts expectations",
          ],
          avoid: [
            "DO NOT explain WHAT code does (good names do that)",
            "DO NOT reference current task/fix or callers (belongs in PR description)",
            "DO NOT reference issue numbers (rot as codebase evolves)",
          ],
        },
        functions: {
          size: "Keep task-scoped, follow existing patterns in the package",
          clarity: "Never self-truncate logic; complete implementations only",
          abstraction:
            "No premature abstractions—3 similar lines is better than early generalization",
        },
        organization: {
          files: [
            "Prefer editing existing files over creating new ones",
            "Keep related logic together by domain/context",
            "Follow the file structure already established in the package",
          ],
          scope: [
            "Bug fix: no surrounding cleanup required",
            "New feature: scope strictly to requirements",
            "Don't design for hypothetical future use cases",
          ],
        },
        imports: {
          order: [
            "Standard library / external packages first",
            "Internal project imports last",
            "Group related imports together",
          ],
          unused: [
            "Delete unused imports and variables completely",
            "Don't use underscores or comments to 'preserve' old code",
          ],
        },
        "error-handling": {
          rule: "Validate only at system boundaries",
          trust: [
            "Trust internal code and framework guarantees",
            "Don't add error handling for scenarios that can't happen",
          ],
          validate_at: [
            "User input boundaries",
            "External API calls",
            "File system operations",
            "Network requests",
          ],
        },
      };

      return text(JSON.stringify(styles[topic], null, 2));
    }
  );

  // View/Template Structure (Rails-specific but applicable)
  server.tool(
    {
      name: "view-structure-guide",
      description: "Best practices for organizing views, helpers, and presentation logic",
      schema: z.object({
        framework: z.enum(["rails", "react", "expo"]).default("rails"),
      }),
    },
    async ({ framework }) => {
      const views = {
        rails: {
          principle: "Keep ERB focused on composition and rendering",
          avoid: [
            "<% value = ... %>​ followed by if/unless/case branching",
            "Complex derived logic in template tags",
            "Cryptic variable names in views",
          ],
          prefer: [
            "helpers/ methods for presentation rules",
            "partials for repeated markup",
            "helper_method only when accessing controller/session context",
            "Domain-specific helpers: JobsHelper, AccountHelper, NavigationHelper",
          ],
          examples: {
            wrong: `<% status = job.status.upcase %>\n<% if status == 'OPEN' %>Active<% end %>`,
            right: `<%= job_status_label(job) %>\n<%= render 'jobs/status_badge', job: job %>`,
          },
        },
        react: {
          principle: "Keep components focused on rendering, move logic to hooks/utils",
          prefer: [
            "Custom hooks for stateful/complex logic",
            "Utility functions for data transformation",
            "Composition over conditional rendering when possible",
          ],
        },
        expo: {
          principle:
            "Prefer Tailwind className over inline style={{}} unless necessary",
          when_to_use_style: [
            "Dynamic numeric values (animation, position)",
            "Third-party components requiring inline style",
            "Animated API usage",
            "Matching surrounding pattern that already uses style",
          ],
        },
      };

      return text(JSON.stringify(views[framework], null, 2));
    }
  );

  // Testing Principles
  server.tool(
    {
      name: "testing-principles",
      description: "Testing best practices for different frameworks",
      schema: z.object({
        framework: z
          .enum(["rspec", "jest", "pytest", "playwright"])
          .default("rspec"),
      }),
    },
    async ({ framework }) => {
      const testing = {
        rspec: {
          use: "RSpec only for Rails tests",
          avoid: [
            "DO NOT add Minitest for application specs",
            "DO NOT assert exact human-readable strings (validation msgs, flash msgs)",
          ],
          prefer: [
            "Validity checks: expect(record).to be_valid",
            "Error structure: expect(record.errors.added?(:field, :blank)).to be true",
            "Flash presence: expect(flash[:notice]).to be_present",
            "Status & redirects in request specs",
          ],
          factories: [
            "Use FactoryBot in spec/factories/",
            "Keep valid defaults, use traits for variants",
            "Prefer factories over manual record creation",
          ],
          models: [
            "Focus on validity and which attributes fail",
            "Not on wording of error messages",
            "Keep model specs in sync with validations",
          ],
        },
        jest: {
          principle: "Test behavior and contracts, not implementation",
          avoid: ["Snapshot tests for frequently-changing markup"],
          prefer: ["User interactions", "Return values", "Side effects"],
        },
        pytest: {
          principle: "Test edge cases and invariants",
          structure: "arrange, act, assert pattern",
        },
        playwright: {
          principle: "End-to-end user journeys",
          focus: ["Happy path", "Common error cases", "Form submissions"],
        },
      };

      return text(JSON.stringify(testing[framework], null, 2));
    }
  );

  // PostgreSQL & Database Guidelines
  server.tool(
    {
      name: "database-guidelines",
      description: "Database schema, migrations, and type policies",
      schema: z.object({
        topic: z.enum(["uuid", "migrations", "types"]).default("uuid"),
      }),
    },
    async ({ topic }) => {
      const database = {
        uuid: {
          policy: "Default to PostgreSQL native UUID for all new primary/foreign keys",
          generation: "Prefer pgcrypto + gen_random_uuid() for DB-side generation",
          avoid: "DO NOT use integer/bigint IDs for app tables unless explicitly asked",
          references:
            "Keep FK types aligned with UUID tables (type: :uuid in migrations)",
          testing: [
            "DO NOT assume insertion order (Model.first, Model.last)",
            "DO NOT rely on sequential IDs like 1, 2, 3",
            "Prefer find_by! with stable attributes",
            "Capture records explicitly in tests",
          ],
          reset: [
            "Early project: prefer recreating databases over compatibility migrations",
            "Development: docker compose exec fullstack bin/rails db:drop db:create db:migrate",
            "Test: docker compose exec fullstack env RAILS_ENV=test bin/rails db:drop db:create db:migrate",
          ],
        },
        migrations: {
          location: "hardhat-fullstack/db/migrate/",
          apply: "docker compose exec fullstack bin/rails db:migrate",
          create:
            "docker compose exec fullstack bin/rails generate migration DescriptiveName",
          strategy: [
            "Atomic migrations (one concern per migration)",
            "Reversible when possible (use change instead of up/down)",
            "Document non-obvious changes with comments",
          ],
        },
        types: {
          strings: "Use for status fields, short text, enums (plain strings)",
          integers: "Use for counts, ages, ordered IDs (prefer UUIDs for PKs/FKs)",
          decimals: "Use for money/financial data (never float)",
          timestamps: "Use created_at/updated_at automatically via Rails",
          json: "Use for flexible data, not as replacement for proper schema",
        },
      };

      return text(JSON.stringify(database[topic], null, 2));
    }
  );

  // Documentation & Resources Catalog
  server.resource(
    {
      name: "code-guidelines-catalog",
      title: "Code Guidelines Catalog",
      uri: "devinlounge://guidelines/catalog",
      description:
        "Index of all available coding guidelines, conventions, and best practices",
      mimeType: "application/json",
    },
    async () =>
      object({
        categories: {
          naming: [
            "naming-conventions - Variable/function/class naming rules",
            "applies to: all stacks",
          ],
          structure: [
            "code-style-guide - Comments, functions, organization",
            "applies to: all stacks",
          ],
          views: [
            "view-structure-guide - Presentation logic organization",
            "applies to: Rails, React, Expo",
          ],
          testing: [
            "testing-principles - Test structure and assertions",
            "applies to: RSpec, Jest, Pytest, Playwright",
          ],
          database: [
            "database-guidelines - Schema, migrations, types",
            "applies to: PostgreSQL, Rails ORM",
          ],
        },
        quick_links: {
          naming: "When naming variables, functions, classes",
          comments:
            "When adding comments or documentation in code",
          "view-logic": "When organizing presentation logic",
          testing: "When writing tests",
          schema: "When designing database schemas",
        },
      })
  );
}
