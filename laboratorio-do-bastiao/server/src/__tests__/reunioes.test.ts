import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initDb, closeDb, getDb } from '../db/database.js';
import { criarRotasReunioes } from '../routes/reunioes.js';
import { randomUUID } from 'node:crypto';

function criarApp() {
  const app = express();
  app.use(express.json());
  app.use('/reunioes', criarRotasReunioes());
  return app;
}

function inserirAgente(nome = 'Agente Teste') {
  const db = getDb();
  const usuarioId = randomUUID();
  const emailUniq = `dono-${usuarioId.slice(0, 8)}@test.dev`;
  db.prepare('INSERT INTO usuarios (id, nome, email, papel, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(usuarioId, 'Dono', emailUniq, 'admin', new Date().toISOString());
  const id = `agente-${randomUUID().slice(0, 8)}`;
  db.prepare(
    `INSERT INTO agentes (id, nome, cargo, dono_id, modelo, prompt_sistema, estado, criado_em)
     VALUES (?, ?, 'Cargo', ?, 'claude-sonnet-4-6', '', 'ativo', ?)`,
  ).run(id, nome, usuarioId, new Date().toISOString());
  return id;
}

describe('Rotas /reunioes', () => {
  beforeEach(() => initDb(':memory:'));
  afterEach(() => closeDb());

  it('POST /reunioes cria reunião e retorna 201', async () => {
    const app = criarApp();
    const orgId = inserirAgente('Organizador');

    const resp = await request(app).post('/reunioes').send({
      titulo: 'Alinhamento Q2',
      salaId: 'meeting1',
      inicioEm: new Date().toISOString(),
      organizadorId: orgId,
    });

    expect(resp.status).toBe(201);
    expect(resp.body.titulo).toBe('Alinhamento Q2');
    expect(resp.body.status).toBe('agendada');
  });

  it('GET /reunioes lista reuniões com participantes', async () => {
    const app = criarApp();
    const orgId = inserirAgente('Org');
    const partId = inserirAgente('Part');

    await request(app).post('/reunioes').send({
      titulo: 'Reunião Teste',
      salaId: 'meeting2',
      inicioEm: new Date().toISOString(),
      organizadorId: orgId,
      participantes: [{ id: partId, tipo: 'agente' }],
    });

    const resp = await request(app).get('/reunioes');
    expect(resp.status).toBe(200);
    expect(resp.body).toHaveLength(1);
    expect(resp.body[0].participantes.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /reunioes/:id/status atualiza status para em_andamento', async () => {
    const app = criarApp();
    const orgId = inserirAgente('Org');

    const { body: criada } = await request(app).post('/reunioes').send({
      titulo: 'Reunião Status',
      inicioEm: new Date().toISOString(),
      organizadorId: orgId,
    });

    const resp = await request(app)
      .patch(`/reunioes/${criada.id}/status`)
      .send({ status: 'em_andamento' });

    expect(resp.status).toBe(200);
    expect(resp.body.status).toBe('em_andamento');
  });

  it('PATCH /reunioes/:id/status salva ata ao concluir', async () => {
    const app = criarApp();
    const orgId = inserirAgente('Org');

    const { body: criada } = await request(app).post('/reunioes').send({
      titulo: 'Reunião com Ata',
      inicioEm: new Date().toISOString(),
      organizadorId: orgId,
    });

    const ata = 'Discutimos os OKRs. Próximo passo: revisar métricas.';
    const resp = await request(app)
      .patch(`/reunioes/${criada.id}/status`)
      .send({ status: 'concluida', ata });

    expect(resp.status).toBe(200);
    expect(resp.body.ata).toBe(ata);
    expect(resp.body.fim_em).toBeTruthy();
  });

  it('POST /reunioes retorna 400 sem campos obrigatórios', async () => {
    const app = criarApp();
    const resp = await request(app).post('/reunioes').send({ titulo: 'Incompleta' });
    expect(resp.status).toBe(400);
  });
});
