// Transporte A2A (Agent-to-Agent) — comunicação entre agentes em uma mesma sala.
// Stub: API mínima que será preenchida quando o protocolo for adotado.

export interface A2AMensagem {
  de: string;
  para: string;
  tipo: string;
  payload: Record<string, unknown>;
}

export interface A2ATransport {
  enviar(mensagem: A2AMensagem): Promise<void>;
  receber(handler: (mensagem: A2AMensagem) => void): void;
  fechar(): Promise<void>;
}

export function criarA2ATransport(): A2ATransport {
  const handlers: ((m: A2AMensagem) => void)[] = [];
  return {
    async enviar(_mensagem) {
      // futuro: serializar e publicar (NATS / WebSocket / etc.)
    },
    receber(handler) {
      handlers.push(handler);
    },
    async fechar() {
      handlers.length = 0;
    },
  };
}
