import { REST, Routes } from "discord.js";

interface ApplicationInfo {
  id: string;
  name: string;
}

export async function fetchApplicationId(botToken: string): Promise<string> {
  const rest = new REST({ version: "10" }).setToken(botToken);
  const app = (await rest.get(Routes.currentApplication())) as ApplicationInfo;
  return app.id;
}
