import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, closeDb } from '../db/database.js';
import { escreverAuditEvent, listarAuditEvents } from '../db/auditLog.js';

describe('AuditLogWriter', () => {
  beforeEach(() => initDb(':memory:'));
  afterEach(() => closeDb());

  it('grava evento e recupera via listarAuditEvents', () => {
    escreverAuditEvent({
      tipo: 'jogador_entrou',
      atorId: 'user-123',
      payload: { nome: 'Bastião' },
    });

    const eventos = listarAuditEvents();
    expect(eventos).toHaveLength(1);
    expect(eventos[0].tipo).toBe('jogador_entrou');
    expect(eventos[0].ator_id).toBe('user-123');
    expect(JSON.parse(eventos[0].payload_json)).toEqual({ nome: 'Bastião' });
  });

  it('grava múltiplos eventos em ordem decrescente', () => {
    escreverAuditEvent({ tipo: 'a', atorId: 'u1', payload: {} });
    escreverAuditEvent({ tipo: 'b', atorId: 'u1', payload: {} });
    escreverAuditEvent({ tipo: 'c', atorId: 'u1', payload: {} });

    const eventos = listarAuditEvents();
    expect(eventos).toHaveLength(3);
    expect(eventos[0].tipo).toBe('c');
    expect(eventos[2].tipo).toBe('a');
  });

  it('respeita o limite do listarAuditEvents', () => {
    for (let i = 0; i < 10; i++) {
      escreverAuditEvent({ tipo: `evento-${i}`, atorId: 'u1', payload: {} });
    }
    const eventos = listarAuditEvents(3);
    expect(eventos).toHaveLength(3);
  });

  it('payload_json é string JSON válida', () => {
    const payload = { chave: 'valor', numero: 42, nested: { ok: true } };
    escreverAuditEvent({ tipo: 'test', atorId: 'u1', payload });

    const [evento] = listarAuditEvents(1);
    expect(() => JSON.parse(evento.payload_json)).not.toThrow();
    expect(JSON.parse(evento.payload_json)).toEqual(payload);
  });
});
