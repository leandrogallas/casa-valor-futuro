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

    case 'tarefa_buscar': {
      const { status = 'aberta' } = args as { status?: string };
      const r = await fetch(
        `${ctx.serverUrl}/tarefas?responsavelId=${ctx.agenteId}&status=${status}&limit=10`,
      );
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

    case 'reuniao_agendar': {
      const { titulo, descricao = '', salaId = 'meeting1', inicioEm, participanteIds = [] } = args as {
        titulo: string;
        descricao?: string;
        salaId?: string;
        inicioEm: string;
        participanteIds?: string[];
      };
      const participantes = (participanteIds as string[]).map((id) => ({ id, tipo: 'agente' }));
      const r = await fetch(`${ctx.serverUrl}/reunioes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo, descricao, salaId, inicioEm,
          organizadorId: ctx.agenteId, participantes,
        }),
      });
      return r.json();
    }

    case 'relatorio_criar': {
      const { tipo, conteudo, tarefasConcluidas = 0, tarefasAbertas = 0 } = args as {
        tipo: string;
        conteudo: string;
        tarefasConcluidas?: number;
        tarefasAbertas?: number;
      };
      const r = await fetch(`${ctx.serverUrl}/relatorios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenteId: ctx.agenteId, tipo, conteudo, tarefasConcluidas, tarefasAbertas }),
      });
      return r.json();
    }

    default:
      throw new Error(`Tool desconhecida: ${nome}`);
  }
}
