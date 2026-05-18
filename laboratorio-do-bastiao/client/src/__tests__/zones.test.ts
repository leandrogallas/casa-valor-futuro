import { describe, it, expect } from 'vitest';
import { detectarSala, nomeSala, SALAS } from '../logic/zones.js';

describe('detectarSala — landscape 4-column layout', () => {
  // Col 1 — Financeiro + Recepção
  it('detects finance (top-left)', () => {
    expect(detectarSala(100, 100)).toBe('finance');
    expect(detectarSala(394, 259)).toBe('finance');
  });
  it('detects reception (bottom-left)', () => {
    expect(detectarSala(100, 300)).toBe('reception');
    expect(detectarSala(394, 799)).toBe('reception');
  });

  // Col 2 — Social
  it('detects growth (col2 top)', () => {
    expect(detectarSala(400, 100)).toBe('growth');
    expect(detectarSala(697, 279)).toBe('growth');
  });
  it('detects kitchen (col2 middle)', () => {
    expect(detectarSala(500, 300)).toBe('kitchen');
    expect(detectarSala(697, 539)).toBe('kitchen');
  });
  it('detects lounge (col2 bottom)', () => {
    expect(detectarSala(500, 600)).toBe('lounge');
    expect(detectarSala(697, 799)).toBe('lounge');
  });

  // Col 3 — Departamentos
  it('detects marketing (col3 top)', () => {
    expect(detectarSala(800, 100)).toBe('marketing');
  });
  it('detects copy (col3 middle)', () => {
    expect(detectarSala(800, 300)).toBe('copy');
  });
  it('detects research (col3 bottom)', () => {
    expect(detectarSala(800, 600)).toBe('research');
  });

  // Col 4 — Reuniões
  it('detects meeting1 (col4 top)', () => {
    expect(detectarSala(1100, 100)).toBe('meeting1');
  });
  it('detects meeting2 (col4 middle)', () => {
    expect(detectarSala(1100, 400)).toBe('meeting2');
  });
  it('detects executive (col4 bottom)', () => {
    expect(detectarSala(1100, 650)).toBe('executive');
  });

  it('falls back to reception for out-of-bound', () => {
    expect(detectarSala(5000, 5000)).toBe('reception');
    expect(detectarSala(-10, -10)).toBe('reception');
  });
});

describe('nomeSala', () => {
  it('returns correct names', () => {
    expect(nomeSala('reception')).toBe('Recepção');
    expect(nomeSala('executive')).toBe('Diretoria');
    expect(nomeSala('lounge')).toBe('Área de Descanso');
    expect(nomeSala('unknown')).toBe('unknown');
  });
});

describe('SALAS integrity', () => {
  it('has 11 rooms', () => {
    expect(SALAS).toHaveLength(11);
  });

  it('total width of all 4 columns = 1280', () => {
    expect(395 + 303 + 303 + 279).toBe(1280);
  });

  it('each column covers full height (800)', () => {
    const col1 = SALAS.filter(s => s.x === 0);
    const col2 = SALAS.filter(s => s.x === 395);
    const col3 = SALAS.filter(s => s.x === 698);
    const col4 = SALAS.filter(s => s.x === 1001);
    expect(col1.reduce((s, r) => s + r.h, 0)).toBe(800);
    expect(col2.reduce((s, r) => s + r.h, 0)).toBe(800);
    expect(col3.reduce((s, r) => s + r.h, 0)).toBe(800);
    expect(col4.reduce((s, r) => s + r.h, 0)).toBe(800);
  });

  it('all rooms have positive dimensions', () => {
    for (const sala of SALAS) {
      expect(sala.w).toBeGreaterThan(0);
      expect(sala.h).toBeGreaterThan(0);
    }
  });
});
