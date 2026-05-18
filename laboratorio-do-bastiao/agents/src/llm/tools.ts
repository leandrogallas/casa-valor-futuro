import type { Tool } from '@anthropic-ai/sdk/resources/messages.js';

export const TOOLS: Tool[] = [
  {
    name: 'tarefa_atualizar',
    description: 'Atualiza o status de uma tarefa no sistema',
    input_schema: {
      type: 'object',
      properties: {
        tarefaId: { type: 'string', description: 'ID da tarefa' },
        status: {
          type: 'string',
          enum: ['aberta', 'em_andamento', 'concluida', 'cancelada'],
          description: 'Novo status',
        },
      },
      required: ['tarefaId', 'status'],
    },
  },
  {
    name: 'mensagem_enviar',
    description: 'Envia mensagem de chat para uma sala do escritório virtual',
    input_schema: {
      type: 'object',
      properties: {
        texto: { type: 'string', description: 'Texto da mensagem' },
        salaId: { type: 'string', description: 'ID da sala (padrão: recepcao)' },
      },
      required: ['texto'],
    },
  },
  {
    name: 'artefato_criar',
    description: 'Cria um artefato (documento, código ou análise) no sistema',
    input_schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        tipo: { type: 'string', enum: ['documento', 'codigo', 'analise'] },
        conteudo: { type: 'string' },
        tarefaId: { type: 'string', description: 'ID da tarefa relacionada (opcional)' },
      },
      required: ['titulo', 'tipo', 'conteudo'],
    },
  },
];
