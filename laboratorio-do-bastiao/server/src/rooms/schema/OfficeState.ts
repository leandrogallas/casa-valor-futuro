import { Schema, MapSchema, type } from '@colyseus/schema';

export class JogadorState extends Schema {
  @type('string') declare id: string;
  @type('string') declare nome: string;
  @type('number') declare x: number;
  @type('number') declare y: number;
  @type('string') declare salaAtualId: string;
  @type('string') declare direcao: string;
  @type('string') declare tipo: string;
  @type('string') declare skinId: string;
}

export class OfficeState extends Schema {
  @type('string') declare predioId: string;
  @type({ map: JogadorState }) declare jogadores: MapSchema<JogadorState>;
}
