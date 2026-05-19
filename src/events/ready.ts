import { ActivityType, Events, type Client } from "discord.js";
import { logger } from "../utils/logger";

export function registerReadyEvent(client: Client): void {
  client.once(Events.ClientReady, (c) => {
    logger.info({ tag: c.user.tag, id: c.user.id }, "Bot is online");
    c.user.setPresence({
      activities: [
        {
          name: "/ask · упомяни меня для вопросов",
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    });
  });
}
