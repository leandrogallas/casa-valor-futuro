import { describe, it, expect } from 'vitest';
import { calcularVelocidade, aplicarMovimento } from '../logic/movement.js';

const LIMITES = { minX: 0, maxX: 800, minY: 0, maxY: 800 };

describe('calcularVelocidade', () => {
  it('parado quando nenhuma tecla pressionada', () => {
    const v = calcularVelocidade({ up: false, down: false, left: false, right: false }, 200);
    expect(v).toEqual({ vx: 0, vy: 0 });
  });

  it('move para cima (vy negativo)', () => {
    const v = calcularVelocidade({ up: true, down: false, left: false, right: false }, 200);
    expect(v.vy).toBe(-200);
    expect(v.vx).toBe(0);
  });

  it('move para baixo (vy positivo)', () => {
    const v = calcularVelocidade({ up: false, down: true, left: false, right: false }, 200);
    expect(v.vy).toBe(200);
  });

  it('move para direita (vx positivo)', () => {
    const v = calcularVelocidade({ up: false, down: false, left: false, right: true }, 200);
    expect(v.vx).toBe(200);
    expect(v.vy).toBe(0);
  });

  it('normaliza diagonal (comprimento == velocidade)', () => {
    const speed = 200;
    const v = calcularVelocidade({ up: true, down: false, left: false, right: true }, speed);
    const comprimento = Math.sqrt(v.vx ** 2 + v.vy ** 2);
    expect(comprimento).toBeCloseTo(speed, 5);
  });

  it('teclas opostas se cancelam', () => {
    const v = calcularVelocidade({ up: true, down: true, left: false, right: false }, 200);
    expect(v.vy).toBe(0);
  });
});

describe('aplicarMovimento', () => {
  it('move na direção certa no delta dado', () => {
    const { x, y } = aplicarMovimento(100, 100, 200, 0, 500, LIMITES); // 500ms = 0.5s
    expect(x).toBeCloseTo(200, 1); // 100 + 200*0.5
    expect(y).toBe(100);
  });

  it('clamp no limite maxX', () => {
    const { x } = aplicarMovimento(795, 100, 200, 0, 1000, LIMITES);
    expect(x).toBe(800);
  });

  it('clamp no limite minX', () => {
    const { x } = aplicarMovimento(5, 100, -200, 0, 1000, LIMITES);
    expect(x).toBe(0);
  });

  it('parado quando vx=vy=0', () => {
    const { x, y } = aplicarMovimento(300, 400, 0, 0, 1000, LIMITES);
    expect(x).toBe(300);
    expect(y).toBe(400);
  });
});
