import { relatorios, agentes, type Relatorio, type Agente } from '../api.js';
import { $main } from '../dom.js';

const TIPO_BADGE: Record<string, string> = {
  checkin:  'badge-blue',
  checkout: 'badge-green',
  reuniao:  'badge-yellow',
  diario:   'badge-gray',
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function renderRelatorios(): Promise<void> {
  $main().innerHTML = '<div class="loading">Carregando relatórios...</div>';

  let lista: Relatorio[] = [];
  let agentesLista: Agente[] = [];

  try {
    [lista, agentesLista] = await Promise.all([relatorios.listar(), agentes.listar()]);
  } catch (e) {
    $main().innerHTML = `<div class="msg msg-err">Erro: ${String(e)}</div>`;
    return;
  }

  const nomeAgente = (id: string): string => agentesLista.find((a) => a.id === id)?.nome ?? id.slice(0, 8);

  const porTipo = (t: string) => lista.filter((r) => r.tipo === t).length;

  $main().innerHTML = `
    <div id="page-title">📊 Relatórios <span class="badge">${lista.length} total</span></div>
    <div class="stats">
      <div class="stat-card"><div class="stat-val">${porTipo('checkin')}</div><div class="stat-lbl">Check-ins</div></div>
      <div class="stat-card"><div class="stat-val">${porTipo('checkout')}</div><div class="stat-lbl">Checkouts</div></div>
      <div class="stat-card"><div class="stat-val">${porTipo('reuniao')}</div><div class="stat-lbl">Reuniões</div></div>
      <div class="stat-card"><div class="stat-val">${porTipo('diario')}</div><div class="stat-lbl">Diários</div></div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Filtros</span>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap">
        <div class="field" style="min-width:160px">
          <label>Agente</label>
          <select id="filter-agente">
            <option value="">Todos</option>
            ${agentesLista.map((a) => `<option value="${a.id}">${esc(a.nome)}</option>`).join('')}
          </select>
        </div>
        <div class="field" style="min-width:140px">
          <label>Tipo</label>
          <select id="filter-tipo">
            <option value="">Todos</option>
            ${['checkin','checkout','reuniao','diario'].map((t) => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="field" style="min-width:140px">
          <label>Data</label>
          <input id="filter-data" type="date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
        <button class="btn btn-primary btn-sm" id="btn-filtrar">Filtrar</button>
        <button class="btn btn-ghost btn-sm" id="btn-limpar">Limpar</button>
      </div>
    </div>

    <div id="relatorios-lista">
      ${renderLista(lista, nomeAgente)}
    </div>
  `;

  document.getElementById('btn-filtrar')!.addEventListener('click', async () => {
    const agenteId = (document.getElementById('filter-agente') as HTMLSelectElement).value;
    const tipo     = (document.getElementById('filter-tipo') as HTMLSelectElement).value;
    const data     = (document.getElementById('filter-data') as HTMLInputElement).value;

    const params: Record<string, string> = {};
    if (agenteId) params.agenteId = agenteId;
    if (tipo)     params.tipo = tipo;
    if (data)     params.data = data;

    document.getElementById('relatorios-lista')!.innerHTML = '<div class="loading">Filtrando...</div>';
    try {
      const filtrados = await relatorios.listar(params);
      document.getElementById('relatorios-lista')!.innerHTML = renderLista(filtrados, nomeAgente);
    } catch (e) {
      document.getElementById('relatorios-lista')!.innerHTML = `<div class="msg msg-err">${String(e)}</div>`;
    }
  });

  document.getElementById('btn-limpar')!.addEventListener('click', async () => {
    (document.getElementById('filter-agente') as HTMLSelectElement).value = '';
    (document.getElementById('filter-tipo') as HTMLSelectElement).value = '';
    (document.getElementById('filter-data') as HTMLInputElement).value = '';
    document.getElementById('relatorios-lista')!.innerHTML = '<div class="loading">Carregando...</div>';
    const todos = await relatorios.listar();
    document.getElementById('relatorios-lista')!.innerHTML = renderLista(todos, nomeAgente);
  });
}

function renderLista(lista: Relatorio[], nomeAgente: (id: string) => string): string {
  if (lista.length === 0) {
    return '<div class="loading">Nenhum relatório encontrado.</div>';
  }

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${lista.map((r) => `
        <div class="report-card">
          <div class="report-header">
            <span class="badge ${TIPO_BADGE[r.tipo] ?? 'badge-gray'}">${r.tipo}</span>
            <strong style="font-size:13px">${esc(nomeAgente(r.agente_id))}</strong>
            <span style="color:#666;font-size:11px">${fmtData(r.criado_em)}</span>
            ${r.tarefas_concluidas || r.tarefas_abertas ? `
              <span style="margin-left:auto;font-size:11px;color:#888">
                ✅ ${r.tarefas_concluidas} concluídas · 🔵 ${r.tarefas_abertas} abertas
              </span>
            ` : ''}
          </div>
          <div class="report-content">${esc(r.conteudo)}</div>
        </div>
      `).join('')}
    </div>
  `;
}
