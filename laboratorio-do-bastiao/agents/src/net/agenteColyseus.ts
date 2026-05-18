import { Client } from 'colyseus.js';
import type { Room } from 'colyseus.js';

export interface AgenteColyseusOpcoes {
  serverUrl: string;
  agenteId: string;
  nome: string;
  skinId?: string;
  deskX?: number;
  deskY?: number;
  token?: string;
}

export class AgenteColyseusClient {
  private client: Client;
  private room: Room | null = null;

  constructor(private opcoes: AgenteColyseusOpcoes) {
    const wsUrl = opcoes.serverUrl.replace(/^http/, 'ws');
    this.client = new Client(wsUrl);
  }

  async conectar(): Promise<void> {
    this.room = await this.client.joinOrCreate('office_room', {
      agenteId: this.opcoes.agenteId,
      nome: this.opcoes.nome,
      skinId: this.opcoes.skinId,
      deskX: this.opcoes.deskX,
      deskY: this.opcoes.deskY,
      token: this.opcoes.token,
    });
  }

  enviarMensagem(texto: string, salaId = 'recepcao'): void {
    this.room?.send('chat', { texto, salaId });
  }

  desconectar(): void {
    this.room?.leave();
  }
}
