export type DirecaoTile = 'up' | 'down' | 'left' | 'right';

export interface ZonaSala {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Layout landscape 1280×800
// Row 1 (y=0,   h=280): salas privadas / reunião
// Row 2 (y=280, h=280): departamentos open space
// Row 3 (y=560, h=240): social + recepção

export const SALAS: ZonaSala[] = [
  // ── Row 1 ──────────────────────────────────────────
  { id: 'meeting1',  nome: 'Sala de Reunião 1', x: 0,    y: 0,   w: 426, h: 280 },
  { id: 'meeting2',  nome: 'Sala de Reunião 2', x: 426,  y: 0,   w: 427, h: 280 },
  { id: 'executive', nome: 'Diretoria',          x: 853,  y: 0,   w: 427, h: 280 },
  // ── Row 2 ──────────────────────────────────────────
  { id: 'marketing', nome: 'Marketing',          x: 0,    y: 280, w: 256, h: 280 },
  { id: 'copy',      nome: 'Copy',               x: 256,  y: 280, w: 256, h: 280 },
  { id: 'research',  nome: 'Pesquisa',           x: 512,  y: 280, w: 256, h: 280 },
  { id: 'growth',    nome: 'Growth',             x: 768,  y: 280, w: 256, h: 280 },
  { id: 'finance',   nome: 'Financeiro',         x: 1024, y: 280, w: 256, h: 280 },
  // ── Row 3 ──────────────────────────────────────────
  { id: 'kitchen',   nome: 'Copa',               x: 0,    y: 560, w: 320, h: 240 },
  { id: 'lounge',    nome: 'Área de Descanso',  x: 320,  y: 560, w: 320, h: 240 },
  { id: 'reception', nome: 'Recepção',           x: 640,  y: 560, w: 640, h: 240 },
];

export function detectarSala(x: number, y: number, salas: ZonaSala[] = SALAS): string {
  for (const sala of salas) {
    if (x >= sala.x && x < sala.x + sala.w && y >= sala.y && y < sala.y + sala.h) {
      return sala.id;
    }
  }
  return 'reception';
}

export function nomeSala(id: string): string {
  return SALAS.find((s) => s.id === id)?.nome ?? id;
}
