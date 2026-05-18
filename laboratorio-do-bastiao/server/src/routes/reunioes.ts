import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

interface CriarReuniaoBody {
  titulo?: string;
  descricao?: string;
  salaId?: string;
  inicioEm?: string;
  organizadorId?: string;
  participantes?: { id: string; tipo: string }[];
}

export function criarRotasReunioes(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const body = req.body as CriarReuniaoBody;
    const { titulo, descricao = '', salaId = 'meeting1', inicioEm, organizadorId, participantes = [] } = body;

    if (!titulo || !inicioEm || !organizadorId) {
      res.status(400).json({ erro: 'titulo, inicioEm e organizadorId são obrigatórios' });
      return;
    }

    const db = getDb();
    const id = randomUUID();
    const agora = new Date().toISOString();

    db.prepare(
      `INSERT INTO reunioes (id, titulo, descricao, sala_id, inicio_em, organizador_id, status, ata, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, 'agendada', '', ?)`,
    ).run(id, titulo, descricao, salaId, inicioEm, organizadorId, agora);

    const insParticipante = db.prepare(
      `INSERT OR IGNORE INTO participantes_reuniao (reuniao_id, participante_id, tipo, confirmado) VALUES (?, ?, ?, 1)`,
    );
    insParticipante.run(id, organizadorId, 'agente');
    for (const p of participantes) {
      insParticipante.run(id, p.id, p.tipo ?? 'agente');
    }

    escreverAuditEvent({ tipo: 'reuniao_agendada', atorId: organizadorId, payload: { reuniaoId: id, titulo, salaId } });

    res.status(201).json({ id, titulo, salaId, inicioEm, organizadorId, status: 'agendada' });
  });

  router.get('/', (req, res) => {
    const db = getDb();
    const { status, organizadorId } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM reunioes WHERE 1=1';
    const params: unknown[] = [];
    if (status)       { sql += ' AND status = ?';       params.push(status); }
    if (organizadorId){ sql += ' AND organizador_id = ?'; params.push(organizadorId); }
    sql += ' ORDER BY inicio_em DESC LIMIT 100';
    const reunioes = db.prepare(sql).all(...params);

    const resultado = reunioes.map((r) => {
      const row = r as Record<string, unknown>;
      const participantes = db
        .prepare('SELECT * FROM participantes_reuniao WHERE reuniao_id = ?')
        .all(row['id']);
      return { ...row, participantes };
    });
    res.json(resultado);
  });

  router.get('/:id', (req, res) => {
    const db = getDb();
    const reuniao = db.prepare('SELECT * FROM reunioes WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!reuniao) { res.status(404).json({ erro: 'reunião não encontrada' }); return; }
    const participantes = db.prepare('SELECT * FROM participantes_reuniao WHERE reuniao_id = ?').all(req.params.id);
    res.json({ ...reuniao, participantes });
  });

  router.patch('/:id/status', (req, res) => {
    const { status, ata } = req.body as { status?: string; ata?: string };
    const validos = ['agendada', 'em_andamento', 'concluida', 'cancelada'];
    if (!status || !validos.includes(status)) {
      res.status(400).json({ erro: `status deve ser: ${validos.join(', ')}` });
      return;
    }

    const db = getDb();
    const reuniao = db.prepare('SELECT id FROM reunioes WHERE id = ?').get(req.params.id);
    if (!reuniao) { res.status(404).json({ erro: 'reunião não encontrada' }); return; }

    const fimEm = status === 'concluida' || status === 'cancelada' ? new Date().toISOString() : null;
    db.prepare('UPDATE reunioes SET status = ?, fim_em = ?, ata = COALESCE(?, ata) WHERE id = ?')
      .run(status, fimEm, ata ?? null, req.params.id);

    escreverAuditEvent({ tipo: 'reuniao_status_alterado', atorId: 'system', payload: { reuniaoId: req.params.id, status } });
    res.json(db.prepare('SELECT * FROM reunioes WHERE id = ?').get(req.params.id));
  });

  router.post('/:id/participantes', (req, res) => {
    const { participanteId, tipo = 'agente' } = req.body as { participanteId?: string; tipo?: string };
    if (!participanteId) { res.status(400).json({ erro: 'participanteId obrigatório' }); return; }

    const db = getDb();
    const reuniao = db.prepare('SELECT id FROM reunioes WHERE id = ?').get(req.params.id);
    if (!reuniao) { res.status(404).json({ erro: 'reunião não encontrada' }); return; }

    db.prepare(
      'INSERT OR IGNORE INTO participantes_reuniao (reuniao_id, participante_id, tipo, confirmado) VALUES (?, ?, ?, 1)',
    ).run(req.params.id, participanteId, tipo);

    res.status(201).json({ ok: true });
  });

  router.patch('/:id/ata', (req, res) => {
    const { ata } = req.body as { ata?: string };
    if (!ata) { res.status(400).json({ erro: 'ata obrigatória' }); return; }

    const db = getDb();
    db.prepare('UPDATE reunioes SET ata = ? WHERE id = ?').run(ata, req.params.id);
    res.json({ ok: true });
  });

  return router;
}
