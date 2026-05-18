// Guard: require auth
const token = sessionStorage.getItem('bastiao_token');
if (!token) {
  window.location.replace('/');
  throw new Error('unauthenticated');
}

const usuario = JSON.parse(sessionStorage.getItem('bastiao_usuario') ?? '{}') as {
  id?: string;
  nome?: string;
  email?: string;
};

// ── User display ────────────────────────────────────────────────────────
const nomeEl    = document.getElementById('user-nome')     as HTMLElement;
const iniciaisEl = document.getElementById('user-initials') as HTMLElement;

if (usuario.nome) {
  nomeEl.textContent = usuario.nome;
  iniciaisEl.textContent = usuario.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

// ── Logout ─────────────────────────────────────────────────────────────
document.getElementById('btn-logout')!.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.replace('/');
});

// ── Status checks ─────────────────────────────────────────────────────

function setLed(id: string, detailId: string, ok: boolean, detail: string): void {
  const led = document.getElementById(id) as HTMLElement;
  const det = document.getElementById(detailId) as HTMLElement;
  led.className = `status-led ${ok ? 'led-ok' : 'led-err'}`;
  det.textContent = detail;
}

async function checkServer(): Promise<void> {
  try {
    const r = await fetch('/health', { signal: AbortSignal.timeout(5000) });
    const j = await r.json() as { ok?: boolean };
    setLed('led-server', 'detail-server', !!j.ok, j.ok ? 'Online' : 'Degradado');
  } catch {
    setLed('led-server', 'detail-server', false, 'Inacessível');
  }
}

async function checkA2A(): Promise<void> {
  try {
    const r = await fetch('/.well-known/agent.json', { signal: AbortSignal.timeout(5000) });
    const ok = r.ok;
    setLed('led-a2a', 'detail-a2a', ok, ok ? 'Endpoint ativo' : `HTTP ${r.status}`);
  } catch {
    setLed('led-a2a', 'detail-a2a', false, 'Inacessível');
  }
}

async function checkDb(): Promise<void> {
  try {
    const r = await fetch('/health', { signal: AbortSignal.timeout(5000) });
    const j = await r.json() as { db?: string };
    const ok = j.db === 'ok' || !('db' in j);
    setLed('led-db', 'detail-db', ok, ok ? 'SQLite OK' : 'Erro no banco');
  } catch {
    setLed('led-db', 'detail-db', false, 'Inacessível');
  }
}

async function checkAnthropic(): Promise<void> {
  try {
    // A2A ping to the first agent — if Anthropic key is valid the response has no auth error
    const r = await fetch('/agentes', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) {
      setLed('led-anthropic', 'detail-anthropic', false, 'Token inválido');
      return;
    }
    const lista = await r.json() as Array<{ id: string }>;
    if (lista.length === 0) {
      setLed('led-anthropic', 'detail-anthropic', true, 'Chave configurada');
      return;
    }
    // Quick dry-run task to verify key
    const agenteId = lista[0]?.id;
    const resp = await fetch(`/agentes/${agenteId}/a2a/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tasks/send',
        params: { message: { role: 'user', parts: [{ text: 'ping' }] } },
        id: 'portal-check',
      }),
      signal: AbortSignal.timeout(15000),
    });
    const j = await resp.json() as { result?: unknown; error?: { message: string } };
    if (j.error?.message?.includes('401') || j.error?.message?.includes('authentication')) {
      setLed('led-anthropic', 'detail-anthropic', false, 'Chave inválida');
    } else if (j.error) {
      setLed('led-anthropic', 'detail-anthropic', false, j.error.message.slice(0, 40));
    } else {
      setLed('led-anthropic', 'detail-anthropic', true, 'Conectado');
    }
  } catch {
    setLed('led-anthropic', 'detail-anthropic', false, 'Timeout');
  }
}

// Run all checks in parallel
void Promise.all([checkServer(), checkA2A(), checkDb(), checkAnthropic()]);

// ── Card navigation — Relatórios and Conexões open admin panel tabs ─────
document.getElementById('btn-relatorios')?.addEventListener('click', () => {
  window.location.href = '/admin.html#relatorios';
});

document.getElementById('btn-conexoes')?.addEventListener('click', () => {
  window.location.href = '/admin.html#conexoes';
});
