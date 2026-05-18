import { agentes, usuarios, type Agente, type Rotina } from '../api.js';
import { $main, showModal, showWizard, hideModal, showFeedback } from '../dom.js';

// ── Constants ─────────────────────────────────────────────────────────────

const SKINS = [
  { id: 'agent-pink',     cor: '#D85A30', emoji: '🎨', label: 'Marketing',  depto: 'marketing'  },
  { id: 'agent-orange',   cor: '#BA7517', emoji: '✍️', label: 'Copy',       depto: 'copy'        },
  { id: 'agent-green',    cor: '#639922', emoji: '🔬', label: 'Pesquisa',   depto: 'research'    },
  { id: 'agent-blue',     cor: '#378ADD', emoji: '📈', label: 'Growth',     depto: 'growth'      },
  { id: 'agent-gold',     cor: '#B8860B', emoji: '💰', label: 'Financeiro', depto: 'finance'     },
  { id: 'agent-burgundy', cor: '#7B4A4A', emoji: '🎯', label: 'Diretoria',  depto: 'executive'   },
  { id: 'agent-default',  cor: '#00D4FF', emoji: '🤖', label: 'Geral',      depto: 'geral'       },
];

const MODELOS = [
  { id: 'claude-sonnet-4-6',        label: 'Sonnet 4.6',   descricao: 'Rápido e inteligente. Ideal para a maioria dos agentes.',      speed: 5, intel: 4 },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5',   descricao: 'Ultra-rápido, baixo custo. Para respostas simples e rápidas.', speed: 5, intel: 3 },
  { id: 'claude-opus-4-7',          label: 'Opus 4.7',     descricao: 'Máxima inteligência. Para tarefas complexas e analíticas.',    speed: 3, intel: 5 },
  { id: 'claude-sonnet-4-5',        label: 'Sonnet 4.5',   descricao: 'Versão anterior estável. Boa para fluxos já testados.',        speed: 4, intel: 4 },
];

const DEPARTAMENTOS = [
  'marketing', 'copy', 'research', 'growth', 'finance',
  'executive', 'reception', 'kitchen', 'lounge', 'geral',
];

const TONS = [
  { id: 'estrategico',  label: 'Estratégico',  desc: 'Visão de longo prazo, conecta ações à estratégia' },
  { id: 'direto',       label: 'Direto',        desc: 'Vai ao ponto, sem rodeios, objetivo' },
  { id: 'didatico',     label: 'Didático',      desc: 'Explica passo a passo, educa enquanto responde' },
  { id: 'analitico',    label: 'Analítico',     desc: 'Dados antes de opinião, raciocínio estruturado' },
  { id: 'socratico',    label: 'Socrático',     desc: 'Faz perguntas para conduzir à resposta certa' },
  { id: 'criativo',     label: 'Criativo',      desc: 'Inovador, gera ideias fora do óbvio' },
  { id: 'persuasivo',   label: 'Persuasivo',    desc: 'Argumenta com clareza para convencer' },
  { id: 'cauteloso',    label: 'Cauteloso',     desc: 'Pesa riscos, prefere confirmar antes de agir' },
];

const ESTILOS = [
  { id: 'conciso',   label: '⚡ Conciso',    desc: 'Respostas curtas e densas' },
  { id: 'detalhado', label: '📋 Detalhado',  desc: 'Completo, cobre todos os ângulos' },
  { id: 'listado',   label: '📝 Em listas',  desc: 'Usa bullets e estrutura visual' },
  { id: 'narrativo', label: '📖 Narrativo',  desc: 'Prosa fluida, conta histórias' },
];

const SKILLS_SUGERIDAS = [
  'copywriting', 'SEO', 'e-mail marketing', 'redes sociais', 'branding',
  'análise de dados', 'funil de vendas', 'pesquisa qualitativa', 'OKRs',
  'planejamento financeiro', 'licitações', 'B2B', 'UX writing',
  'apresentações', 'gestão de projetos', 'contratos', 'prospecção',
];

// ── Wizard state ──────────────────────────────────────────────────────────

interface WizardData {
  // Step 1 — Identidade
  nome: string;
  cargo: string;
  departamento: string;
  donoId: string;
  // Step 2 — Avatar
  skinId: string;
  // Step 3 — Tom
  tons: string[];
  estilo: string;
  formalidade: number;  // 1-5 (1=casual, 5=formal)
  verbosidade: number;  // 1-5 (1=conciso, 5=detalhado)
  // Step 4 — Conhecimento
  promptCustom: string;
  skills: string[];
  // Step 5 — Modelo
  modelo: string;
}

