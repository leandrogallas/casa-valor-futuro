export type DirecaoTile = 'up' | 'down' | 'left' | 'right';

export interface ZonaSala {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Landscape 1280×800 — mapa portrait rotacionado 90° CW
// Fluxo esquerda→direita: Recepção | Social | Departamentos | Reuniões/Dir
//
//  x=0  395   698   1001  1280
//  ┌──────┬──────┬──────┬──────┐ y=0
//  │Fin.  │Growt.│Mkt   │Meet.1│
//  │      ├──────┼──────┼──────┤ y=260/280
//  │      │Kitch.│Copy  │Meet.2│
//  ├──────┤      ├──────┼──────┤ y=540/800-240
//  │Recep.│Loung.│Pesq. │Exec. │
//  └──────┴──────┴──────┴──────┘ y=800

export const SALAS: ZonaSala[] = [
  // ── Col 1 — Recepção/Financeiro (x=0, w=395) ──────────────────────────
  { id: 'finance',   nome: 'Financeiro',         x: 0,    y: 0,   w: 395, h: 260 },
  { id: 'reception', nome: 'Recepção',           x: 0,    y: 260, w: 395, h: 540 },
  // ── Col 2 — Social (x=395, w=303) ─────────────────────────────────────
  { id: 'growth',    nome: 'Growth',             x: 395,  y: 0,   w: 303, h: 280 },
  { id: 'kitchen',   nome: 'Copa',               x: 395,  y: 280, w: 303, h: 260 },
  { id: 'lounge',    nome: 'Área de Descanso',  x: 395,  y: 540, w: 303, h: 260 },
  // ── Col 3 — Departamentos (x=698, w=303) ──────────────────────────────
  { id: 'marketing', nome: 'Marketing',          x: 698,  y: 0,   w: 303, h: 280 },
  { id: 'copy',      nome: 'Copy',               x: 698,  y: 280, w: 303, h: 260 },
  { id: 'research',  nome: 'Pesquisa',           x: 698,  y: 540, w: 303, h: 260 },
  // ── Col 4 — Reuniões / Diretoria (x=1001, w=279) ──────────────────────
  { id: 'meeting1',  nome: 'Sala de Reunião 1', x: 1001, y: 0,   w: 279, h: 280 },
  { id: 'meeting2',  nome: 'Sala de Reunião 2', x: 1001, y: 280, w: 279, h: 280 },
  { id: 'executive', nome: 'Diretoria',          x: 1001, y: 560, w: 279, h: 240 },
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
