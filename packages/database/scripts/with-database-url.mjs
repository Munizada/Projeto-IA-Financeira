import { spawnSync } from "node:child_process";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/ia_financeira_whatsapp?schema=public";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing command.");
  process.exit(1);
}

const result = spawnSync(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || fallbackDatabaseUrl
  },
  shell: true,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
