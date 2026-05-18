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

  runMigrations(db);

  return db;
}

function runMigrations(db: Database.Database): void {
  // Safe: SQLite ignora erro se coluna já existe
  const cols = [
    `ALTER TABLE agentes ADD COLUMN departamento TEXT NOT NULL DEFAULT 'geral'`,
    `ALTER TABLE agentes ADD COLUMN skin_avatar TEXT NOT NULL DEFAULT 'agent-default'`,
    `ALTER TABLE agentes ADD COLUMN desk_x INTEGER NOT NULL DEFAULT 640`,
    `ALTER TABLE agentes ADD COLUMN desk_y INTEGER NOT NULL DEFAULT 400`,
    `ALTER TABLE agentes ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1`,
  ];
  for (const sql of cols) {
    try { db.exec(sql); } catch { /* coluna já existe */ }
  }
}

export function closeDb(): void {
  db?.close();
  db = null;
}
