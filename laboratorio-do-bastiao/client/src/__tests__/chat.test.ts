import { describe, it, expect } from 'vitest';
import { sanitizarMensagem, filtrarPorSala, formatarTimestamp, CHAT_MAX_CHARS } from '../logic/chat.js';

describe('sanitizarMensagem', () => {
  it('retorna null para string vazia', () => {
    expect(sanitizarMensagem('')).toBeNull();
    expect(sanitizarMensagem('   ')).toBeNull();
  });

  it('faz trim de espaços', () => {
    expect(sanitizarMensagem('  olá  ')).toBe('olá');
  });

  it('trunca em CHAT_MAX_CHARS', () => {
    const longa = 'x'.repeat(CHAT_MAX_CHARS + 10);
    const result = sanitizarMensagem(longa);
    expect(result?.length).toBe(CHAT_MAX_CHARS);
  });

  it('preserva mensagem dentro do limite', () => {
    expect(sanitizarMensagem('Oi tudo bem?')).toBe('Oi tudo bem?');
  });
});

describe('filtrarPorSala', () => {
  const msgs = [
    { autorId: 'u1', autorNome: 'A', texto: 'oi', salaId: 'recepcao', timestamp: 1 },
    { autorId: 'u2', autorNome: 'B', texto: 'hm', salaId: 'marketing', timestamp: 2 },
    { autorId: 'u1', autorNome: 'A', texto: 'ok', salaId: 'recepcao', timestamp: 3 },
  ];

  it('filtra apenas mensagens da sala', () => {
    const r = filtrarPorSala(msgs, 'recepcao');
    expect(r).toHaveLength(2);
    expect(r.every((m) => m.salaId === 'recepcao')).toBe(true);
  });

  it('retorna vazio para sala sem mensagens', () => {
    expect(filtrarPorSala(msgs, 'reuniao')).toHaveLength(0);
  });
});

describe('formatarTimestamp', () => {
  it('formata HH:MM corretamente', () => {
    const ts = new Date('2026-01-01T09:05:00').getTime();
    const resultado = formatarTimestamp(ts);
    expect(resultado).toMatch(/^\d{2}:\d{2}$/);
  });
});
