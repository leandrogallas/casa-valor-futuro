// Tipos de domínio compartilhados entre client, server e agents.
// Mantenha este arquivo como single source of truth — alterações aqui devem ser
// acompanhadas pela atualização correspondente em docs/03-modelo-de-dados.md.

export type UUID = string;
export type ISODateString = string;

// ---------------------------------------------------------------------------
// Identidade
// ---------------------------------------------------------------------------

export interface Usuario {
  id: UUID;
  nome: string;
  email: string;
  avatarUrl?: string;
  papel: PapelUsuario;
  criadoEm: ISODateString;
}

export type PapelUsuario = 'admin' | 'gestor' | 'colaborador' | 'visitante';

// ---------------------------------------------------------------------------
// Agentes IA
// ---------------------------------------------------------------------------

export interface Agente {
  id: UUID;
  nome: string;
  cargo: string;
  donoId: UUID;
  protocolo: ProtocoloAgente;
  modelo: string;
  promptDeSistema: string;
  ferramentas: string[];
  rotinaId?: UUID;
  estado: EstadoAgente;
  criadoEm: ISODateString;
}

export type ProtocoloAgente = 'mcp' | 'a2a' | 'mcp+a2a';
export type EstadoAgente = 'provisionando' | 'ocioso' | 'executando' | 'reportando' | 'desativado';

// ---------------------------------------------------------------------------
// Espaço
// ---------------------------------------------------------------------------

export interface Predio {
  id: UUID;
  nome: string;
  andares: Andar[];
}

export interface Andar {
  id: UUID;
  numero: number;
  predioId: UUID;
  salas: Sala[];
}

export interface Sala {
  id: UUID;
  nome: string;
  tipo: TipoSala;
  andarId: UUID;
  capacidade: number;
  tilemap: string;
}

export type TipoSala =
  | 'reuniao'
  | 'marketing'
  | 'diretoria'
  | 'financeiro'
  | 'contabil'
  | 'copa'
  | 'recepcao'
  | 'open_space';

// ---------------------------------------------------------------------------
// Trabalho
// ---------------------------------------------------------------------------

export interface Tarefa {
  id: UUID;
  titulo: string;
  descricao: string;
  responsavelId: UUID;
  autorId: UUID;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  prazo?: ISODateString;
  artefatos: UUID[];
  criadaEm: ISODateString;
}

export type StatusTarefa = 'aberta' | 'em_andamento' | 'em_revisao' | 'concluida' | 'cancelada';
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Rotina {
  id: UUID;
  agenteId: UUID;
  cron: string;
  payload: Record<string, unknown>;
  ativa: boolean;
}

export interface Conversa {
  id: UUID;
  salaId?: UUID;
  participantes: UUID[];
  mensagens: Mensagem[];
}

export interface Mensagem {
  id: UUID;
  autorId: UUID;
  conteudo: string;
  enviadaEm: ISODateString;
}

export interface Reuniao {
  id: UUID;
  salaId: UUID;
  pauta: string;
  participantes: UUID[];
  inicio: ISODateString;
  fim?: ISODateString;
  ata?: UUID;
}

export interface Artefato {
  id: UUID;
  tipo: 'documento' | 'imagem' | 'planilha' | 'log' | 'outro';
  uri: string;
  autorId: UUID;
  criadoEm: ISODateString;
}

// ---------------------------------------------------------------------------
// Segurança
// ---------------------------------------------------------------------------

export interface Permissao {
  id: UUID;
  titularId: UUID;
  escopo: string;
  acoes: ('ler' | 'escrever' | 'executar')[];
  expiraEm?: ISODateString;
}