const wz: WizardData = {
  nome: '', cargo: '', departamento: 'geral', donoId: '',
  skinId: 'agent-default',
  tons: [], estilo: 'conciso', formalidade: 3, verbosidade: 3,
  promptCustom: '', skills: [],
  modelo: 'claude-sonnet-4-6',
};

// ── Helpers ───────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function skinCor(skinId: string): string {
  return SKINS.find((s) => s.id === skinId)?.cor ?? '#888';
}

function estadoBadge(estado: string, ativo: number): string {
  if (!ativo) return '<span class="badge badge-gray">Inativo</span>';
  const map: Record<string, string> = {
    ativo: 'badge-green', provisionando: 'badge-yellow', offline: 'badge-gray', erro: 'badge-red',
  };
  return `<span class="badge ${map[estado] ?? 'badge-gray'}">${estado}</span>`;
}

function buildPrompt(data: WizardData): string {
  const skin  = SKINS.find((s) => s.id === data.skinId);
  const tonStr = data.tons.map((t) => TONS.find((x) => x.id === t)?.label ?? t).join(', ');
  const estiloStr = ESTILOS.find((e) => e.id === data.estilo)?.label ?? data.estilo;
  const fStr = data.formalidade <= 2 ? 'informal e próximo' : data.formalidade >= 4 ? 'formal e profissional' : 'equilibrado';
  const vStr = data.verbosidade <= 2 ? 'respostas curtas e diretas' : data.verbosidade >= 4 ? 'respostas completas e detalhadas' : 'respostas moderadas';
  const skillStr = data.skills.length ? `\n\nEspecialidades: ${data.skills.join(', ')}.` : '';

  let base = `Você é ${data.nome || 'um agente'}, ${data.cargo || 'assistente'} do Laboratório do Bastião.`;
  if (skin && skin.depto !== 'geral') base += ` Área: ${skin.label}.`;
  if (tonStr) base += `\n\nTom: ${tonStr}. Estilo: ${estiloStr}.`;
  base += ` Use linguagem ${fStr} com ${vStr}.`;
  base += skillStr;
  if (data.promptCustom.trim()) base += `\n\n${data.promptCustom.trim()}`;

  return base;
}

// ── Render table ──────────────────────────────────────────────────────────

