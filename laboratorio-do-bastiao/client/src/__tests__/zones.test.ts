import { describe, it, expect } from 'vitest';
import { detectarSala, nomeSala, SALAS } from '../logic/zones.js';

describe('detectarSala — landscape layout', () => {
  it('detects meeting1 (top-left)', () => {
    expect(detectarSala(10, 10)).toBe('meeting1');
    expect(detectarSala(200, 100)).toBe('meeting1');
  });

  it('detects meeting2 (top-center)', () => {
    expect(detectarSala(430, 10)).toBe('meeting2');  // x=426+4
    expect(detectarSala(640, 140)).toBe('meeting2');
  });

  it('detects executive (top-right)', () => {
    expect(detectarSala(860, 50)).toBe('executive'); // x=853+7
    expect(detectarSala(1100, 200)).toBe('executive');
  });

  it('detects marketing (row 2 leftmost)', () => {
    expect(detectarSala(50, 300)).toBe('marketing'); // y=280+20
    expect(detectarSala(200, 400)).toBe('marketing');
  });

  it('detects copy (row 2 second)', () => {
    expect(detectarSala(260, 300)).toBe('copy');     // x=256+4
  });

  it('detects research (row 2 middle)', () => {
    expect(detectarSala(520, 400)).toBe('research'); // x=512+8
  });

  it('detects growth (row 2 fourth)', () => {
    expect(detectarSala(780, 350)).toBe('growth');   // x=768+12
  });

  it('detects finance (row 2 rightmost)', () => {
    expect(detectarSala(1050, 400)).toBe('finance'); // x=1024+26
  });

  it('detects kitchen (row 3 left)', () => {
    expect(detectarSala(100, 600)).toBe('kitchen');  // y=560+40
  });

  it('detects lounge (row 3 center)', () => {
    expect(detectarSala(400, 650)).toBe('lounge');   // x=320+80
  });

  it('detects reception (row 3 right)', () => {
    expect(detectarSala(900, 680)).toBe('reception');// x=640+260
  });

  it('falls back to reception for out-of-bound', () => {
    expect(detectarSala(5000, 5000)).toBe('reception');
    expect(detectarSala(-1, -1)).toBe('reception');
  });
});

describe('nomeSala', () => {
  it('returns name for known id', () => {
    expect(nomeSala('marketing')).toBe('Marketing');
    expect(nomeSala('reception')).toBe('Recepção');
    expect(nomeSala('executive')).toBe('Diretoria');
    expect(nomeSala('lounge')).toBe('Área de Descanso');
  });

  it('returns id itself for unknown id', () => {
    expect(nomeSala('unknown')).toBe('unknown');
  });
});

describe('SALAS', () => {
  it('has 11 rooms', () => {
    expect(SALAS).toHaveLength(11);
  });

  it('total width of each row equals 1280', () => {
    const row1 = SALAS.filter(s => s.y === 0);
    const row2 = SALAS.filter(s => s.y === 280);
    const row3 = SALAS.filter(s => s.y === 560);
    expect(row1.reduce((s, r) => s + r.w, 0)).toBe(1280);
    expect(row2.reduce((s, r) => s + r.w, 0)).toBe(1280);
    expect(row3.reduce((s, r) => s + r.w, 0)).toBe(1280);
  });

  it('all rooms have positive dimensions', () => {
    for (const sala of SALAS) {
      expect(sala.w).toBeGreaterThan(0);
      expect(sala.h).toBeGreaterThan(0);
    }
  });
});
