export const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:2567';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(`${SERVER}${path}`, opts);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ erro: `HTTP ${r.status}` })) as { erro?: string };
    throw new Error(err.erro ?? `HTTP ${r.status}`);
  }
  return r.json() as Promise<T>;
}

// ─── Agentes ────────────────────────────────────────────────────────────────
export interface Agente {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  skin_avatar: string;
  modelo: string;
  prompt_sistema: string;
  estado: string;
  ativo: number;
  desk_x: number;
  desk_y: number;
  criado_em: string;
}

export interface Rotina {
  agente_id: string;
  hora_inicio: string;
  hora_fim: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_semana: string;
  ativa: number;
}

export interface RotinaPatch {
  horaInicio?: string;
  horaFim?: string;
  almocoInicio?: string;
  almocoFim?: string;
  diasSemana?: string;
  ativa?: boolean;
}

export const agentes = {
  listar: () => req<Agente[]>('GET', '/agentes'),
  buscar: (id: string) => req<Agente>('GET', `/agentes/${id}`),
  criar: (body: Partial<Agente> & { donoId: string }) => req<Agente>('POST', '/agentes', body),
  atualizar: (id: string, body: Partial<Agente>) => req<Agente>('PATCH', `/agentes/${id}`, body),
  remover: (id: string) => req<{ ok: boolean }>('DELETE', `/agentes/${id}`),
  buscarRotina: (id: string) => req<Rotina>('GET', `/agentes/${id}/rotina`),
  salvarRotina: (id: string, body: RotinaPatch) => req<Rotina>('PATCH', `/agentes/${id}/rotina`, body),
};

// ─── Tarefas ─────────────────────────────────────────────────────────────────
export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  responsavel_id: string;
  autor_id: string;
  status: string;
  prioridade: string;
  criado_em: string;
}

export const tarefas = {
  listar: (params?: { status?: string; responsavelId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<Tarefa[]>('GET', `/tarefas${qs ? '?' + qs : ''}`);
  },
  criar: (body: Partial<Tarefa>) => req<Tarefa>('POST', '/tarefas', body),
  atualizarStatus: (id: string, status: string) =>
    req<Tarefa>('PATCH', `/tarefas/${id}/status`, { status }),
};

// ─── Reuniões ────────────────────────────────────────────────────────────────
export interface Reuniao {
  id: string;
  titulo: string;
  descricao: string;
  sala_id: string;
  inicio_em: string;
  fim_em: string | null;
  organizador_id: string;
  status: string;
  ata: string;
  criado_em: string;
  participantes: { reuniao_id: string; participante_id: string; tipo: string; confirmado: number }[];
}

export const reunioes = {
  listar: (params?: { status?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<Reuniao[]>('GET', `/reunioes${qs ? '?' + qs : ''}`);
  },
  criar: (body: {
    titulo: string;
    descricao?: string;
    salaId?: string;
    inicioEm: string;
    organizadorId: string;
    participantes?: { id: string; tipo: string }[];
  }) => req<Reuniao>('POST', '/reunioes', body),
  atualizarStatus: (id: string, status: string, ata?: string) =>
    req('PATCH', `/reunioes/${id}/status`, { status, ata }),
  salvarAta: (id: string, ata: string) => req('PATCH', `/reunioes/${id}/ata`, { ata }),
};

// ─── Relatórios ──────────────────────────────────────────────────────────────
export interface Relatorio {
  id: string;
  agente_id: string;
  data: string;
  tipo: string;
  conteudo: string;
  tarefas_concluidas: number;
  tarefas_abertas: number;
  criado_em: string;
}

export const relatorios = {
  listar: (params?: { agenteId?: string; data?: string; tipo?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<Relatorio[]>('GET', `/relatorios${qs ? '?' + qs : ''}`);
  },
};

// ─── Usuários (para seletor de dono) ─────────────────────────────────────────
export interface Usuario { id: string; nome: string; email: string; }
export const usuarios = {
  listar: () => req<Usuario[]>('GET', '/auth/usuarios').catch(() => [] as Usuario[]),
};
