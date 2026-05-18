CREATE TABLE IF NOT EXISTS usuarios (
  id          TEXT PRIMARY KEY,
  nome        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  papel       TEXT NOT NULL DEFAULT 'colaborador',
  criado_em   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agentes (
  id              TEXT PRIMARY KEY,
  nome            TEXT NOT NULL,
  cargo           TEXT NOT NULL,
  dono_id         TEXT NOT NULL REFERENCES usuarios(id),
  modelo          TEXT NOT NULL,
  prompt_sistema  TEXT NOT NULL DEFAULT '',
  ferramentas_json TEXT NOT NULL DEFAULT '[]',
  estado          TEXT NOT NULL DEFAULT 'provisionando',
  criado_em       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tarefas (
  id              TEXT PRIMARY KEY,
  titulo          TEXT NOT NULL,
  descricao       TEXT NOT NULL DEFAULT '',
  responsavel_id  TEXT NOT NULL,
  autor_id        TEXT NOT NULL REFERENCES usuarios(id),
  status          TEXT NOT NULL DEFAULT 'aberta',
  prioridade      TEXT NOT NULL DEFAULT 'media',
  criado_em       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id           TEXT PRIMARY KEY,
  tipo         TEXT NOT NULL,
  ator_id      TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  criado_em    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tipo     ON audit_events(tipo);
CREATE INDEX IF NOT EXISTS idx_audit_events_ator_id  ON audit_events(ator_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_criado_em ON audit_events(criado_em);
CREATE INDEX IF NOT EXISTS idx_tarefas_status        ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel   ON tarefas(responsavel_id);

CREATE TABLE IF NOT EXISTS artefatos (
  id         TEXT PRIMARY KEY,
  titulo     TEXT NOT NULL,
  tipo       TEXT NOT NULL,
  conteudo   TEXT NOT NULL DEFAULT '',
  autor_id   TEXT NOT NULL,
  tarefa_id  TEXT,
  criado_em  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_artefatos_autor_id  ON artefatos(autor_id);
CREATE INDEX IF NOT EXISTS idx_artefatos_tarefa_id ON artefatos(tarefa_id);

-- Reuniões agendadas (entre agentes e/ou humanos)
CREATE TABLE IF NOT EXISTS reunioes (
  id              TEXT PRIMARY KEY,
  titulo          TEXT NOT NULL,
  descricao       TEXT NOT NULL DEFAULT '',
  sala_id         TEXT NOT NULL DEFAULT 'meeting1',
  inicio_em       TEXT NOT NULL,
  fim_em          TEXT,
  organizador_id  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'agendada',
  ata             TEXT NOT NULL DEFAULT '',
  criado_em       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participantes_reuniao (
  reuniao_id      TEXT NOT NULL REFERENCES reunioes(id) ON DELETE CASCADE,
  participante_id TEXT NOT NULL,
  tipo            TEXT NOT NULL DEFAULT 'agente',
  confirmado      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (reuniao_id, participante_id)
);

CREATE INDEX IF NOT EXISTS idx_reunioes_status   ON reunioes(status);
CREATE INDEX IF NOT EXISTS idx_reunioes_inicio   ON reunioes(inicio_em);

-- Relatórios diários dos agentes (check-in / checkout)
CREATE TABLE IF NOT EXISTS relatorios_diarios (
  id                   TEXT PRIMARY KEY,
  agente_id            TEXT NOT NULL REFERENCES agentes(id) ON DELETE CASCADE,
  data                 TEXT NOT NULL,
  tipo                 TEXT NOT NULL DEFAULT 'checkout',
  conteudo             TEXT NOT NULL,
  tarefas_concluidas   INTEGER NOT NULL DEFAULT 0,
  tarefas_abertas      INTEGER NOT NULL DEFAULT 0,
  criado_em            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_relatorios_agente ON relatorios_diarios(agente_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_relatorios_data   ON relatorios_diarios(data DESC);

-- Rotina de cada agente (horários de trabalho)
CREATE TABLE IF NOT EXISTS rotinas (
  agente_id      TEXT PRIMARY KEY REFERENCES agentes(id) ON DELETE CASCADE,
  hora_inicio    TEXT NOT NULL DEFAULT '09:00',
  hora_fim       TEXT NOT NULL DEFAULT '18:00',
  almoco_inicio  TEXT NOT NULL DEFAULT '12:00',
  almoco_fim     TEXT NOT NULL DEFAULT '13:00',
  dias_semana    TEXT NOT NULL DEFAULT '1,2,3,4,5',
  ativa          INTEGER NOT NULL DEFAULT 1,
  atualizado_em  TEXT NOT NULL
);
