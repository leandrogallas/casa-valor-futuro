import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) throw new Error('Database não inicializado. Chame initDb() primeiro.');
  return db;
}

export function initDb(caminho: string): Database.Database {
  if (caminho !== ':memory:') {
    const dir = dirname(caminho);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  db = new Database(caminho);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schemaSql);

  return db;
}

export function closeDb(): void {
  db?.close();
  db = null;
}
