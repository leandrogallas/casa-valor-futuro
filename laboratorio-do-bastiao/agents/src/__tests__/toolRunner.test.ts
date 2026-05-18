import { vi, describe, it, expect, beforeEach } from 'vitest';
import { executarTool } from '../tools/runner.js';
import type { ToolRunnerContexto } from '../tools/runner.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeCtx(overrides: Partial<ToolRunnerContexto> = {}): ToolRunnerContexto {
  return {
    serverUrl: 'http://localhost:2567',
    agenteId: 'agente-1',
    enviarMensagemSala: vi.fn(),
    ...overrides,
  };
}

describe('executarTool', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tarefa_atualizar chama PATCH /tarefas/:id/status', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'concluida' }) });

    await executarTool('tarefa_atualizar', { tarefaId: 'tarefa-123', status: 'concluida' }, makeCtx());

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:2567/tarefas/tarefa-123/status',
      expect.objectContaining({ method: 'PATCH' }),
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.status).toBe('concluida');
  });

  it('mensagem_enviar chama enviarMensagemSala com salaId correto', async () => {
    const ctx = makeCtx();
    await executarTool('mensagem_enviar', { texto: 'Olá turma!', salaId: 'sala-dev' }, ctx);

    expect(ctx.enviarMensagemSala).toHaveBeenCalledWith('Olá turma!', 'sala-dev');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('mensagem_enviar usa recepcao como salaId padrão', async () => {
    const ctx = makeCtx();
    await executarTool('mensagem_enviar', { texto: 'Oi' }, ctx);
    expect(ctx.enviarMensagemSala).toHaveBeenCalledWith('Oi', 'recepcao');
  });

  it('artefato_criar chama POST /artefatos com autorId do contexto', async () => {
    mockFetch.mockResolvedValueOnce({ json: () => Promise.resolve({ id: 'art-1' }) });

    await executarTool(
      'artefato_criar',
      { titulo: 'Relatório', tipo: 'documento', conteudo: 'Conteúdo detalhado' },
      makeCtx(),
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:2567/artefatos',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.titulo).toBe('Relatório');
    expect(body.autorId).toBe('agente-1');
  });

  it('tool desconhecida lança erro', async () => {
    await expect(executarTool('tool_inexistente', {}, makeCtx())).rejects.toThrow(
      'Tool desconhecida: tool_inexistente',
    );
  });
});
