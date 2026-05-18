import { tarefas, agentes, usuarios, type Tarefa, type Agente } from '../api.js';
import { $main, showModal, showFeedback } from '../dom.js';

const STATUS_BADGE: Record<string, string> = {
  aberta: 'badge-blue',
  em_andamento: 'badge-yellow',
  concluida: 'badge-green',
  cancelada: 'badge-gray',
};

const PRIO_BADGE: Record<string, string> = {
  urgente: 'badge-red',
  alta: 'badge-red',
  media: 'badge-yellow',
  baixa: 'badge-gray',
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export async function renderTarefas(): Promise<void> {
  $main().innerHTML = '<div class="loading">Carregando tarefas...</div>';

  let lista: Tarefa[] = [];
  let agentesLista: Agente[] = [];

  try {
    [lista, agentesLista] = await Promise.all([tarefas.listar(), agentes.listar()]);
  } catch (e) {
    $main().innerHTML = `<div class="msg msg-err">Erro: ${String(e)}</div>`;
    return;
  }

  const nomeAgente = (id: string): string => agentesLista.find((a) => a.id === id)?.nome ?? id.slice(0, 8);

  const porStatus = (s: string) => lista.filter((t) => t.status === s).length;

  $main().innerHTML = `
    <div id="page-title">📋 Tarefas <span class="badge">${lista.length} total</span></div>
    <div class="stats">
      <div class="stat-card"><div class="stat-val">${porStatus('aberta')}</div><div class="stat-lbl">Abertas</div></div>
      <div class="stat-card"><div class="stat-val">${porStatus('em_andamento')}</div><div class="stat-lbl">Em andamento</div></div>
      <div class="stat-card"><div class="stat-val">${porStatus('concluida')}</div><div class="stat-lbl">Concluídas</div></div>
      <div class="stat-card"><div class="stat-val">${porStatus('cancelada')}</div><div class="stat-lbl">Canceladas</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Todas as tarefas</span>
        <button class="btn btn-primary btn-sm" id="btn-nova-tarefa">+ Nova Tarefa</button>
      </div>
      <table>
        <thead>
          <tr><th>Título</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th>Criada em</th><th>Ações</th></tr>
        </thead>
        <tbody>
          ${lista.map((t) => `
            <tr>
              <td><strong>${esc(t.titulo)}</strong>${t.descricao ? `<br><span style="color:#888;font-size:11px">${esc(t.descricao.slice(0, 60))}${t.descricao.length > 60 ? '…' : ''}</span>` : ''}</td>
              <td>${esc(nomeAgente(t.responsavel_id))}</td>
              <td><span class="badge ${PRIO_BADGE[t.prioridade] ?? 'badge-gray'}">${t.prioridade}</span></td>
              <td>
                <select class="badge ${STATUS_BADGE[t.status] ?? 'badge-gray'}" data-status-id="${t.id}" style="border:none;cursor:pointer;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold">
                  ${['aberta','em_andamento','concluida','cancelada'].map((s) => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                </select>
              </td>
              <td style="color:#888;font-size:12px">${fmtData(t.criado_em)}</td>
              <td><button class="btn btn-ghost btn-sm" data-edit-tarefa="${t.id}" data-nome="${esc(t.titulo)}">✏️</button></td>
            </tr>
          `).join('')}
          ${lista.length === 0 ? '<tr><td colspan="6" style="color:#555;text-align:center;padding:24px">Nenhuma tarefa cadastrada</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-nova-tarefa')!.addEventListener('click', () => void abrirFormTarefa(null, agentesLista));

  document.querySelectorAll<HTMLSelectElement>('[data-status-id]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      try {
        await tarefas.atualizarStatus(sel.dataset.statusId!, sel.value);
        sel.className = `badge ${STATUS_BADGE[sel.value] ?? 'badge-gray'}`;
      } catch (e) { alert(String(e)); }
    });
  });
}

async function abrirFormTarefa(tarefa: Tarefa | null, agentesLista: Agente[]): Promise<void> {
  let usuariosList: { id: string; nome: string }[] = [];
  try { usuariosList = await usuarios.listar(); } catch { /* ok */ }

  const body = `
    <div id="form-msg"></div>
    <div class="form-grid">
      <div class="field">
        <label>Título *</label>
        <input id="t-titulo" type="text" placeholder="Ex: Criar campanha de email" value="${esc(tarefa?.titulo ?? '')}" />
      </div>
      <div class="field">
        <label>Prioridade</label>
        <select id="t-prio">
          ${['baixa','media','alta','urgente'].map((p) => `<option value="${p}" ${(tarefa?.prioridade ?? 'media') === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Responsável (agente) *</label>
        <select id="t-resp">
          ${agentesLista.map((a) => `<option value="${a.id}" ${tarefa?.responsavel_id === a.id ? 'selected' : ''}>${esc(a.nome)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Autor (usuário) *</label>
        <select id="t-autor">
          ${usuariosList.map((u) => `<option value="${u.id}">${esc(u.nome)}</option>`).join('')}
          ${usuariosList.length === 0 ? '<option value="">— sem usuários —</option>' : ''}
        </select>
      </div>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Descrição</label>
      <textarea id="t-desc" rows="4" placeholder="Detalhes da tarefa...">${esc(tarefa?.descricao ?? '')}</textarea>
    </div>
  `;

  showModal('📋 Nova Tarefa', body, async () => {
    const titulo = (document.getElementById('t-titulo') as HTMLInputElement).value.trim();
    const prioridade = (document.getElementById('t-prio') as HTMLSelectElement).value;
    const responsavelId = (document.getElementById('t-resp') as HTMLSelectElement).value;
    const autorId = (document.getElementById('t-autor') as HTMLSelectElement)?.value;
    const descricao = (document.getElementById('t-desc') as HTMLTextAreaElement).value.trim();

    if (!titulo || !responsavelId || !autorId) {
      showFeedback('form-msg', 'Título, responsável e autor são obrigatórios.', false);
      return false;
    }

    try {
      await tarefas.criar({ titulo, prioridade, responsavel_id: responsavelId, autor_id: autorId, descricao });
      await renderTarefas();
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}
