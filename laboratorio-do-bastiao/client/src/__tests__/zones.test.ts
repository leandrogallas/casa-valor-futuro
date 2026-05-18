import { describe, it, expect } from 'vitest';
import { detectarSala, nomeSala, SALAS } from '../logic/zones.js';

const T = 32;

describe('detectarSala', () => {
  it('detects marketing zone', () => {
    expect(detectarSala(50, 13*T + 50)).toBe('marketing');
  });

  it('detects executive zone (top-right)', () => {
    expect(detectarSala(28*T + 10, 10)).toBe('executive');
  });

  it('detects reception zone (bottom)', () => {
    expect(detectarSala(13*T + 100, 39*T + 50)).toBe('reception');
  });

  it('falls back to reception for out-of-bound coords', () => {
    expect(detectarSala(5000, 5000)).toBe('reception');
  });

  it('detects meeting1 (top-left corner)', () => {
    expect(detectarSala(0, 0)).toBe('meeting1');
  });

  it('detects meeting2', () => {
    expect(detectarSala(14*T + 1, 1)).toBe('meeting2');
  });

  it('detects lounge (area de descanso)', () => {
    expect(detectarSala(27*T + 5, 26*T + 5)).toBe('lounge');
  });
});

describe('nomeSala', () => {
  it('returns name for known id', () => {
    expect(nomeSala('marketing')).toBe('Marketing');
    expect(nomeSala('reception')).toBe('Recepção');
    expect(nomeSala('executive')).toBe('Diretoria');
  });

  it('returns id itself for unknown id', () => {
    expect(nomeSala('unknown-room')).toBe('unknown-room');
  });
});

describe('SALAS constant', () => {
  it('has 11 rooms', () => {
    expect(SALAS).toHaveLength(11);
  });

  it('all rooms have positive dimensions', () => {
    for (const sala of SALAS) {
      expect(sala.w).toBeGreaterThan(0);
      expect(sala.h).toBeGreaterThan(0);
    }
  });
});
