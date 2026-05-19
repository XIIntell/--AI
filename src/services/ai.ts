import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import type { MemoryMessage } from "./memory";

const SYSTEM_INSTRUCTION = `Ты — дружелюбный и полезный AI-ассистент в Discord.
Отвечай по-русски (если пользователь не пишет на другом языке — тогда отвечай на его языке).
Будь кратким и по делу: длинные ответы старайся уложить в 2000 символов (это лимит Discord-сообщения).
Если вопрос требует актуальной информации (новости, погода, события, курсы, спорт, что-то после 2024 года) — используй поиск в Google.
Если не знаешь ответа — честно скажи об этом, не выдумывай.
Не используй излишне сложное форматирование, обычный markdown поддерживается (жирный, курсив, код).`;

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export interface GenerateOptions {
  userPrompt: string;
  history: MemoryMessage[];
  userDisplayName: string;
  enableSearch?: boolean;
}

export interface GenerateResult {
  text: string;
  searchQueries: string[];
  sources: { title: string; uri: string }[];
}

function buildContents(opts: GenerateOptions) {
  const contents = opts.history.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: `[${opts.userDisplayName}]: ${opts.userPrompt}` }],
  });

  return contents;
}

export async function generateAnswer(
  opts: GenerateOptions,
): Promise<GenerateResult> {
  const enableSearch = opts.enableSearch ?? true;

  try {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: buildContents(opts),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        ...(enableSearch ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });

    const text = response.text ?? "";
    const groundingMeta = response.candidates?.[0]?.groundingMetadata;
    const searchQueries = groundingMeta?.webSearchQueries ?? [];
    const sources =
      groundingMeta?.groundingChunks
        ?.map((chunk) => ({
          title: chunk.web?.title ?? "",
          uri: chunk.web?.uri ?? "",
        }))
        .filter((s) => s.uri.length > 0) ?? [];

    return {
      text: text.trim() || "(пустой ответ от модели)",
      searchQueries,
      sources,
    };
  } catch (err) {
    logger.error({ err }, "Gemini API error");
    throw err;
  }
}
