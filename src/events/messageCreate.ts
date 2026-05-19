import { ChannelType, Events, type Client, type Message } from "discord.js";
import { env } from "../config/env";
import { generateAnswer } from "../services/ai";
import {
  appendMessage,
  getRecentMessages,
} from "../services/memory";
import { chunkMessage } from "../utils/discord";
import { logger } from "../utils/logger";

function botIsAddressed(message: Message, botId: string): boolean {
  if (message.author.bot) return false;
  if (message.channel.type === ChannelType.DM) return true;
  if (message.mentions.users.has(botId)) return true;
  if (message.reference?.messageId) {
    return false;
  }
  return false;
}

function stripMention(content: string, botId: string): string {
  return content
    .replace(new RegExp(`<@!?${botId}>`, "g"), "")
    .trim();
}

export function registerMessageEvent(client: Client): void {
  client.on(Events.MessageCreate, async (message) => {
    const botId = client.user?.id;
    if (!botId) return;
    if (!botIsAddressed(message, botId)) return;

    const cleanContent = stripMention(message.content, botId);
    if (cleanContent.length === 0) {
      await message.reply("Я тут. Спроси что-нибудь или используй `/ask`.");
      return;
    }

    const channelId = message.channelId;
    const displayName = message.member?.displayName ?? message.author.username;

    if (message.channel.isSendable()) {
      await message.channel.sendTyping().catch(() => {});
    }

    try {
      const history = getRecentMessages(channelId, env.MEMORY_CONTEXT_SIZE);

      const result = await generateAnswer({
        userPrompt: cleanContent,
        userDisplayName: displayName,
        history,
        enableSearch: true,
      });

      appendMessage(channelId, "user", displayName, cleanContent);
      appendMessage(channelId, "model", "AI", result.text);

      let footer = "";
      if (result.sources.length > 0) {
        const sourceList = result.sources
          .slice(0, 5)
          .map((s, i) => `${i + 1}. [${s.title || s.uri}](<${s.uri}>)`)
          .join("\n");
        footer = `\n\n*Источники:*\n${sourceList}`;
      }

      const chunks = chunkMessage(result.text + footer);
      const first = chunks[0] ?? "(пустой ответ)";
      await message.reply(first);
      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk) continue;
        if (message.channel.isSendable()) {
          await message.channel.send(chunk);
        }
      }
    } catch (err) {
      logger.error({ err }, "messageCreate handler failed");
      await message
        .reply("Не получилось ответить. Попробуй позже.")
        .catch(() => {});
    }
  });
}
