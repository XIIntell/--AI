import { Events, type Client } from "discord.js";
import { commandMap } from "../commands";
import { logger } from "../utils/logger";

export function registerInteractionEvent(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) {
      logger.warn(
        { name: interaction.commandName },
        "Received unknown slash command",
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error(
        { err, command: interaction.commandName },
        "Slash command threw",
      );

      const errMsg = "Произошла ошибка при выполнении команды.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errMsg, ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content: errMsg, ephemeral: true }).catch(() => {});
      }
    }
  });
}
