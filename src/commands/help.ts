import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { SlashCommand } from "./types";

const help: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Как пользоваться этим ботом"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("AI Ассистент — как пользоваться")
      .setColor(0x5865f2)
      .setDescription(
        "Я отвечаю на любые вопросы и умею искать актуальную информацию в Google.",
      )
      .addFields(
        {
          name: "/ask вопрос:<твой вопрос>",
          value: "Задать вопрос. По умолчанию использую поиск в интернете для свежих данных.",
        },
        {
          name: "@упоминание",
          value:
            "Упомяни меня в любом сообщении — отвечу с учётом последних 10 сообщений канала.",
        },
        {
          name: "/clear",
          value: "Очистить память бота в текущем канале.",
        },
        {
          name: "/help",
          value: "Показать это сообщение.",
        },
      )
      .setFooter({
        text: "Powered by Google Gemini · бесплатный тариф 1500 запросов в день",
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default help;
