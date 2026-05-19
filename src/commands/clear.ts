import { SlashCommandBuilder } from "discord.js";
import { clearChannelMemory } from "../services/memory";
import type { SlashCommand } from "./types";

const clear: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Очистить память бота в этом канале (контекст разговора)"),
  async execute(interaction) {
    const removed = clearChannelMemory(interaction.channelId);
    await interaction.reply({
      content: `Память очищена. Удалено сообщений: ${removed}.`,
      ephemeral: true,
    });
  },
};

export default clear;
