// Cliente Colyseus — encapsula conexão com o servidor e roteamento de mensagens.
// Stub: API real fica disponível quando colyseus.js for instalado.

export interface OpcoesConexao {
  endpoint: string;
  token?: string;
}

export class BastiaoNetClient {
  constructor(private readonly opcoes: OpcoesConexao) {}

  async conectar(): Promise<void> {
    // futuro: new Colyseus.Client(this.opcoes.endpoint).joinOrCreate('office_room', { token })
    return Promise.resolve();
  }

  desconectar(): void {
    // futuro: this.room?.leave()
  }
}
