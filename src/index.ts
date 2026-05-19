import { env } from "./config/env";
import { createClient } from "./bot";
import { closeDb } from "./services/memory";
import { logger } from "./utils/logger";

async function main(): Promise<void> {
  const client = createClient();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutting down...");
    try {
      await client.destroy();
    } catch (err) {
      logger.error({ err }, "Error destroying Discord client");
    }
    closeDb();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });

  await client.login(env.DISCORD_BOT_TOKEN);
}

void main();
