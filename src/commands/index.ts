import ask from "./ask";
import clear from "./clear";
import help from "./help";
import type { SlashCommand } from "./types";

export const commands: SlashCommand[] = [ask, clear, help];

export const commandMap = new Map<string, SlashCommand>(
  commands.map((c) => [c.data.name, c]),
);
