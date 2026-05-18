export interface ToolRunnerContexto {
  serverUrl: string;
  agenteId: string;
  enviarMensagemSala: (texto: string, salaId: string) => void;
}

export async function executarTool(
  nome: string,
  args: Record<string, unknown>,
  ctx: ToolRunnerContexto,
): Promise<unknown> {
  switch (nome) {
    case 'tarefa_atualizar': {
      const { tarefaId, status } = args as { tarefaId: string; status: string };
      const r = await fetch(`${ctx.serverUrl}/tarefas/${tarefaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return r.json();
    }

    case 'mensagem_enviar': {
      const { texto, salaId = 'recepcao' } = args as { texto: string; salaId?: string };
      ctx.enviarMensagemSala(texto, salaId as string);
      return { ok: true };
    }

    case 'artefato_criar': {
      const { titulo, tipo, conteudo, tarefaId } = args as {
        titulo: string;
        tipo: string;
        conteudo: string;
        tarefaId?: string;
      };
      const r = await fetch(`${ctx.serverUrl}/artefatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, tipo, conteudo, autorId: ctx.agenteId, tarefaId }),
      });
      return r.json();
    }

    default:
      throw new Error(`Tool desconhecida: ${nome}`);
  }
}
