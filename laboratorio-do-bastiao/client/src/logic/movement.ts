export interface KeyState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface Velocidade {
  vx: number;
  vy: number;
}

const DIAGONAL_FACTOR = 1 / Math.sqrt(2);

export function calcularVelocidade(keys: KeyState, velocidade: number): Velocidade {
  let vx = 0;
  let vy = 0;

  if (keys.up) vy -= velocidade;
  if (keys.down) vy += velocidade;
  if (keys.left) vx -= velocidade;
  if (keys.right) vx += velocidade;

  if (vx !== 0 && vy !== 0) {
    vx *= DIAGONAL_FACTOR;
    vy *= DIAGONAL_FACTOR;
  }

  return { vx, vy };
}

export function aplicarMovimento(
  x: number,
  y: number,
  vx: number,
  vy: number,
  deltaMs: number,
  limites: { minX: number; maxX: number; minY: number; maxY: number },
): { x: number; y: number } {
  const dt = deltaMs / 1000;
  const novoX = Math.max(limites.minX, Math.min(x + vx * dt, limites.maxX));
  const novoY = Math.max(limites.minY, Math.min(y + vy * dt, limites.maxY));
  return { x: novoX, y: novoY };
}
