import { Room, Client } from 'colyseus';
import { OfficeState, JogadorState } from './schema/OfficeState.js';
import { escreverAuditEvent } from '../db/auditLog.js';

const BOUNDS = { x: [0, 1280], y: [0, 800] } as const;
const DIRS_VALIDAS = new Set(['up', 'down', 'left', 'right']);

interface MoveMsg {
  x: number;
  y: number;
  direcao?: string;
}

interface ChatMsg {
  texto: string;
  salaId: string;
}

export class OfficeRoom extends Room<OfficeState> {
  static readonly NOME = 'office_room';

  onCreate(_opcoes: Record<string, unknown>): void {
    this.setState(new OfficeState());

    this.onMessage<MoveMsg>('move', (client, msg) => {
      const jogador = this.state.jogadores.get(client.sessionId);
      if (!jogador) return;
      jogador.x = Math.max(BOUNDS.x[0], Math.min(msg.x, BOUNDS.x[1]));
      jogador.y = Math.max(BOUNDS.y[0], Math.min(msg.y, BOUNDS.y[1]));
      if (msg.direcao && DIRS_VALIDAS.has(msg.direcao)) {
        jogador.direcao = msg.direcao;
      }
    });

    this.onMessage<ChatMsg>('chat', (client, msg) => {
      const jogador = this.state.jogadores.get(client.sessionId);
      const autorNome = jogador?.nome ?? 'Anônimo';
      escreverAuditEvent({
        tipo: 'chat',
        atorId: client.sessionId,
        payload: { texto: msg.texto, salaId: msg.salaId, autorNome },
      });
      this.broadcast('chat', {
        autorId: client.sessionId,
        autorNome,
        texto: msg.texto,
        salaId: msg.salaId,
      });
    });
  }

  onJoin(client: Client, opcoes: { nome?: string; userId?: string } = {}): void {
    const jogador = new JogadorState();
    jogador.id = opcoes.userId ?? client.sessionId;
    jogador.nome = opcoes.nome ?? 'Anônimo';
    jogador.x = 960;
    jogador.y = 680;
    jogador.salaAtualId = 'reception';
    jogador.direcao = 'down';
    this.state.jogadores.set(client.sessionId, jogador);

    escreverAuditEvent({
      tipo: 'jogador_entrou',
      atorId: jogador.id,
      payload: { nome: jogador.nome, sessionId: client.sessionId },
    });
  }

  onLeave(client: Client): void {
    const jogador = this.state.jogadores.get(client.sessionId);
    escreverAuditEvent({
      tipo: 'jogador_saiu',
      atorId: jogador?.id ?? client.sessionId,
      payload: { sessionId: client.sessionId },
    });
    this.state.jogadores.delete(client.sessionId);
  }
}
