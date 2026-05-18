import { test, expect } from '@playwright/test';

interface UsuarioAuth {
  id: string;
  nome: string;
  email: string;
  papel: string;
}

interface Agente {
  id: string;
  nome: string;
  estado: string;
}

interface Tarefa {
  id: string;
  titulo: string;
  status: string;
}

interface Artefato {
  id: string;
  titulo: string;
  tipo: string;
}

test('happy path: login → criar agente → criar tarefa → concluir → criar artefato', async ({ request }) => {
  // 1. Registrar / login
  const authRes = await request.post('/auth', {
    data: { nome: 'Leandro Tester', email: 'tester@e2e.bastiao.dev' },
  });
  expect(authRes.status()).toBe(200);
  const { token, usuario } = (await authRes.json()) as { token: string; usuario: UsuarioAuth };
  expect(token).toBeTruthy();
  expect(usuario.id).toBeTruthy();

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Criar agente
  const agenteRes = await request.post('/agentes', {
    headers,
    data: {
      nome: 'Bastião E2E',
      cargo: 'analista',
      donoId: usuario.id,
      modelo: 'claude-haiku-4-5-20251001',
      promptSistema: 'Você é um agente de teste automatizado.',
    },
  });
  expect(agenteRes.status()).toBe(201);
  const agente = (await agenteRes.json()) as Agente;
  expect(agente.id).toBeTruthy();
  expect(agente.estado).toBe('provisionando');

  // 3. Criar tarefa atribuída ao agente
  const tarefaRes = await request.post('/tarefas', {
    headers,
    data: {
      titulo: 'Validar integração E2E',
      descricao: 'Testar fluxo completo ponta a ponta',
      responsavelId: agente.id,
      autorId: usuario.id,
      prioridade: 'alta',
    },
  });
  expect(tarefaRes.status()).toBe(201);
  const tarefa = (await tarefaRes.json()) as Tarefa;
  expect(tarefa.status).toBe('aberta');

  // 4. Listar tarefas — verifica presença
  const listRes = await request.get('/tarefas', { headers });
  expect(listRes.status()).toBe(200);
  const tarefas = (await listRes.json()) as Tarefa[];
  expect(tarefas.some((t) => t.id === tarefa.id)).toBe(true);

  // 5. Agente inicia trabalho
  const iniciarRes = await request.patch(`/tarefas/${tarefa.id}/status`, {
    headers,
    data: { status: 'em_andamento' },
  });
  expect(iniciarRes.status()).toBe(200);
  expect(((await iniciarRes.json()) as Tarefa).status).toBe('em_andamento');

  // 6. Agente cria artefato (resultado)
  const artefatoRes = await request.post('/artefatos', {
    headers,
    data: {
      titulo: 'Relatório de Validação E2E',
      tipo: 'documento',
      conteudo: 'Todos os testes passaram. Integração validada com sucesso.',
      autorId: agente.id,
      tarefaId: tarefa.id,
    },
  });
  expect(artefatoRes.status()).toBe(201);
  const artefato = (await artefatoRes.json()) as Artefato;
  expect(artefato.tipo).toBe('documento');

  // 7. Concluir tarefa
  const concluirRes = await request.patch(`/tarefas/${tarefa.id}/status`, {
    headers,
    data: { status: 'concluida' },
  });
  expect(concluirRes.status()).toBe(200);
  expect(((await concluirRes.json()) as Tarefa).status).toBe('concluida');

  // 8. Listar artefatos do agente
  const artefatosRes = await request.get(`/artefatos?autorId=${agente.id}`, { headers });
  expect(artefatosRes.status()).toBe(200);
  const artefatos = (await artefatosRes.json()) as Artefato[];
  expect(artefatos.some((a) => a.id === artefato.id)).toBe(true);
});

test('auth: mesmo email retorna mesmo usuário', async ({ request }) => {
  const dados = { nome: 'Usuário Repetido', email: 'repetido@e2e.bastiao.dev' };
  const r1 = await request.post('/auth', { data: dados });
  const r2 = await request.post('/auth', { data: dados });
  expect(r1.status()).toBe(200);
  expect(r2.status()).toBe(200);
  const { usuario: u1 } = (await r1.json()) as { token: string; usuario: UsuarioAuth };
  const { usuario: u2 } = (await r2.json()) as { token: string; usuario: UsuarioAuth };
  expect(u1.id).toBe(u2.id);
});

test('tarefas: retorna 400 sem campos obrigatórios', async ({ request }) => {
  const authRes = await request.post('/auth', { data: { nome: 'Tester 400', email: '400@e2e.bastiao.dev' } });
  const { token } = (await authRes.json()) as { token: string };
  const res = await request.post('/tarefas', {
    headers: { Authorization: `Bearer ${token}` },
    data: { titulo: 'Sem responsável' },
  });
  expect(res.status()).toBe(400);
});
