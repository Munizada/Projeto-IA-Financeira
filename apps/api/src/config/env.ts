import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

function parseEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((env, line) => {
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

function loadRootEnv(): void {
  const configDir = dirname(fileURLToPath(import.meta.url));
  const rootEnvPath = resolve(configDir, "../../../../.env");
  const fileEnv = parseEnvFile(rootEnvPath);

  for (const [key, value] of Object.entries(fileEnv)) {
    process.env[key] ??= value;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3333)
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  loadRootEnv();

  return envSchema.parse({
    ...process.env,
    API_PORT: process.env.API_PORT ?? process.env.PORT
  });
}