export async function renderAgentes(): Promise<void> {
  $main().innerHTML = '<div class="loading">Carregando agentes...</div>';

  let lista: Agente[] = [];
  try { lista = await agentes.listar(); }
  catch (e) { $main().innerHTML = `<div class="msg msg-err">Erro: ${String(e)}</div>`; return; }

  const ativos = lista.filter((a) => a.ativo).length;

  $main().innerHTML = `
    <div id="page-title">🤖 Agentes <span class="badge">${ativos} ativos</span></div>
    <div class="stats">
      <div class="stat-card"><div class="stat-val">${lista.length}</div><div class="stat-lbl">Total de agentes</div></div>
      <div class="stat-card"><div class="stat-val">${ativos}</div><div class="stat-lbl">Ativos</div></div>
      <div class="stat-card"><div class="stat-val">${lista.length - ativos}</div><div class="stat-lbl">Inativos</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Todos os agentes</span>
        <button class="btn btn-primary btn-sm" id="btn-novo-agente">+ Novo Agente</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Avatar</th><th>Nome</th><th>Cargo</th><th>Departamento</th>
            <th>Modelo</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map((a) => `
            <tr>
              <td><span class="skin-dot" style="background:${skinCor(a.skin_avatar)}"></span></td>
              <td><strong>${esc(a.nome)}</strong></td>
              <td>${esc(a.cargo)}</td>
              <td>${esc(a.departamento ?? '—')}</td>
              <td><code style="font-size:11px;color:#aaa">${esc(a.modelo)}</code></td>
              <td>${estadoBadge(a.estado, a.ativo)}</td>
              <td>
                <button class="btn btn-ghost btn-sm" data-edit="${a.id}">✏️ Editar</button>
                <button class="btn btn-ghost btn-sm" data-rotina="${a.id}">🕐 Rotina</button>
                <button class="btn btn-danger btn-sm" data-del="${a.id}" data-nome="${esc(a.nome)}">🗑</button>
              </td>
            </tr>
          `).join('')}
          ${lista.length === 0 ? '<tr><td colspan="7" style="color:#555;text-align:center;padding:24px">Nenhum agente cadastrado</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-novo-agente')!.addEventListener('click', () => void abrirWizardNovoAgente());

  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((btn) => {
    const id = btn.dataset.edit!;
    btn.addEventListener('click', () => void abrirFormEditar(lista.find((a) => a.id === id) ?? null));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-rotina]').forEach((btn) => {
    const id = btn.dataset.rotina!;
    btn.addEventListener('click', () => void abrirFormRotina(lista.find((a) => a.id === id)!));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((btn) => {
    const id = btn.dataset.del!;
    btn.addEventListener('click', () => void confirmarDelete(id, btn.dataset.nome!));
  });
}

// ── Wizard — Novo Agente ──────────────────────────────────────────────────

async function abrirWizardNovoAgente(): Promise<void> {
  // Reset state
  Object.assign(wz, {
    nome: '', cargo: '', departamento: 'geral', donoId: '',
    skinId: 'agent-default',
    tons: [], estilo: 'conciso', formalidade: 3, verbosidade: 3,
    promptCustom: '', skills: [],
    modelo: 'claude-sonnet-4-6',
  });

  let usuariosList: { id: string; nome: string }[] = [];
  try { usuariosList = await usuarios.listar(); } catch { /* ok */ }
  if (usuariosList.length > 0) wz.donoId = usuariosList[0].id;

  // ── Step 1: Identidade ────────────────────────────────────────────────
  function step1Render(): string {
    const deptoOpts = DEPARTAMENTOS.map((d) =>
      `<option value="${d}" ${wz.departamento === d ? 'selected' : ''}>${d}</option>`,
    ).join('');
    const donoOpts = usuariosList.map((u) =>
      `<option value="${u.id}" ${wz.donoId === u.id ? 'selected' : ''}>${esc(u.nome)}</option>`,
    ).join('') || '<option value="">— nenhum usuário cadastrado —</option>';

    return `
      <style>
        .wz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .wz-field { display: flex; flex-direction: column; gap: 6px; }
        .wz-field label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .wz-field input, .wz-field select, .wz-field textarea {
          padding: 9px 11px; border-radius: 7px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text); font-size: 13px; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s; width: 100%;
        }
        .wz-field input:focus, .wz-field select:focus, .wz-field textarea:focus {
          border-color: var(--accent); box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }
        .wz-field input::placeholder { color: var(--muted); }
        .wz-full { grid-column: 1/-1; }
      </style>
      <div class="wz-grid">
        <div class="wz-field">
          <label>Nome do agente *</label>
          <input id="wz-nome" type="text" placeholder="Ex: Mari" value="${esc(wz.nome)}" />
        </div>
        <div class="wz-field">
          <label>Cargo *</label>
          <input id="wz-cargo" type="text" placeholder="Ex: Especialista de Marketing" value="${esc(wz.cargo)}" />
        </div>
        <div class="wz-field">
          <label>Departamento</label>
          <select id="wz-depto">${deptoOpts}</select>
        </div>
        <div class="wz-field">
          <label>Dono (usuário) *</label>
          <select id="wz-dono">${donoOpts}</select>
        </div>
      </div>
    `;
  }

  function step1Validate(): string | null {
    wz.nome  = (document.getElementById('wz-nome')  as HTMLInputElement).value.trim();
    wz.cargo = (document.getElementById('wz-cargo') as HTMLInputElement).value.trim();
    wz.departamento = (document.getElementById('wz-depto') as HTMLSelectElement).value;
    wz.donoId = (document.getElementById('wz-dono') as HTMLSelectElement)?.value ?? '';
    if (!wz.nome)  return 'Informe o nome do agente.';
    if (!wz.cargo) return 'Informe o cargo do agente.';
    if (!wz.donoId) return 'Selecione um usuário dono.';
    return null;
  }

  // ── Step 2: Avatar ────────────────────────────────────────────────────
  function step2Render(): string {
    const cards = SKINS.map((s) => `
      <div class="avatar-card ${wz.skinId === s.id ? 'selected' : ''}" data-skin="${s.id}" style="--skin-cor: ${s.cor}">
        <div class="avatar-dot">${s.emoji}</div>
        <div class="avatar-name">${s.label}</div>
        <div class="avatar-depto">${s.depto}</div>
      </div>
    `).join('');

    return `
      <style>
        .avatar-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .avatar-card {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border-radius: 10px; cursor: pointer;
          border: 2px solid var(--border); background: var(--surface);
          transition: all 0.15s; text-align: center;
        }
        .avatar-card:hover { border-color: var(--skin-cor, var(--accent)); background: var(--surface2); }
        .avatar-card.selected {
          border-color: var(--skin-cor, var(--accent));
          background: color-mix(in srgb, var(--skin-cor, var(--accent)) 10%, transparent);
          box-shadow: 0 0 0 1px var(--skin-cor, var(--accent));
        }
        .avatar-dot {
          width: 44px; height: 44px; border-radius: 50%;
          background: color-mix(in srgb, var(--skin-cor, #888) 20%, transparent);
          border: 2px solid var(--skin-cor, #888);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          position: relative;
        }
        .avatar-dot::after {
          content: ''; position: absolute; inset: -4px; border-radius: 50%;
          border: 1.5px solid rgba(0,212,255,0.5);
        }
        .avatar-name  { font-size: 12px; font-weight: 600; color: var(--text); }
        .avatar-depto { font-size: 10px; color: var(--muted); }
      </style>
      <div class="avatar-grid" id="avatar-grid">${cards}</div>
    `;
  }

  function step2Wire(): void {
    document.getElementById('avatar-grid')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-skin]');
      if (!card) return;
      wz.skinId = card.dataset.skin!;
      document.querySelectorAll('.avatar-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      // Auto-sync departamento from skin
      const skin = SKINS.find((s) => s.id === wz.skinId);
      if (skin && skin.depto !== 'geral') wz.departamento = skin.depto;
    });
  }

  // ── Step 3: Tom & Personalidade ───────────────────────────────────────
  function step3Render(): string {
    const tonCards = TONS.map((t) => `
      <div class="ton-card ${wz.tons.includes(t.id) ? 'selected' : ''}" data-ton="${t.id}">
        <strong>${t.label}</strong>
        <span>${t.desc}</span>
      </div>
    `).join('');

    const estiloCards = ESTILOS.map((e) => `
      <div class="estilo-card ${wz.estilo === e.id ? 'selected' : ''}" data-estilo="${e.id}">
        <div>${e.label}</div>
        <small>${e.desc}</small>
      </div>
    `).join('');

    return `
      <style>
        .ton-section { margin-bottom: 20px; }
        .ton-section h4 { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .ton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
        .ton-card {
          padding: 10px 12px; border-radius: 8px; cursor: pointer;
          border: 1px solid var(--border); background: var(--surface);
          display: flex; flex-direction: column; gap: 2px; transition: all 0.15s;
        }
        .ton-card strong { font-size: 12px; color: var(--text); }
        .ton-card span   { font-size: 11px; color: var(--muted); }
        .ton-card:hover  { border-color: var(--accent); background: var(--surface2); }
        .ton-card.selected { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .ton-card.selected strong { color: var(--accent); }
        .ton-hint { font-size: 10px; color: var(--muted); margin-top: 6px; }
        .estilo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; }
        .estilo-card {
          padding: 10px 8px; border-radius: 8px; cursor: pointer; text-align: center;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 12px; color: var(--text); transition: all 0.15s;
        }
        .estilo-card small { display: block; font-size: 10px; color: var(--muted); margin-top: 3px; }
        .estilo-card:hover { border-color: var(--accent); }
        .estilo-card.selected { border-color: var(--accent); background: rgba(59,130,246,0.08); color: var(--accent); }
        .slider-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
        .slider-row label { font-size: 11px; color: var(--muted); width: 80px; text-align: right; flex-shrink: 0; }
        .slider-row label:last-child { text-align: left; }
        .slider-row input[type=range] { flex: 1; accent-color: var(--accent); }
      </style>
      <div class="ton-section">
        <h4>Tom da comunicação <small style="text-transform:none;font-weight:400">(escolha 1-3)</small></h4>
        <div class="ton-grid" id="ton-grid">${tonCards}</div>
        <div class="ton-hint">Escolha os tons que melhor definem a personalidade do agente.</div>
      </div>
      <div class="ton-section">
        <h4>Estilo de resposta</h4>
        <div class="estilo-grid" id="estilo-grid">${estiloCards}</div>
      </div>
      <div class="ton-section">
        <h4>Ajuste fino</h4>
        <div class="slider-row">
          <label>Casual</label>
          <input type="range" id="wz-formalidade" min="1" max="5" value="${wz.formalidade}" />
          <label>Formal</label>
        </div>
        <div class="slider-row">
          <label>Conciso</label>
          <input type="range" id="wz-verbosidade" min="1" max="5" value="${wz.verbosidade}" />
          <label>Detalhado</label>
        </div>
      </div>
    `;
  }

  function step3Wire(): void {
    document.getElementById('ton-grid')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-ton]');
      if (!card) return;
      const id = card.dataset.ton!;
      if (wz.tons.includes(id)) {
        wz.tons = wz.tons.filter((t) => t !== id);
        card.classList.remove('selected');
      } else if (wz.tons.length < 3) {
        wz.tons.push(id);
        card.classList.add('selected');
      }
    });

    document.getElementById('estilo-grid')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-estilo]');
      if (!card) return;
      wz.estilo = card.dataset.estilo!;
      document.querySelectorAll('.estilo-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  }

  function step3Validate(): string | null {
    wz.formalidade = parseInt((document.getElementById('wz-formalidade') as HTMLInputElement).value, 10);
    wz.verbosidade = parseInt((document.getElementById('wz-verbosidade') as HTMLInputElement).value, 10);
    return null;
  }

  // ── Step 4: Conhecimento ──────────────────────────────────────────────
  function step4Render(): string {
    const sugestoes = SKILLS_SUGERIDAS.map((s) =>
      `<button class="skill-sugg ${wz.skills.includes(s) ? 'active' : ''}" data-skill="${esc(s)}">${esc(s)}</button>`,
    ).join('');

    const atual = wz.skills.map((s) =>
      `<span class="skill-chip">${esc(s)}<button class="skill-rm" data-rm="${esc(s)}">×</button></span>`,
    ).join('');

    return `
      <style>
        .wz-field2 { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .wz-field2 label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .wz-field2 textarea {
          padding: 9px 11px; border-radius: 7px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text); font-size: 13px; outline: none;
          resize: vertical; min-height: 80px; width: 100%; font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .wz-field2 textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
        .wz-field2 textarea::placeholder { color: var(--muted); }
        .skill-suggs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .skill-sugg {
          padding: 4px 10px; border-radius: 20px; font-size: 11px;
          border: 1px solid var(--border); background: var(--surface);
          color: var(--muted); cursor: pointer; transition: all 0.15s;
        }
        .skill-sugg:hover { border-color: var(--accent); color: var(--accent); }
        .skill-sugg.active { border-color: var(--accent); background: rgba(59,130,246,0.12); color: var(--accent); }
        .skill-chips { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; margin-bottom: 10px; }
        .skill-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 20px; font-size: 12px;
          background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #60a5fa;
        }
        .skill-rm {
          background: none; border: none; color: inherit; cursor: pointer;
          font-size: 14px; line-height: 1; padding: 0; opacity: 0.7;
        }
        .skill-rm:hover { opacity: 1; }
        .skill-input-row { display: flex; gap: 8px; }
        .skill-input-row input {
          flex: 1; padding: 7px 10px; border-radius: 7px; border: 1px solid var(--border);
          background: var(--surface); color: var(--text); font-size: 12px; outline: none;
        }
        .skill-input-row input:focus { border-color: var(--accent); }
        .skill-input-row button { padding: 7px 14px; border-radius: 7px; border: none; background: var(--accent); color: #fff; font-size: 12px; cursor: pointer; }
      </style>
      <div class="wz-field2">
        <label>Conhecimento adicional / instruções específicas</label>
        <textarea id="wz-prompt" placeholder="Descreva regras específicas, contexto do negócio, restrições ou comportamentos especiais...">${esc(wz.promptCustom)}</textarea>
      </div>
      <div class="wz-field2">
        <label>Skills & especialidades</label>
        <div class="skill-chips" id="skill-chips">${atual || '<span style="color:var(--muted);font-size:12px">Nenhuma skill adicionada</span>'}</div>
        <div class="skill-input-row">
          <input id="skill-input" type="text" placeholder="Adicionar skill personalizada..." />
          <button id="skill-add-btn">Adicionar</button>
        </div>
      </div>
      <div class="wz-field2">
        <label>Sugestões</label>
        <div class="skill-suggs" id="skill-suggs">${sugestoes}</div>
      </div>
    `;
  }

  function refreshChips(): void {
    const chips = document.getElementById('skill-chips');
    if (!chips) return;
    if (wz.skills.length === 0) {
      chips.innerHTML = '<span style="color:var(--muted);font-size:12px">Nenhuma skill adicionada</span>';
    } else {
      chips.innerHTML = wz.skills.map((s) =>
        `<span class="skill-chip">${esc(s)}<button class="skill-rm" data-rm="${esc(s)}">×</button></span>`,
      ).join('');
      chips.querySelectorAll<HTMLButtonElement>('[data-rm]').forEach((btn) => {
        btn.addEventListener('click', () => {
          wz.skills = wz.skills.filter((x) => x !== btn.dataset.rm);
          document.querySelector<HTMLElement>(`.skill-sugg[data-skill="${btn.dataset.rm}"]`)?.classList.remove('active');
          refreshChips();
        });
      });
    }
  }

  function step4Wire(): void {
    document.getElementById('skill-add-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('skill-input') as HTMLInputElement;
      const val = inp.value.trim();
      if (val && !wz.skills.includes(val)) { wz.skills.push(val); refreshChips(); }
      inp.value = '';
    });

    document.getElementById('skill-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('skill-add-btn')?.click(); }
    });

    document.getElementById('skill-suggs')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-skill]');
      if (!btn) return;
      const s = btn.dataset.skill!;
      if (wz.skills.includes(s)) {
        wz.skills = wz.skills.filter((x) => x !== s);
        btn.classList.remove('active');
      } else {
        wz.skills.push(s);
        btn.classList.add('active');
      }
      refreshChips();
    });

    refreshChips();
  }

  function step4Validate(): string | null {
    wz.promptCustom = (document.getElementById('wz-prompt') as HTMLTextAreaElement).value.trim();
    return null;
  }

  // ── Step 5: Modelo & Revisão ──────────────────────────────────────────
  function step5Render(): string {
    const bars = (n: number, max = 5) =>
      Array.from({ length: max }, (_, i) =>
        `<div style="width:14px;height:6px;border-radius:2px;background:${i < n ? 'var(--accent)' : 'var(--border)'}"></div>`,
      ).join('');

    const modelCards = MODELOS.map((m) => `
      <div class="modelo-card ${wz.modelo === m.id ? 'selected' : ''}" data-model="${m.id}">
        <div class="modelo-name">${m.label}</div>
        <div class="modelo-desc">${m.descricao}</div>
        <div class="modelo-bars">
          <div class="bar-row">
            <span>Velocidade</span>
            <div style="display:flex;gap:2px">${bars(m.speed)}</div>
          </div>
          <div class="bar-row">
            <span>Inteligência</span>
            <div style="display:flex;gap:2px">${bars(m.intel)}</div>
          </div>
        </div>
      </div>
    `).join('');

    const skin = SKINS.find((s) => s.id === wz.skinId);
    const tonStr = wz.tons.map((t) => TONS.find((x) => x.id === t)?.label ?? t).join(', ') || '—';
    const skillStr = wz.skills.slice(0, 5).join(', ') + (wz.skills.length > 5 ? ' ...' : '') || '—';
    const generatedPrompt = buildPrompt(wz);

    return `
      <style>
        .modelo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
        .modelo-card {
          padding: 14px; border-radius: 10px; cursor: pointer;
          border: 1px solid var(--border); background: var(--surface);
          display: flex; flex-direction: column; gap: 6px; transition: all 0.15s;
        }
        .modelo-card:hover { border-color: var(--accent); }
        .modelo-card.selected { border-color: var(--accent); background: rgba(59,130,246,0.08); }
        .modelo-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .modelo-desc { font-size: 11px; color: var(--muted); line-height: 1.4; }
        .modelo-bars { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
        .bar-row { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: var(--muted); }
        .review-box {
          background: var(--surface2); border: 1px solid var(--border); border-radius: 10px;
          padding: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;
        }
        .rv-item { display: flex; flex-direction: column; gap: 2px; }
        .rv-lbl { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; }
        .rv-val { font-size: 13px; color: var(--text); font-weight: 500; }
        .rv-avatar-dot {
          width: 18px; height: 18px; border-radius: 50%; display: inline-block;
          vertical-align: middle; margin-right: 6px;
        }
        .prompt-preview {
          background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
          padding: 12px; font-size: 11px; color: var(--muted2); line-height: 1.6;
          max-height: 80px; overflow-y: auto; white-space: pre-wrap; word-break: break-word;
        }
        .prompt-label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px; }
      </style>
      <div class="modelo-grid" id="modelo-grid">${modelCards}</div>
      <div class="review-box">
        <div class="rv-item">
          <span class="rv-lbl">Nome</span>
          <span class="rv-val">${esc(wz.nome || '—')}</span>
        </div>
        <div class="rv-item">
          <span class="rv-lbl">Cargo</span>
          <span class="rv-val">${esc(wz.cargo || '—')}</span>
        </div>
        <div class="rv-item">
          <span class="rv-lbl">Avatar</span>
          <span class="rv-val">
            <span class="rv-avatar-dot" style="background:${skin?.cor ?? '#888'}"></span>
            ${skin?.label ?? '—'}
          </span>
        </div>
        <div class="rv-item">
          <span class="rv-lbl">Departamento</span>
          <span class="rv-val">${esc(wz.departamento)}</span>
        </div>
        <div class="rv-item rv-full" style="grid-column:1/-1">
          <span class="rv-lbl">Tons</span>
          <span class="rv-val">${esc(tonStr)}</span>
        </div>
        <div class="rv-item" style="grid-column:1/-1">
          <span class="rv-lbl">Skills (${wz.skills.length})</span>
          <span class="rv-val">${esc(skillStr)}</span>
        </div>
      </div>
      <div class="prompt-label">Prompt gerado automaticamente</div>
      <div class="prompt-preview">${esc(generatedPrompt)}</div>
    `;
  }

  function step5Wire(): void {
    document.getElementById('modelo-grid')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-model]');
      if (!card) return;
      wz.modelo = card.dataset.model!;
      document.querySelectorAll('.modelo-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  }

  // ── Wire after each step renders ──────────────────────────────────────

  const steps = [
    {
      title: 'Identidade', icon: '👤',
      render: step1Render,
      validate: step1Validate,
    },
    {
      title: 'Avatar', icon: '🎨',
      render: step2Render,
      validate: () => { step2Wire(); return null; },
    },
    {
      title: 'Tom', icon: '🎭',
      render: step3Render,
      validate: () => { step3Wire(); step3Validate(); return null; },
    },
    {
      title: 'Conhecimento', icon: '🧠',
      render: step4Render,
      validate: () => { step4Wire(); step4Validate(); return null; },
    },
    {
      title: 'Modelo', icon: '⚡',
      render: step5Render,
      validate: () => { step5Wire(); return null; },
    },
  ];

  // After each step render, wire the DOM events via validate (called on "next")
  // But wiring needs to happen after render, not on validate click.
  // Use a wrapper that wires immediately after render via MutationObserver trick:
  const stepsWithWire = steps.map((s, i) => ({
    title: s.title,
    icon: s.icon,
    render: () => {
      const html = s.render();
      // Schedule wiring after DOM update
      setTimeout(() => {
        if (i === 1) step2Wire();
        if (i === 2) step3Wire();
        if (i === 3) step4Wire();
        if (i === 4) step5Wire();
      }, 0);
      return html;
    },
    validate: s.validate,
  }));

  showWizard(stepsWithWire, async () => {
    const promptFinal = buildPrompt(wz);
    try {
      await agentes.criar({
        nome:         wz.nome,
        cargo:        wz.cargo,
        departamento: wz.departamento,
        modelo:       wz.modelo,
        skinAvatar:   wz.skinId,
        promptSistema: promptFinal,
        donoId:       wz.donoId,
      } as unknown as Partial<Agente> & { donoId: string });
      await renderAgentes();
      return true;
    } catch (e) {
      throw new Error(String(e));
    }
  });
}

// ── Edit modal (simples) ──────────────────────────────────────────────────

async function abrirFormEditar(agente: Agente | null): Promise<void> {
  if (!agente) return;

  const deptoOpts = DEPARTAMENTOS.map((d) =>
    `<option value="${d}" ${agente.departamento === d ? 'selected' : ''}>${d}</option>`,
  ).join('');

  const modeloOpts = MODELOS.map((m) =>
    `<option value="${m.id}" ${agente.modelo === m.id ? 'selected' : ''}>${m.label}</option>`,
  ).join('');

  const skinOpts = SKINS.map((s) =>
    `<option value="${s.id}" ${agente.skin_avatar === s.id ? 'selected' : ''}>${s.emoji} ${s.label}</option>`,
  ).join('');

  const estadoOpts = ['ativo', 'offline', 'provisionando'].map((e) =>
    `<option value="${e}" ${agente.estado === e ? 'selected' : ''}>${e}</option>`,
  ).join('');

  const body = `
    <div id="form-msg"></div>
    <div class="form-grid">
      <div class="field">
        <label>Nome *</label>
        <input id="f-nome" type="text" value="${esc(agente.nome)}" />
      </div>
      <div class="field">
        <label>Cargo *</label>
        <input id="f-cargo" type="text" value="${esc(agente.cargo)}" />
      </div>
      <div class="field">
        <label>Departamento</label>
        <select id="f-depto">${deptoOpts}</select>
      </div>
      <div class="field">
        <label>Modelo AI</label>
        <select id="f-modelo">${modeloOpts}</select>
      </div>
      <div class="field">
        <label>Avatar</label>
        <select id="f-skin">${skinOpts}</select>
      </div>
      <div class="field">
        <label>Status</label>
        <select id="f-estado">${estadoOpts}</select>
      </div>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Prompt do Sistema *</label>
      <textarea id="f-prompt" rows="6">${esc(agente.prompt_sistema)}</textarea>
    </div>
  `;

  showModal(`✏️ Editar: ${agente.nome}`, body, async () => {
    const nome    = (document.getElementById('f-nome')   as HTMLInputElement).value.trim();
    const cargo   = (document.getElementById('f-cargo')  as HTMLInputElement).value.trim();
    const depto   = (document.getElementById('f-depto')  as HTMLSelectElement).value;
    const modelo  = (document.getElementById('f-modelo') as HTMLSelectElement).value;
    const skin    = (document.getElementById('f-skin')   as HTMLSelectElement).value;
    const estado  = (document.getElementById('f-estado') as HTMLSelectElement).value;
    const prompt  = (document.getElementById('f-prompt') as HTMLTextAreaElement).value.trim();

    if (!nome || !cargo || !prompt) {
      showFeedback('form-msg', 'Nome, cargo e prompt são obrigatórios.', false);
      return false;
    }

    try {
      await agentes.atualizar(agente.id, {
        nome, cargo, departamento: depto, modelo,
        skinAvatar: skin, promptSistema: prompt, estado,
      } as unknown as Partial<Agente>);
      await renderAgentes();
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}

// ── Rotina modal ──────────────────────────────────────────────────────────

async function abrirFormRotina(agente: Agente): Promise<void> {
  let rotina: Rotina | null = null;
  try { rotina = await agentes.buscarRotina(agente.id); } catch { /* sem rotina */ }

  const body = `
    <div id="form-msg"></div>
    <p style="color:#aaa;font-size:12px;margin-bottom:12px">Rotina diária de <strong>${esc(agente.nome)}</strong></p>
    <div class="rotina-grid">
      <div class="field"><label>Início</label><input id="r-inicio" type="time" value="${rotina?.hora_inicio ?? '09:00'}" /></div>
      <div class="field"><label>Fim</label><input id="r-fim" type="time" value="${rotina?.hora_fim ?? '18:00'}" /></div>
      <div class="field"><label>Início almoço</label><input id="r-almoco-ini" type="time" value="${rotina?.almoco_inicio ?? '12:00'}" /></div>
      <div class="field"><label>Fim almoço</label><input id="r-almoco-fim" type="time" value="${rotina?.almoco_fim ?? '13:00'}" /></div>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Dias da semana (1=Seg, 7=Dom)</label>
      <input id="r-dias" type="text" value="${rotina?.dias_semana ?? '1,2,3,4,5'}" placeholder="1,2,3,4,5" />
    </div>
    <div class="field" style="margin-top:4px">
      <label>Ativa</label>
      <select id="r-ativa">
        <option value="1" ${(rotina?.ativa ?? 1) ? 'selected' : ''}>Sim</option>
        <option value="0" ${!(rotina?.ativa ?? 1) ? 'selected' : ''}>Não</option>
      </select>
    </div>
  `;

  showModal(`🕐 Rotina: ${agente.nome}`, body, async () => {
    try {
      await agentes.salvarRotina(agente.id, {
        horaInicio:   (document.getElementById('r-inicio')     as HTMLInputElement).value,
        horaFim:      (document.getElementById('r-fim')        as HTMLInputElement).value,
        almocoInicio: (document.getElementById('r-almoco-ini') as HTMLInputElement).value,
        almocoFim:    (document.getElementById('r-almoco-fim') as HTMLInputElement).value,
        diasSemana:   (document.getElementById('r-dias')       as HTMLInputElement).value,
        ativa: (document.getElementById('r-ativa') as HTMLSelectElement).value === '1',
      });
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}

// ── Delete confirm ────────────────────────────────────────────────────────

async function confirmarDelete(id: string, nome: string): Promise<void> {
  showModal(
    '🗑️ Remover agente',
    `<p>Tem certeza que deseja remover <strong>${esc(nome)}</strong>? Esta ação não pode ser desfeita.</p>`,
    async () => {
      try { await agentes.remover(id); await renderAgentes(); return true; }
      catch (e) { alert(String(e)); return false; }
    },
    'Remover',
  );
}
