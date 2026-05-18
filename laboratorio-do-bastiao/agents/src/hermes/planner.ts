export interface TarefaDisponivel {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
}

const PRIORIDADE_ORDEM: Record<string, number> = {
  urgente: 4,
  alta: 3,
  media: 2,
  baixa: 1,
};

export async function buscarTarefasAgente(
  serverUrl: string,
  agenteId: string,
): Promise<TarefaDisponivel[]> {
  const url = `${serverUrl}/tarefas?responsavelId=${agenteId}&status=aberta&limit=10`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const lista = (await resp.json()) as TarefaDisponivel[];
  return lista.sort(
    (a, b) => (PRIORIDADE_ORDEM[b.prioridade] ?? 0) - (PRIORIDADE_ORDEM[a.prioridade] ?? 0),
  );
}

export async function contarTarefas(
  serverUrl: string,
  agenteId: string,
): Promise<{ abertas: number; concluidas: number }> {
  const [abertas, concluidas] = await Promise.all([
    fetch(`${serverUrl}/tarefas?responsavelId=${agenteId}&status=aberta&limit=1`)
      .then((r) => r.json() as Promise<unknown[]>)
      .then((arr) => arr.length)
      .catch(() => 0),
    fetch(`${serverUrl}/tarefas?responsavelId=${agenteId}&status=concluida&limit=1`)
      .then((r) => r.json() as Promise<unknown[]>)
      .then((arr) => arr.length)
      .catch(() => 0),
  ]);
  return { abertas, concluidas };
}
