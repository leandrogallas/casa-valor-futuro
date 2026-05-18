import { createServer } from 'node:http';
import express from 'express';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { carregarConfiguracao } from './config.js';
import { initDb } from './db/database.js';
import { OfficeRoom } from './rooms/OfficeRoom.js';
import { criarRotasAuth } from './routes/auth.js';
import { criarRotasAgentes } from './routes/agentes.js';
import { criarRotasTarefas } from './routes/tarefas.js';
import { criarRotasArtefatos } from './routes/artefatos.js';
import { criarRotasReunioes } from './routes/reunioes.js';
import { criarRotasRelatorios } from './routes/relatorios.js';

async function main(): Promise<void> {
  const cfg = carregarConfiguracao();

  initDb(cfg.sqlitePath);
  console.log(`[bastiao-server] SQLite em ${cfg.sqlitePath}`);

  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') { res.sendStatus(200); return; }
    next();
  });
  app.use(express.json());

  app.use('/auth', criarRotasAuth(cfg.jwtSecret));
  app.use('/agentes', criarRotasAgentes());
  app.use('/tarefas', criarRotasTarefas());
  app.use('/artefatos', criarRotasArtefatos());
  app.use('/reunioes', criarRotasReunioes());
  app.use('/relatorios', criarRotasRelatorios());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  const httpServer = createServer(app);

  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  gameServer.define(OfficeRoom.NOME, OfficeRoom);

  await gameServer.listen(cfg.porta);
  console.log(`[bastiao-server] rodando na porta ${cfg.porta}`);
}

main().catch((err) => {
  console.error('[bastiao-server] erro fatal:', err);
  process.exit(1);
});
