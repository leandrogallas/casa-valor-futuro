/**
 * A2A (Agent-to-Agent) endpoints — Google A2A spec via JSON-RPC 2.0.
 * Exposes Bastião agents to OpenJarvis / Hermes and any A2A-compatible orchestrator.
 *
 * Endpoints:
 *   GET  /.well-known/agent.json          — office-level AgentCard
 *   POST /a2a/tasks                        — task to any agent (agenteId in params)
 *   GET  /agentes/:id/a2a/agent.json       — per-agent AgentCard
 *   POST /agentes/:id/a2a/tasks            — task direct to specific agent
 */

import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface AgenteRow {
  id: string;
  nome: string;
  cargo: string;
  modelo: string;
  prompt_sistema: string;
  departamento: string;
  ativo: number;
}

interface A2ATaskResult {
  id: string;
  state: string;
  input: string;
  output: string;
  history: Array<{ role: string; content: string }>;
  metadata: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rpcOk(id: string, result: unknown) {
  return { jsonrpc: '2.0', id, result };
}

function rpcErr(id: string, code: number, message: string) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function agentCard(agente: AgenteRow, baseUrl: string) {
  return {
    name: `${agente.nome} — Bastião (${agente.cargo})`,
    description: agente.prompt_sistema.slice(0, 200),
    url: `${baseUrl}/agentes/${agente.id}/a2a/tasks`,
    version: '1.0.0',
    capabilities: ['tasks/send', 'tasks/get', 'tasks/cancel'],
    skills: [agente.departamento],
    authentication: {},
  };
}

function officeCard(baseUrl: string) {
  return {
    name: 'Laboratório do Bastião',
    description: 'Escritório virtual 2D com agentes IA especializados: marketing, copy, growth, pesquisa, financeiro, diretoria.',
    url: `${baseUrl}/a2a/tasks`,
    version: '1.0.0',
    capabilities: ['tasks/send', 'tasks/get', 'tasks/cancel'],
    skills: ['marketing', 'copy', 'research', 'growth', 'finance', 'executive'],
    authentication: {},
  };
}

// ── Task executor ─────────────────────────────────────────────────────────────

async function executarTarefa(agente: AgenteRow, inputText: string): Promise<A2ATaskResult> {
  const taskId = randomUUID().replace(/-/g, '').slice(0, 16);

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: agente.modelo ?? 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: agente.prompt_sistema,
      messages: [{ role: 'user', content: inputText }],
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Anthropic API ${resp.status}: ${txt}`);
  }

  const msg = (await resp.json()) as {
    content: Array<{ type: string; text?: string }>;
    model: string;
    usage: { input_tokens: number; output_tokens: number };
  };

  const output = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');

  const history = [
    { role: 'user', content: inputText },
    { role: 'agent', content: output },
  ];

  escreverAuditEvent({
    tipo: 'a2a_task',
    atorId: agente.id,
    payload: { taskId, inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens },
  });

  return {
    id: taskId,
    state: 'completed',
    input: inputText,
    output,
    history,
    metadata: {
      agente_id: agente.id,
      agente_nome: agente.nome,
      modelo: msg.model,
      input_tokens: msg.usage.input_tokens,
      output_tokens: msg.usage.output_tokens,
    },
  };
}

// ── In-memory task store (MVP — substitua por SQLite para persistência) ───────

const tarefasEmMemoria = new Map<string, A2ATaskResult>();

// ── Handler genérico para POST /a2a/tasks ────────────────────────────────────

async function handleTasksPost(
  req: Request,
  res: Response,
  agenteId?: string,
): Promise<void> {
  const { method, params = {}, id: reqId = '' } = req.body as {
    method: string;
    params: Record<string, unknown>;
    id: string;
  };

  const db = getDb();

  if (method === 'tasks/send') {
    // Resolve which agent handles the task
    let agente: AgenteRow | undefined;

    if (agenteId) {
      agente = db
        .prepare('SELECT * FROM agentes WHERE id = ? AND ativo = 1')
        .get(agenteId) as AgenteRow | undefined;
    } else {
      // Pick from params.agente_id or first active agent
      const paramAgenteId = (params.agente_id as string) || undefined;
      if (paramAgenteId) {
        agente = db
          .prepare('SELECT * FROM agentes WHERE id = ? AND ativo = 1')
          .get(paramAgenteId) as AgenteRow | undefined;
      } else {
        agente = db
          .prepare('SELECT * FROM agentes WHERE ativo = 1 ORDER BY criado_em LIMIT 1')
          .get() as AgenteRow | undefined;
      }
    }

    if (!agente) {
      res.json(rpcErr(reqId, -32602, 'Nenhum agente ativo disponível'));
      return;
    }

    // Extract input text — A2A spec: params.message.parts[0].text or params.input
    const message = params.message as { parts?: Array<{ text?: string }> } | undefined;
    const inputText: string =
      message?.parts?.[0]?.text ??
      (params.input as string) ??
      '';

    if (!inputText) {
      res.json(rpcErr(reqId, -32602, 'Texto de entrada vazio'));
      return;
    }

    try {
      const task = await executarTarefa(agente, inputText);
      tarefasEmMemoria.set(task.id, task);
      res.json(rpcOk(reqId, task));
    } catch (err) {
      res.json(rpcErr(reqId, -32603, `Erro ao executar tarefa: ${String(err)}`));
    }
    return;
  }

  if (method === 'tasks/get') {
    const taskId = params.id as string;
    const task = tarefasEmMemoria.get(taskId);
    if (!task) {
      res.json(rpcErr(reqId, -32602, `Task não encontrada: ${taskId}`));
      return;
    }
    res.json(rpcOk(reqId, task));
    return;
  }

  if (method === 'tasks/cancel') {
    const taskId = params.id as string;
    const task = tarefasEmMemoria.get(taskId);
    if (!task) {
      res.json(rpcErr(reqId, -32602, `Task não encontrada: ${taskId}`));
      return;
    }
    task.state = 'canceled';
    res.json(rpcOk(reqId, task));
    return;
  }

  res.json(rpcErr(reqId, -32601, `Método não encontrado: ${method}`));
}

// ── Router factory ────────────────────────────────────────────────────────────

export function criarRotasA2A(): Router {
  const router = Router();

  // ── Office-level endpoints ──────────────────────────────────────────────────

  router.get('/.well-known/agent.json', (req, res) => {
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    res.json(officeCard(baseUrl));
  });

  router.post('/a2a/tasks', (req, res) => {
    handleTasksPost(req, res).catch((err) => {
      res.status(500).json({ error: String(err) });
    });
  });

  // ── Per-agent endpoints ─────────────────────────────────────────────────────

  router.get('/agentes/:id/a2a/agent.json', (req, res) => {
    const db = getDb();
    const agente = db
      .prepare('SELECT * FROM agentes WHERE id = ? AND ativo = 1')
      .get(req.params.id) as AgenteRow | undefined;

    if (!agente) {
      res.status(404).json({ error: 'Agente não encontrado' });
      return;
    }
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    res.json(agentCard(agente, baseUrl));
  });

  router.post('/agentes/:id/a2a/tasks', (req, res) => {
    handleTasksPost(req, res, req.params.id).catch((err) => {
      res.status(500).json({ error: String(err) });
    });
  });

  return router;
}
