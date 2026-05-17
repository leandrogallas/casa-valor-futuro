// Schema de estado sincronizado entre servidor e clientes para uma sala office.
// Stub agnóstico ao @colyseus/schema enquanto a dependência não está instalada.

export interface JogadorState {
  id: string;
  nome: string;
  x: number;
  y: number;
  salaAtualId: string;
}

export interface OfficeStateShape {
  predioId: string;
  jogadores: Map<string, JogadorState>;
}

export class OfficeState implements OfficeStateShape {
  predioId = '';
  jogadores: Map<string, JogadorState> = new Map();
}
