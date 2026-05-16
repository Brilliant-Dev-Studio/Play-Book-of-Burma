import { defineConfig } from "@prisma/config";
import { readFileSync } from "fs";
import { join } from "path";

// Prisma config intentionally skips dotenv — load env files manually
function loadEnvFile(filename: string) {
  try {
    const lines = readFileSync(join(process.cwd(), filename), "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file doesn't exist, skip silently
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
