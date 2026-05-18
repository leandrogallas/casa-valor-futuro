import { executarLoopToolUse } from './llm/claude.js';
import { TOOLS } from './llm/tools.js';
import { executarTool } from './tools/runner.js';
import { AgenteColyseusClient } from './net/agenteColyseus.js';

export interface ConfiguracaoWorker {
  agenteId: string;
  nome: string;
  modelo: string;
  promptSistema: string;
  serverUrl: string;
  token?: string;
}

export class AgenteWorker {
  private colyseus: AgenteColyseusClient;

  constructor(private config: ConfiguracaoWorker) {
    this.colyseus = new AgenteColyseusClient({
      serverUrl: config.serverUrl,
      agenteId: config.agenteId,
      nome: config.nome,
      token: config.token,
    });
  }

  async iniciar(): Promise<void> {
    await this.colyseus.conectar();
  }

  async executarTarefa(tarefaId: string, descricao: string): Promise<string> {
    return executarLoopToolUse({
      modelo: this.config.modelo,
      promptSistema: this.config.promptSistema,
      mensagemUsuario: `Tarefa #${tarefaId}: ${descricao}`,
      tools: TOOLS,
      executarTool: (nome, args) =>
        executarTool(nome, args, {
          serverUrl: this.config.serverUrl,
          agenteId: this.config.agenteId,
          enviarMensagemSala: (texto, salaId) => this.colyseus.enviarMensagem(texto, salaId),
        }),
    });
  }

  encerrar(): void {
    this.colyseus.desconectar();
  }
}
