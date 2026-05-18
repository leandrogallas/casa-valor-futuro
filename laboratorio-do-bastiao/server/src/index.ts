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

async function main(): Promise<void> {
  const cfg = carregarConfiguracao();

  initDb(cfg.sqlitePath);
  console.log(`[bastiao-server] SQLite em ${cfg.sqlitePath}`);

  const app = express();
  app.use(express.json());

  app.use('/auth', criarRotasAuth(cfg.jwtSecret));
  app.use('/agentes', criarRotasAgentes());
  app.use('/tarefas', criarRotasTarefas());

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
