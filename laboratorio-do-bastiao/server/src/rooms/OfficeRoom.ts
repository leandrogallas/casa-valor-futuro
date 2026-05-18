// Sala Colyseus que representa um andar inteiro do escritório.
// Stub: ciclo de vida placeholder. Quando colyseus estiver instalado, esta classe
// passa a estender Room<OfficeState> e implementar onCreate/onJoin/onLeave/onMessage.
import { OfficeState } from './schema/OfficeState.js';

export class OfficeRoom {
  static readonly nome = 'office_room';
  state = new OfficeState();

  onCreate(_opcoes: Record<string, unknown>): void {
    // futuro: this.setState(new OfficeState());
    //         this.onMessage('move', (client, msg) => { ... })
  }

  onJoin(_clientId: string, _opcoes: Record<string, unknown>): void {
    // futuro: registrar jogador no this.state.jogadores
  }

  onLeave(_clientId: string): void {
    // futuro: remover jogador
  }
}
