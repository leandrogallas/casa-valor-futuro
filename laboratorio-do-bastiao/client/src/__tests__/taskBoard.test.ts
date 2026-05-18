import { describe, it, expect } from 'vitest';
import { labelStatus, corStatus, validarTarefaForm } from '../logic/taskBoard.js';

describe('labelStatus', () => {
  it.each([
    ['aberta', 'Aberta'],
    ['em_andamento', 'Em andamento'],
    ['concluida', 'Concluída'],
    ['cancelada', 'Cancelada'],
  ])('%s → "%s"', (input, expected) => {
    expect(labelStatus(input)).toBe(expected);
  });

  it('retorna o proprio valor quando status desconhecido', () => {
    expect(labelStatus('xyz_custom')).toBe('xyz_custom');
  });
});

describe('corStatus', () => {
  it.each([
    ['aberta', '#4dabf7'],
    ['em_andamento', '#fcc419'],
    ['concluida', '#51cf66'],
    ['cancelada', '#ff6b6b'],
  ])('%s → %s', (status, cor) => {
    expect(corStatus(status)).toBe(cor);
  });

  it('retorna cor fallback para status desconhecido', () => {
    expect(corStatus('??')).toBe('#888888');
  });
});

describe('validarTarefaForm', () => {
  it('retorna null quando título e responsável preenchidos', () => {
    expect(validarTarefaForm('Integrar API', 'agente-abc')).toBeNull();
  });

  it('erro quando título vazio', () => {
    expect(validarTarefaForm('', 'agente-abc')).toMatch(/título/i);
  });

  it('erro quando título só espaços', () => {
    expect(validarTarefaForm('   ', 'agente-abc')).toMatch(/título/i);
  });

  it('erro quando responsável vazio', () => {
    expect(validarTarefaForm('Minha tarefa', '')).toMatch(/responsável/i);
  });

  it('erro quando título excede 200 chars', () => {
    expect(validarTarefaForm('x'.repeat(201), 'agente-1')).toMatch(/longo/i);
  });

  it('aceita título com exatamente 200 chars', () => {
    expect(validarTarefaForm('a'.repeat(200), 'agente-1')).toBeNull();
  });
});
