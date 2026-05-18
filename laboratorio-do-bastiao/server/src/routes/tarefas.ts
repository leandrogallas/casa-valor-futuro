import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

interface CriarTarefaBody {
  titulo?: string;
  descricao?: string;
  responsavelId?: string;
  autorId?: string;
  prioridade?: string;
}

export function criarRotasTarefas(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const body = req.body as CriarTarefaBody;
    const { titulo, descricao = '', responsavelId, autorId, prioridade = 'media' } = body;

    if (!titulo || !responsavelId || !autorId) {
      res.status(400).json({ erro: 'titulo, responsavelId e autorId são obrigatórios' });
      return;
    }

    const prioridadesValidas = ['baixa', 'media', 'alta', 'urgente'];
    if (!prioridadesValidas.includes(prioridade)) {
      res.status(400).json({ erro: `prioridade deve ser: ${prioridadesValidas.join(', ')}` });
      return;
    }

    const db = getDb();
    const id = randomUUID();
    const criadoEm = new Date().toISOString();

    db.prepare(
      `INSERT INTO tarefas (id, titulo, descricao, responsavel_id, autor_id, status, prioridade, criado_em)
       VALUES (?, ?, ?, ?, ?, 'aberta', ?, ?)`,
    ).run(id, titulo, descricao, responsavelId, autorId, prioridade, criadoEm);

    escreverAuditEvent({
      tipo: 'tarefa_criada',
      atorId: autorId,
      payload: { tarefaId: id, titulo, responsavelId },
    });

    res.status(201).json({ id, titulo, descricao, responsavelId, autorId, status: 'aberta', prioridade, criadoEm });
  });

  router.get('/', (req, res) => {
    const db = getDb();
    const { status, responsavelId, limit = '50', offset = '0' } = req.query as Record<string, string>;

    let sql = 'SELECT * FROM tarefas WHERE 1=1';
    const params: (string | number)[] = [];

    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (responsavelId) { sql += ' AND responsavel_id = ?'; params.push(responsavelId); }

    sql += ' ORDER BY criado_em DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const tarefas = db.prepare(sql).all(...params);
    res.json(tarefas);
  });

  router.patch('/:id/status', (req, res) => {
    const { status } = req.body as { status?: string };
    const statusValidos = ['aberta', 'em_andamento', 'em_revisao', 'concluida', 'cancelada'];

    if (!status || !statusValidos.includes(status)) {
      res.status(400).json({ erro: `status deve ser: ${statusValidos.join(', ')}` });
      return;
    }

    const db = getDb();
    const result = db
      .prepare('UPDATE tarefas SET status = ? WHERE id = ?')
      .run(status, req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ erro: 'Tarefa não encontrada' });
      return;
    }

    escreverAuditEvent({
      tipo: 'tarefa_status_atualizado',
      atorId: 'sistema',
      payload: { tarefaId: req.params.id, novoStatus: status },
    });

    res.json({ id: req.params.id, status });
  });

  return router;
}
