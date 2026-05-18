import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { initDb, closeDb } from '../db/database.js';
import { criarRotasTarefas } from '../routes/tarefas.js';
import { getDb } from '../db/database.js';
import { randomUUID } from 'node:crypto';

function criarApp() {
  const app = express();
  app.use(express.json());
  app.use('/tarefas', criarRotasTarefas());
  return app;
}

function inserirUsuario(nome = 'Teste', email = 'teste@bastiao.dev') {
  const id = randomUUID();
  getDb()
    .prepare('INSERT INTO usuarios (id, nome, email, papel, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(id, nome, email, 'admin', new Date().toISOString());
  return id;
}

describe('Rotas /tarefas', () => {
  beforeEach(() => initDb(':memory:'));
  afterEach(() => closeDb());

  it('POST /tarefas cria tarefa e retorna 201', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    const res = await request(app).post('/tarefas').send({
      titulo: 'Fechar conciliação',
      descricao: 'Revisar abril',
      responsavelId: 'agente-xyz',
      autorId,
      prioridade: 'alta',
    });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Fechar conciliação');
    expect(res.body.status).toBe('aberta');
    expect(res.body.prioridade).toBe('alta');
    expect(res.body.id).toBeTruthy();
  });

  it('POST /tarefas retorna 400 sem campos obrigatórios', async () => {
    const app = criarApp();
    const res = await request(app).post('/tarefas').send({ titulo: 'Só título' });
    expect(res.status).toBe(400);
  });

  it('GET /tarefas retorna lista com tarefa criada', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    await request(app).post('/tarefas').send({
      titulo: 'Tarefa A',
      responsavelId: 'agente-1',
      autorId,
    });

    const res = await request(app).get('/tarefas');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Tarefa A');
  });

  it('PATCH /tarefas/:id/status atualiza status', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    const criarRes = await request(app).post('/tarefas').send({
      titulo: 'Tarefa B',
      responsavelId: 'agente-2',
      autorId,
    });

    const { id } = criarRes.body as { id: string };
    const patchRes = await request(app).patch(`/tarefas/${id}/status`).send({ status: 'em_andamento' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('em_andamento');
  });

  it('POST /tarefas grava audit event', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    await request(app).post('/tarefas').send({
      titulo: 'Com audit',
      responsavelId: 'agente-3',
      autorId,
    });

    const eventos = getDb()
      .prepare("SELECT * FROM audit_events WHERE tipo = 'tarefa_criada'")
      .all();
    expect(eventos).toHaveLength(1);
  });
});
