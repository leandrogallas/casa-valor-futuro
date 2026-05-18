import Anthropic from '@anthropic-ai/sdk';
import type { Tool, MessageParam } from '@anthropic-ai/sdk/resources/messages.js';

export type { Tool };

export interface ExecutarLoopOpcoes {
  modelo: string;
  promptSistema: string;
  mensagemUsuario: string;
  tools: Tool[];
  executarTool: (nome: string, args: Record<string, unknown>) => Promise<unknown>;
  maxIteracoes?: number;
}

export async function executarLoopToolUse(opcoes: ExecutarLoopOpcoes): Promise<string> {
  const client = new Anthropic();
  const messages: MessageParam[] = [{ role: 'user', content: opcoes.mensagemUsuario }];
  const max = opcoes.maxIteracoes ?? 10;

  for (let i = 0; i < max; i++) {
    const response = await client.messages.create({
      model: opcoes.modelo,
      max_tokens: 1024,
      system: opcoes.promptSistema,
      tools: opcoes.tools,
      messages,
    });

    if (response.stop_reason === 'end_turn') {
      const block = response.content.find((b) => b.type === 'text');
      return block && block.type === 'text' ? block.text : '';
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const resultados: MessageParam['content'] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await opcoes.executarTool(block.name, block.input as Record<string, unknown>);
          resultados.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }
      if (resultados.length > 0) {
        messages.push({ role: 'user', content: resultados });
      }
    }
  }

  return '[max iterações atingido]';
}
