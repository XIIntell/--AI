import { REST, Routes } from "discord.js";
import { env } from "../config/env";
import { commands } from "../commands";
import { fetchApplicationId } from "../utils/discord-api";
import { logger } from "../utils/logger";

async function main(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
  const clientId =
    env.DISCORD_CLIENT_ID ?? (await fetchApplicationId(env.DISCORD_BOT_TOKEN));
  const body = commands.map((c) => c.data.toJSON());

  if (env.DISCORD_TEST_GUILD_ID) {
    logger.info(
      { count: body.length, clientId, guildId: env.DISCORD_TEST_GUILD_ID },
      "Registering slash commands as GUILD commands (instant availability)...",
    );
    const result = (await rest.put(
      Routes.applicationGuildCommands(clientId, env.DISCORD_TEST_GUILD_ID),
      { body },
    )) as unknown[];
    logger.info(
      { count: result.length },
      "Guild slash commands registered — should appear immediately in Discord.",
    );
  } else {
    logger.info(
      { count: body.length, clientId },
      "Registering slash commands as GLOBAL commands...",
    );
    const result = (await rest.put(Routes.applicationCommands(clientId), {
      body,
    })) as unknown[];
    logger.info(
      { count: result.length },
      "Global slash commands registered. May take up to 1 hour to appear everywhere.",
    );
  }
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to register commands");
  process.exit(1);
});
