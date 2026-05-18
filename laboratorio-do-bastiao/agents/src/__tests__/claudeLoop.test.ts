import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockMessagesCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: { create: mockMessagesCreate },
  })),
}));

const { executarLoopToolUse } = await import('../llm/claude.js');

const BASE_OPCOES = {
  modelo: 'claude-haiku-4-5-20251001',
  promptSistema: 'Você é um agente de escritório.',
  mensagemUsuario: 'Execute a tarefa',
  tools: [],
  executarTool: vi.fn(),
};

describe('executarLoopToolUse', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retorna texto quando stop_reason é end_turn', async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Tarefa concluída com sucesso.' }],
    });

    const result = await executarLoopToolUse(BASE_OPCOES);
    expect(result).toBe('Tarefa concluída com sucesso.');
  });

  it('chama executarTool e continua loop quando stop_reason é tool_use', async () => {
    mockMessagesCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          { type: 'tool_use', id: 'tu_abc', name: 'tarefa_atualizar', input: { tarefaId: 'xyz', status: 'concluida' } },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Feito.' }],
      });

    const executarTool = vi.fn().mockResolvedValue({ ok: true });
    const result = await executarLoopToolUse({ ...BASE_OPCOES, executarTool });

    expect(executarTool).toHaveBeenCalledWith('tarefa_atualizar', { tarefaId: 'xyz', status: 'concluida' });
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2);
    expect(result).toBe('Feito.');
  });

  it('retorna sentinel quando maxIteracoes é atingido', async () => {
    mockMessagesCreate.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', id: 'tu_1', name: 'tarefa_atualizar', input: {} }],
    });

    const result = await executarLoopToolUse({
      ...BASE_OPCOES,
      executarTool: vi.fn().mockResolvedValue({}),
      maxIteracoes: 2,
    });

    expect(mockMessagesCreate).toHaveBeenCalledTimes(2);
    expect(result).toBe('[max iterações atingido]');
  });

  it('retorna string vazia quando end_turn sem bloco de texto', async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      stop_reason: 'end_turn',
      content: [],
    });

    const result = await executarLoopToolUse(BASE_OPCOES);
    expect(result).toBe('');
  });
});
