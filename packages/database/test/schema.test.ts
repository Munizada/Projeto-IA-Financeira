import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const packageRoot = resolve(import.meta.dirname, "..");
const schemaPath = resolve(packageRoot, "prisma", "schema.prisma");
const packageJsonPath = resolve(packageRoot, "package.json");

const requiredEnums = [
  "UserStatus",
  "SpaceType",
  "SpaceStatus",
  "MemberRole",
  "MemberStatus",
  "InviteStatus",
  "SplitRule",
  "ExpenseStatus",
  "ExpenseSource",
  "LedgerEventType",
  "LedgerReferenceType",
  "PaymentStatus",
  "FileKind",
  "IdempotencyStatus",
  "ConsentType"
];

const requiredModels = [
  "User",
  "UserConsent",
  "Space",
  "SpaceMember",
  "Invite",
  "Expense",
  "ExpenseSplit",
  "LedgerEntry",
  "Payment",
  "PaymentReceipt",
  "FileObject",
  "AuditLog",
  "IdempotencyKey",
  "ConversationEvent"
];

describe("Prisma database schema contract", () => {
  const schema = readFileSync(schemaPath, "utf8");

  it("uses PostgreSQL and Prisma Client generator", () => {
    expect(schema).toContain('provider = "postgresql"');
    expect(schema).toContain('url      = env("DATABASE_URL")');
    expect(schema).toContain('provider = "prisma-client-js"');
  });

  it("declares all required enums and models", () => {
    for (const enumName of requiredEnums) {
      expect(schema).toMatch(new RegExp(`enum\\s+${enumName}\\s+\\{`));
    }

    for (const modelName of requiredModels) {
      expect(schema).toMatch(new RegExp(`model\\s+${modelName}\\s+\\{`));
    }
  });

  it("stores every monetary amount as amountMinor Int and never uses Float", () => {
    expect(schema).not.toMatch(/\bFloat\b/);
    expect(schema).toMatch(/Expense[\s\S]*amountMinor\s+Int/);
    expect(schema).toMatch(/ExpenseSplit[\s\S]*amountMinor\s+Int/);
    expect(schema).toMatch(/LedgerEntry[\s\S]*amountMinor\s+Int/);
    expect(schema).toMatch(/Payment[\s\S]*amountMinor\s+Int/);
  });

  it("stores invite tokens only as a unique tokenHash", () => {
    expect(schema).toMatch(/tokenHash\s+String\s+@unique/);
    expect(schema).not.toMatch(/\btoken\s+String\b/);
  });

  it("keeps key uniqueness and idempotency constraints", () => {
    expect(schema).toContain("@@unique([spaceId, userId])");
    expect(schema).toContain("@@unique([expenseId, memberId])");
    expect(schema).toMatch(/idempotencyKey\s+String\??\s+@unique/);
    expect(schema).toMatch(/providerMessageId\s+String\?\s+@unique/);
  });
});

describe("database package scripts", () => {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  it("exposes Prisma lifecycle scripts", () => {
    expect(packageJson.scripts).toMatchObject({
      build: "tsc -p tsconfig.json",
      lint: "eslint .",
      typecheck: "tsc -p tsconfig.json --noEmit",
      test: "vitest run --passWithNoTests",
      "prisma:validate": "node scripts/with-database-url.mjs prisma validate",
      "prisma:generate": "node scripts/with-database-url.mjs prisma generate",
      "prisma:migrate": "node scripts/with-database-url.mjs prisma migrate dev",
      "prisma:seed": "node scripts/with-database-url.mjs tsx prisma/seed.ts",
      "db:reset": "node scripts/with-database-url.mjs prisma migrate reset"
    });
  });

  it("declares Prisma runtime and tooling dependencies", () => {
    expect(packageJson.dependencies).toHaveProperty("@prisma/client");
    expect(packageJson.devDependencies).toHaveProperty("prisma");
    expect(packageJson.devDependencies).toHaveProperty("tsx");
  });
});
