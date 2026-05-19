import { SlashCommandBuilder } from "discord.js";
import { generateAnswer } from "../services/ai";
import {
  appendMessage,
  getRecentMessages,
} from "../services/memory";
import { env } from "../config/env";
import { chunkMessage } from "../utils/discord";
import { logger } from "../utils/logger";
import type { SlashCommand } from "./types";

const ask: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Задать вопрос AI-ассистенту (с поиском в Google для свежих данных)")
    .addStringOption((opt) =>
      opt
        .setName("вопрос")
        .setDescription("Что хочешь спросить?")
        .setRequired(true)
        .setMaxLength(2000),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("без_поиска")
        .setDescription("Отвечать только из памяти модели, без интернет-поиска")
        .setRequired(false),
    ),
  async execute(interaction) {
    const question = interaction.options.getString("вопрос", true);
    const noSearch = interaction.options.getBoolean("без_поиска") ?? false;
    const channelId = interaction.channelId;
    const displayName =
      interaction.member && "displayName" in interaction.member
        ? (interaction.member.displayName as string)
        : interaction.user.username;

    await interaction.deferReply();

    try {
      const history = getRecentMessages(channelId, env.MEMORY_CONTEXT_SIZE);

      const result = await generateAnswer({
        userPrompt: question,
        userDisplayName: displayName,
        history,
        enableSearch: !noSearch,
      });

      appendMessage(channelId, "user", displayName, question);
      appendMessage(channelId, "model", "AI", result.text);

      let footer = "";
      if (result.sources.length > 0) {
        const sourceList = result.sources
          .slice(0, 5)
          .map((s, i) => `${i + 1}. [${s.title || s.uri}](<${s.uri}>)`)
          .join("\n");
        footer = `\n\n*Источники:*\n${sourceList}`;
      }

      const fullReply = result.text + footer;
      const chunks = chunkMessage(fullReply);

      await interaction.editReply(chunks[0] ?? "(пустой ответ)");
      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk) await interaction.followUp(chunk);
      }
    } catch (err) {
      logger.error({ err }, "/ask failed");
      await interaction.editReply(
        "Не получилось получить ответ от AI. Попробуй позже или проверь логи.",
      );
    }
  },
};

export default ask;
