import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

interface CriarRelatorioBody {
  agenteId?: string;
  data?: string;
  tipo?: string;
  conteudo?: string;
  tarefasConcluidas?: number;
  tarefasAbertas?: number;
}

export function criarRotasRelatorios(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const body = req.body as CriarRelatorioBody;
    const {
      agenteId, conteudo, tipo = 'checkout',
      tarefasConcluidas = 0, tarefasAbertas = 0,
    } = body;
    const data = body.data ?? new Date().toISOString().slice(0, 10);

    if (!agenteId || !conteudo) {
      res.status(400).json({ erro: 'agenteId e conteudo são obrigatórios' });
      return;
    }

    const tiposValidos = ['checkin', 'checkout', 'reuniao', 'diario'];
    if (!tiposValidos.includes(tipo)) {
      res.status(400).json({ erro: `tipo deve ser: ${tiposValidos.join(', ')}` });
      return;
    }

    const db = getDb();
    const agente = db.prepare('SELECT id FROM agentes WHERE id = ?').get(agenteId);
    if (!agente) { res.status(404).json({ erro: 'agente não encontrado' }); return; }

    const id = randomUUID();
    const agora = new Date().toISOString();
    db.prepare(
      `INSERT INTO relatorios_diarios
         (id, agente_id, data, tipo, conteudo, tarefas_concluidas, tarefas_abertas, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, agenteId, data, tipo, conteudo, tarefasConcluidas, tarefasAbertas, agora);

    escreverAuditEvent({ tipo: 'relatorio_criado', atorId: agenteId, payload: { relatorioId: id, tipoRelatorio: tipo, data } });

    res.status(201).json({ id, agenteId, data, tipo, tarefasConcluidas, tarefasAbertas });
  });

  router.get('/', (req, res) => {
    const db = getDb();
    const { agenteId, data, tipo, limit = '50', offset = '0' } = req.query as Record<string, string>;

    let sql = 'SELECT * FROM relatorios_diarios WHERE 1=1';
    const params: unknown[] = [];
    if (agenteId) { sql += ' AND agente_id = ?'; params.push(agenteId); }
    if (data)     { sql += ' AND data = ?';       params.push(data); }
    if (tipo)     { sql += ' AND tipo = ?';        params.push(tipo); }
    sql += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    res.json(db.prepare(sql).all(...params));
  });

  router.get('/:id', (req, res) => {
    const db = getDb();
    const relatorio = db.prepare('SELECT * FROM relatorios_diarios WHERE id = ?').get(req.params.id);
    if (!relatorio) { res.status(404).json({ erro: 'relatório não encontrado' }); return; }
    res.json(relatorio);
  });

  return router;
}
