import { Client, GatewayIntentBits, Partials } from "discord.js";
import { registerInteractionEvent } from "./events/interactionCreate";
import { registerMessageEvent } from "./events/messageCreate";
import { registerReadyEvent } from "./events/ready";

export function createClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
  });

  registerReadyEvent(client);
  registerInteractionEvent(client);
  registerMessageEvent(client);

  return client;
}
