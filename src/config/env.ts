import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

dotenvConfig();

const envSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1, "DISCORD_BOT_TOKEN is required"),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_TEST_GUILD_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  DATABASE_PATH: z.string().default("./data/bot.db"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  MEMORY_CONTEXT_SIZE: z.coerce.number().int().min(0).max(50).default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error(
    "\nMake sure you have a .env file in the project root (copy from .env.example).",
  );
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
