import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

interface CriarAgenteBody {
  nome?: string;
  cargo?: string;
  donoId?: string;
  modelo?: string;
  promptSistema?: string;
  ferramentas?: string[];
}

export function criarRotasAgentes(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const body = req.body as CriarAgenteBody;
    const { nome, cargo, donoId, modelo, promptSistema = '', ferramentas = [] } = body;

    if (!nome || !cargo || !donoId || !modelo) {
      res.status(400).json({ erro: 'nome, cargo, donoId e modelo são obrigatórios' });
      return;
    }

    const db = getDb();
    const dono = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(donoId);
    if (!dono) {
      res.status(404).json({ erro: 'donoId não encontrado' });
      return;
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO agentes (id, nome, cargo, dono_id, modelo, prompt_sistema, ferramentas_json, estado, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'provisionando', ?)`,
    ).run(id, nome, cargo, donoId, modelo, promptSistema, JSON.stringify(ferramentas), new Date().toISOString());

    escreverAuditEvent({ tipo: 'agente_criado', atorId: donoId, payload: { agenteId: id, nome, cargo } });

    res.status(201).json({ id, nome, cargo, donoId, modelo, estado: 'provisionando' });
  });

  router.get('/', (req, res) => {
    const db = getDb();
    const agentes = db
      .prepare('SELECT id, nome, cargo, dono_id, modelo, estado, criado_em FROM agentes ORDER BY criado_em DESC')
      .all();
    res.json(agentes);
  });

  return router;
}
