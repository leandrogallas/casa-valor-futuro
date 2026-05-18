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
    name: 'tarefa_buscar',
    description: 'Busca tarefas abertas atribuídas a este agente, ordenadas por prioridade',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['aberta', 'em_andamento', 'concluida'],
          description: 'Filtro de status (padrão: aberta)',
        },
      },
      required: [],
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
  {
    name: 'reuniao_agendar',
    description: 'Agenda uma reunião com outros agentes ou humanos',
    input_schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string', description: 'Título da reunião' },
        descricao: { type: 'string', description: 'Pauta da reunião' },
        salaId: {
          type: 'string',
          enum: ['meeting1', 'meeting2', 'executive'],
          description: 'Sala de reunião',
        },
        inicioEm: { type: 'string', description: 'Data/hora ISO 8601 do início' },
        participanteIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs dos participantes (agentes ou usuários)',
        },
      },
      required: ['titulo', 'inicioEm'],
    },
  },
  {
    name: 'relatorio_criar',
    description: 'Cria um relatório diário (checkin, checkout ou reuniao)',
    input_schema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['checkin', 'checkout', 'reuniao', 'diario'],
          description: 'Tipo do relatório',
        },
        conteudo: { type: 'string', description: 'Conteúdo do relatório' },
        tarefasConcluidas: { type: 'number', description: 'Quantidade de tarefas concluídas' },
        tarefasAbertas: { type: 'number', description: 'Quantidade de tarefas ainda abertas' },
      },
      required: ['tipo', 'conteudo'],
    },
  },
];
