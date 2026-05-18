import { Schema, MapSchema, type } from '@colyseus/schema';

export class JogadorState extends Schema {
  @type('string') id: string = '';
  @type('string') nome: string = '';
  @type('number') x: number = 640;
  @type('number') y: number = 1400;
  @type('string') salaAtualId: string = 'reception';
  @type('string') direcao: string = 'down';
}

export class OfficeState extends Schema {
  @type('string') predioId: string = 'predio-principal';
  @type({ map: JogadorState }) jogadores = new MapSchema<JogadorState>();
}
