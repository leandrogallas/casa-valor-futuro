import { randomUUID } from 'node:crypto';
import { getDb } from './database.js';

export interface AuditEventInput {
  tipo: string;
  atorId: string;
  payload: Record<string, unknown>;
}

export function escreverAuditEvent(evento: AuditEventInput): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO audit_events (id, tipo, ator_id, payload_json, criado_em) VALUES (?, ?, ?, ?, ?)',
  ).run(
    randomUUID(),
    evento.tipo,
    evento.atorId,
    JSON.stringify(evento.payload),
    new Date().toISOString(),
  );
}

export interface AuditEvent {
  id: string;
  tipo: string;
  ator_id: string;
  payload_json: string;
  criado_em: string;
}

export function listarAuditEvents(limite = 100): AuditEvent[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM audit_events ORDER BY criado_em DESC LIMIT ?')
    .all(limite) as AuditEvent[];
}
