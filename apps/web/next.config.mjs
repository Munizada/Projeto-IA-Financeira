import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function loadRootEnv() {
  const appDir = dirname(fileURLToPath(import.meta.url));
  const rootEnvPath = resolve(appDir, "../../.env");

  if (!existsSync(rootEnvPath)) {
    return;
  }

  for (const line of readFileSync(rootEnvPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadRootEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
