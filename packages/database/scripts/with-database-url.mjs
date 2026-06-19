import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/ia_financeira_whatsapp?schema=public";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing command.");
  process.exit(1);
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        return env;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      env[key] = value;
      return env;
    }, {});
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(scriptDir, "../../../.env");
const rootEnv = parseEnvFile(rootEnvPath);
const databaseUrl = process.env.DATABASE_URL || rootEnv.DATABASE_URL;
const canUseFallback = command === "prisma" && (args[0] === "validate" || args[0] === "generate");

if (!databaseUrl && !canUseFallback) {
  console.error(
    "DATABASE_URL is required for this database command. Create .env from .env.example or export DATABASE_URL before running migrate, seed, or reset."
  );
  process.exit(1);
}

const result = spawnSync(command, args, {
  env: {
    ...rootEnv,
    ...process.env,
    DATABASE_URL: databaseUrl || fallbackDatabaseUrl
  },
  shell: true,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
