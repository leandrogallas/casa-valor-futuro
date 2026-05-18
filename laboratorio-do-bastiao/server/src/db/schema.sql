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
