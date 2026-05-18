import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { initDb, closeDb, getDb } from '../db/database.js';
import { criarRotasArtefatos } from '../routes/artefatos.js';

function criarApp() {
  const app = express();
  app.use(express.json());
  app.use('/artefatos', criarRotasArtefatos());
  return app;
}

function inserirUsuario() {
  const id = randomUUID();
  getDb()
    .prepare('INSERT INTO usuarios (id, nome, email, papel, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(id, 'Agente Teste', `agente-${id}@bastiao.dev`, 'colaborador', new Date().toISOString());
  return id;
}

describe('Rotas /artefatos', () => {
  beforeEach(() => initDb(':memory:'));
  afterEach(() => closeDb());

  it('POST /artefatos cria artefato e retorna 201', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    const res = await request(app).post('/artefatos').send({
      titulo: 'Análise de Mercado',
      tipo: 'analise',
      conteudo: 'Conteúdo detalhado...',
      autorId,
    });

    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Análise de Mercado');
    expect(res.body.tipo).toBe('analise');
    expect(res.body.id).toBeTruthy();
  });

  it('POST /artefatos retorna 400 sem campos obrigatórios', async () => {
    const app = criarApp();
    const res = await request(app).post('/artefatos').send({ titulo: 'Só título' });
    expect(res.status).toBe(400);
  });

  it('POST /artefatos retorna 400 com tipo inválido', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    const res = await request(app).post('/artefatos').send({
      titulo: 'Teste',
      tipo: 'tipo_invalido',
      conteudo: 'x',
      autorId,
    });
    expect(res.status).toBe(400);
  });

  it('GET /artefatos retorna lista com artefato criado', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    await request(app).post('/artefatos').send({
      titulo: 'Código gerado',
      tipo: 'codigo',
      conteudo: 'console.log("hi")',
      autorId,
    });

    const res = await request(app).get('/artefatos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Código gerado');
  });

  it('POST /artefatos grava audit event', async () => {
    const app = criarApp();
    const autorId = inserirUsuario();

    await request(app).post('/artefatos').send({
      titulo: 'Doc com audit',
      tipo: 'documento',
      conteudo: 'corpo',
      autorId,
    });

    const eventos = getDb()
      .prepare("SELECT * FROM audit_events WHERE tipo = 'artefato_criado'")
      .all();
    expect(eventos).toHaveLength(1);
  });
});
