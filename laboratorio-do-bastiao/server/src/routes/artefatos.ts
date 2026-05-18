import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

interface CriarArtefatoBody {
  titulo?: string;
  tipo?: string;
  conteudo?: string;
  autorId?: string;
  tarefaId?: string;
}

const TIPOS_VALIDOS = ['documento', 'codigo', 'analise'] as const;

export function criarRotasArtefatos(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const { titulo, tipo, conteudo = '', autorId, tarefaId } = req.body as CriarArtefatoBody;

    if (!titulo || !tipo || !autorId) {
      res.status(400).json({ erro: 'titulo, tipo e autorId são obrigatórios' });
      return;
    }
    if (!(TIPOS_VALIDOS as readonly string[]).includes(tipo)) {
      res.status(400).json({ erro: `tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}` });
      return;
    }

    const db = getDb();
    const id = randomUUID();
    const criado_em = new Date().toISOString();

    db.prepare(
      `INSERT INTO artefatos (id, titulo, tipo, conteudo, autor_id, tarefa_id, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, titulo, tipo, conteudo, autorId, tarefaId ?? null, criado_em);

    escreverAuditEvent({ tipo: 'artefato_criado', atorId: autorId, payload: { artefatoId: id, titulo, tipo } });

    res.status(201).json({ id, titulo, tipo, autorId, tarefaId: tarefaId ?? null, criado_em });
  });

  router.get('/', (req, res) => {
    const { autorId, tarefaId } = req.query as { autorId?: string; tarefaId?: string };
    const db = getDb();

    let query = 'SELECT id, titulo, tipo, autor_id, tarefa_id, criado_em FROM artefatos WHERE 1=1';
    const params: string[] = [];

    if (autorId) { query += ' AND autor_id = ?'; params.push(autorId); }
    if (tarefaId) { query += ' AND tarefa_id = ?'; params.push(tarefaId); }
    query += ' ORDER BY criado_em DESC LIMIT 100';

    res.json(db.prepare(query).all(...params));
  });

  return router;
}
