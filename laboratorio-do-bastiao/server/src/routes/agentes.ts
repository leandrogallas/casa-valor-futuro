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
  departamento?: string;
  skinAvatar?: string;
  deskX?: number;
  deskY?: number;
}

interface AtualizarAgenteBody {
  nome?: string;
  cargo?: string;
  modelo?: string;
  promptSistema?: string;
  ferramentas?: string[];
  departamento?: string;
  skinAvatar?: string;
  deskX?: number;
  deskY?: number;
  ativo?: boolean;
  estado?: string;
}

interface RotinaPatch {
  horaInicio?: string;
  horaFim?: string;
  almocoInicio?: string;
  almocoFim?: string;
  diasSemana?: string;
  ativa?: boolean;
}

export function criarRotasAgentes(): Router {
  const router = Router();

  router.post('/', (req, res) => {
    const body = req.body as CriarAgenteBody;
    const {
      nome, cargo, donoId, modelo,
      promptSistema = '', ferramentas = [],
      departamento = 'geral', skinAvatar = 'agent-default',
      deskX = 640, deskY = 400,
    } = body;

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
    const agora = new Date().toISOString();
    db.prepare(
      `INSERT INTO agentes
         (id, nome, cargo, dono_id, modelo, prompt_sistema, ferramentas_json, estado,
          departamento, skin_avatar, desk_x, desk_y, ativo, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', ?, ?, ?, ?, 1, ?)`,
    ).run(id, nome, cargo, donoId, modelo, promptSistema,
      JSON.stringify(ferramentas), departamento, skinAvatar, deskX, deskY, agora);

    // Rotina padrão para o novo agente
    db.prepare(
      `INSERT OR IGNORE INTO rotinas (agente_id, hora_inicio, hora_fim, almoco_inicio, almoco_fim, dias_semana, ativa, atualizado_em)
       VALUES (?, '09:00', '18:00', '12:00', '13:00', '1,2,3,4,5', 1, ?)`,
    ).run(id, agora);

    escreverAuditEvent({ tipo: 'agente_criado', atorId: donoId, payload: { agenteId: id, nome, cargo } });

    res.status(201).json({ id, nome, cargo, donoId, modelo, estado: 'ativo', departamento, skinAvatar });
  });

  router.patch('/:id', (req, res) => {
    const body = req.body as AtualizarAgenteBody;
    const db = getDb();

    const existente = db.prepare('SELECT id FROM agentes WHERE id = ?').get(req.params.id);
    if (!existente) { res.status(404).json({ erro: 'agente não encontrado' }); return; }

    const campos: string[] = [];
    const valores: unknown[] = [];

    if (body.nome !== undefined)        { campos.push('nome = ?');           valores.push(body.nome); }
    if (body.cargo !== undefined)       { campos.push('cargo = ?');          valores.push(body.cargo); }
    if (body.modelo !== undefined)      { campos.push('modelo = ?');         valores.push(body.modelo); }
    if (body.promptSistema !== undefined){ campos.push('prompt_sistema = ?'); valores.push(body.promptSistema); }
    if (body.ferramentas !== undefined) { campos.push('ferramentas_json = ?'); valores.push(JSON.stringify(body.ferramentas)); }
    if (body.departamento !== undefined){ campos.push('departamento = ?');   valores.push(body.departamento); }
    if (body.skinAvatar !== undefined)  { campos.push('skin_avatar = ?');    valores.push(body.skinAvatar); }
    if (body.deskX !== undefined)       { campos.push('desk_x = ?');         valores.push(body.deskX); }
    if (body.deskY !== undefined)       { campos.push('desk_y = ?');         valores.push(body.deskY); }
    if (body.ativo !== undefined)       { campos.push('ativo = ?');          valores.push(body.ativo ? 1 : 0); }
    if (body.estado !== undefined)      { campos.push('estado = ?');         valores.push(body.estado); }

    if (campos.length === 0) { res.status(400).json({ erro: 'nenhum campo para atualizar' }); return; }

    valores.push(req.params.id);
    db.prepare(`UPDATE agentes SET ${campos.join(', ')} WHERE id = ?`).run(...valores);

    escreverAuditEvent({ tipo: 'agente_atualizado', atorId: 'system', payload: { agenteId: req.params.id, campos } });

    const atualizado = db.prepare('SELECT * FROM agentes WHERE id = ?').get(req.params.id);
    res.json(atualizado);
  });

  router.delete('/:id', (req, res) => {
    const db = getDb();
    const existente = db.prepare('SELECT id FROM agentes WHERE id = ?').get(req.params.id);
    if (!existente) { res.status(404).json({ erro: 'agente não encontrado' }); return; }

    db.prepare('DELETE FROM agentes WHERE id = ?').run(req.params.id);
    escreverAuditEvent({ tipo: 'agente_removido', atorId: 'system', payload: { agenteId: req.params.id } });
    res.json({ ok: true });
  });

  router.get('/:id/rotina', (req, res) => {
    const db = getDb();
    const rotina = db.prepare('SELECT * FROM rotinas WHERE agente_id = ?').get(req.params.id);
    if (!rotina) { res.status(404).json({ erro: 'rotina não encontrada' }); return; }
    res.json(rotina);
  });

  router.patch('/:id/rotina', (req, res) => {
    const body = req.body as RotinaPatch;
    const db = getDb();
    const agora = new Date().toISOString();

    db.prepare(
      `INSERT INTO rotinas (agente_id, hora_inicio, hora_fim, almoco_inicio, almoco_fim, dias_semana, ativa, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(agente_id) DO UPDATE SET
         hora_inicio   = excluded.hora_inicio,
         hora_fim      = excluded.hora_fim,
         almoco_inicio = excluded.almoco_inicio,
         almoco_fim    = excluded.almoco_fim,
         dias_semana   = excluded.dias_semana,
         ativa         = excluded.ativa,
         atualizado_em = excluded.atualizado_em`,
    ).run(
      req.params.id,
      body.horaInicio ?? '09:00',
      body.horaFim ?? '18:00',
      body.almocoInicio ?? '12:00',
      body.almocoFim ?? '13:00',
      body.diasSemana ?? '1,2,3,4,5',
      body.ativa !== false ? 1 : 0,
      agora,
    );

    res.json(db.prepare('SELECT * FROM rotinas WHERE agente_id = ?').get(req.params.id));
  });

  router.get('/:id', (req, res) => {
    const db = getDb();
    const agente = db.prepare('SELECT * FROM agentes WHERE id = ?').get(req.params.id);
    if (!agente) { res.status(404).json({ erro: 'agente não encontrado' }); return; }
    res.json(agente);
  });

  router.get('/', (req, res) => {
    const db = getDb();
    const { ativo } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM agentes';
    const params: unknown[] = [];
    if (ativo !== undefined) { sql += ' WHERE ativo = ?'; params.push(ativo === '1' || ativo === 'true' ? 1 : 0); }
    sql += ' ORDER BY criado_em DESC';
    res.json(db.prepare(sql).all(...params));
  });

  return router;
}
