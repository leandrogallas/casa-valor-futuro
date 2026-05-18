import { Router } from 'express';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/database.js';
import { escreverAuditEvent } from '../db/auditLog.js';

export function criarRotasAuth(jwtSecret: string): Router {
  const router = Router();
  const secretKey = new TextEncoder().encode(jwtSecret);

  router.post('/', async (req, res) => {
    const { email, nome } = req.body as { email?: string; nome?: string };

    if (!email || !nome) {
      res.status(400).json({ erro: 'email e nome são obrigatórios' });
      return;
    }

    const db = getDb();

    let usuario = db
      .prepare('SELECT id, nome, email, papel FROM usuarios WHERE email = ?')
      .get(email) as { id: string; nome: string; email: string; papel: string } | undefined;

    if (!usuario) {
      const id = randomUUID();
      db.prepare(
        'INSERT INTO usuarios (id, nome, email, papel, criado_em) VALUES (?, ?, ?, ?, ?)',
      ).run(id, nome, email, 'colaborador', new Date().toISOString());
      usuario = { id, nome, email, papel: 'colaborador' };
      escreverAuditEvent({ tipo: 'usuario_criado', atorId: id, payload: { email, nome } });
    }

    const token = await new SignJWT({ nome: usuario.nome, papel: usuario.papel })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(usuario.id)
      .setExpirationTime('24h')
      .sign(secretKey);

    res.json({ token, usuario });
  });

  router.get('/usuarios', (_req, res) => {
    const db = getDb();
    const lista = db.prepare('SELECT id, nome, email FROM usuarios ORDER BY nome').all();
    res.json(lista);
  });

  return router;
}
