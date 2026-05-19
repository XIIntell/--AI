import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export type MessageRole = "user" | "model";

export interface MemoryMessage {
  role: MessageRole;
  content: string;
  authorName: string;
  createdAt: number;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  mkdirSync(dirname(env.DATABASE_PATH), { recursive: true });

  db = new Database(env.DATABASE_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'model')),
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_channel_created
      ON conversation_messages(channel_id, created_at DESC);
  `);

  logger.info({ path: env.DATABASE_PATH }, "SQLite memory initialized");
  return db;
}

export function appendMessage(
  channelId: string,
  role: MessageRole,
  authorName: string,
  content: string,
): void {
  getDb()
    .prepare(
      `INSERT INTO conversation_messages
       (channel_id, role, author_name, content, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(channelId, role, authorName, content, Date.now());
}

export function getRecentMessages(
  channelId: string,
  limit: number,
): MemoryMessage[] {
  if (limit <= 0) return [];

  const rows = getDb()
    .prepare(
      `SELECT role, author_name AS authorName, content, created_at AS createdAt
       FROM conversation_messages
       WHERE channel_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(channelId, limit) as MemoryMessage[];

  return rows.reverse();
}

export function clearChannelMemory(channelId: string): number {
  const result = getDb()
    .prepare(`DELETE FROM conversation_messages WHERE channel_id = ?`)
    .run(channelId);
  return result.changes;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
