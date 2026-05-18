export type DirecaoTile = 'up' | 'down' | 'left' | 'right';

export interface ZonaSala {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Mapa 40×55 tiles de 16px → 640×880px template → 1280×1760px PNG (density 2)
// Cada tile no mundo = 32px (16 * 2)
const T = 32;

export const SALAS: ZonaSala[] = [
  { id: 'meeting1',  nome: 'Sala de Reunião 1', x: 0,      y: 0,      w: 14*T, h: 12*T },
  { id: 'meeting2',  nome: 'Sala de Reunião 2', x: 14*T,   y: 0,      w: 14*T, h: 12*T },
  { id: 'executive', nome: 'Diretoria',          x: 28*T,   y: 0,      w: 12*T, h: 12*T },
  { id: 'marketing', nome: 'Marketing',          x: 0,      y: 13*T,   w: 14*T, h: 12*T },
  { id: 'copy',      nome: 'Copy',               x: 14*T,   y: 13*T,   w: 13*T, h: 12*T },
  { id: 'research',  nome: 'Pesquisa',           x: 27*T,   y: 13*T,   w: 13*T, h: 12*T },
  { id: 'growth',    nome: 'Growth',             x: 0,      y: 26*T,   w: 14*T, h: 12*T },
  { id: 'kitchen',   nome: 'Copa',               x: 14*T,   y: 26*T,   w: 13*T, h: 12*T },
  { id: 'lounge',    nome: 'Área de Descanso',  x: 27*T,   y: 26*T,   w: 13*T, h: 12*T },
  { id: 'finance',   nome: 'Financeiro',         x: 0,      y: 39*T,   w: 13*T, h: 14*T },
  { id: 'reception', nome: 'Recepção',           x: 13*T,   y: 39*T,   w: 27*T, h: 14*T },
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
