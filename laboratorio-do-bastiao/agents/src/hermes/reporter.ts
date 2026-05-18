import { executarLoopToolUse } from '../llm/claude.js';
import { contarTarefas } from './planner.js';

export interface ReportConfig {
  agenteId: string;
  nome: string;
  modelo: string;
  promptSistema: string;
  serverUrl: string;
}

export async function gerarRelatorioCheckin(cfg: ReportConfig): Promise<string> {
  const { abertas } = await contarTarefas(cfg.serverUrl, cfg.agenteId);

  const conteudo = await executarLoopToolUse({
    modelo: cfg.modelo,
    promptSistema: cfg.promptSistema,
    mensagemUsuario: `Gere uma mensagem curta de check-in de início de dia (3-4 linhas).
Você tem ${abertas} tarefas abertas. Informe o que pretende fazer hoje.
Formato: tom profissional, primeira pessoa, pt-BR.`,
    tools: [],
    executarTool: async () => ({}),
    maxIteracoes: 1,
  });

  await salvarRelatorio(cfg.serverUrl, {
    agenteId: cfg.agenteId,
    tipo: 'checkin',
    conteudo,
    tarefasAbertas: abertas,
    tarefasConcluidas: 0,
  });

  return conteudo;
}

export async function gerarRelatorioCheckout(cfg: ReportConfig): Promise<string> {
  const { abertas, concluidas } = await contarTarefas(cfg.serverUrl, cfg.agenteId);

  const conteudo = await executarLoopToolUse({
    modelo: cfg.modelo,
    promptSistema: cfg.promptSistema,
    mensagemUsuario: `Gere um relatório de fim de dia (5-8 linhas).
Resumo do dia: ${concluidas} tarefas concluídas, ${abertas} ainda abertas.
Inclua: o que foi feito, pontos de atenção, próximos passos para amanhã.
Formato: tom profissional, primeira pessoa, pt-BR.`,
    tools: [],
    executarTool: async () => ({}),
    maxIteracoes: 1,
  });

  await salvarRelatorio(cfg.serverUrl, {
    agenteId: cfg.agenteId,
    tipo: 'checkout',
    conteudo,
    tarefasAbertas: abertas,
    tarefasConcluidas: concluidas,
  });

  return conteudo;
}

async function salvarRelatorio(
  serverUrl: string,
  payload: {
    agenteId: string;
    tipo: string;
    conteudo: string;
    tarefasAbertas: number;
    tarefasConcluidas: number;
  },
): Promise<void> {
  await fetch(`${serverUrl}/relatorios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agenteId: payload.agenteId,
      tipo: payload.tipo,
      conteudo: payload.conteudo,
      tarefasAbertas: payload.tarefasAbertas,
      tarefasConcluidas: payload.tarefasConcluidas,
    }),
  }).catch(() => {}); // log silencioso — não bloqueia a rotina
}
