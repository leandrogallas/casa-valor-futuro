import { agentes, usuarios, type Agente, type Rotina } from '../api.js';
import { $main, showModal, hideModal, showFeedback } from '../dom.js';

const SKINS = [
  { id: 'agent-pink',     cor: '#D85A30', label: 'Marketing (Rosa)' },
  { id: 'agent-orange',   cor: '#BA7517', label: 'Copy (Laranja)' },
  { id: 'agent-green',    cor: '#639922', label: 'Pesquisa (Verde)' },
  { id: 'agent-blue',     cor: '#378ADD', label: 'Growth (Azul)' },
  { id: 'agent-gold',     cor: '#854F0B', label: 'Financeiro (Ouro)' },
  { id: 'agent-burgundy', cor: '#7B4A4A', label: 'Diretoria (Bordô)' },
  { id: 'agent-default',  cor: '#00D4FF', label: 'Padrão (Ciano)' },
];

const MODELOS = [
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-opus-4-7',
  'claude-sonnet-4-5',
];

const DEPARTAMENTOS = ['marketing', 'copy', 'research', 'growth', 'finance', 'executive', 'reception', 'kitchen', 'lounge', 'geral'];

function skinCor(skinId: string): string {
  return SKINS.find((s) => s.id === skinId)?.cor ?? '#888';
}

function estadoBadge(estado: string, ativo: number): string {
  if (!ativo) return '<span class="badge badge-gray">Inativo</span>';
  const map: Record<string, string> = {
    ativo: 'badge-green',
    provisionando: 'badge-yellow',
    offline: 'badge-gray',
    erro: 'badge-red',
  };
  return `<span class="badge ${map[estado] ?? 'badge-gray'}">${estado}</span>`;
}

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
            <th>Avatar</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Modelo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="agentes-tbody">
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

  document.getElementById('btn-novo-agente')!.addEventListener('click', () => void abrirFormAgente(null));

  document.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((btn) => {
    const id = btn.dataset.edit!;
    btn.addEventListener('click', () => void abrirFormAgente(lista.find((a) => a.id === id) ?? null));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-rotina]').forEach((btn) => {
    const id = btn.dataset.rotina!;
    const agente = lista.find((a) => a.id === id)!;
    btn.addEventListener('click', () => void abrirFormRotina(agente));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((btn) => {
    const id = btn.dataset.del!;
    const nome = btn.dataset.nome!;
    btn.addEventListener('click', () => void confirmarDelete(id, nome));
  });
}

async function abrirFormAgente(agente: Agente | null): Promise<void> {
  let usuariosList: { id: string; nome: string }[] = [];
  try { usuariosList = await usuarios.listar(); } catch { /* ok */ }

  const isEdit = agente !== null;
  const titulo = isEdit ? `✏️ Editar: ${agente.nome}` : '🤖 Novo Agente';

  const body = `
    <div id="form-msg"></div>
    <div class="form-grid">
      <div class="field">
        <label>Nome *</label>
        <input id="f-nome" type="text" placeholder="Ex: Mari" value="${esc(agente?.nome ?? '')}" />
      </div>
      <div class="field">
        <label>Cargo *</label>
        <input id="f-cargo" type="text" placeholder="Ex: Especialista de Marketing" value="${esc(agente?.cargo ?? '')}" />
      </div>
      <div class="field">
        <label>Departamento</label>
        <select id="f-depto">
          ${DEPARTAMENTOS.map((d) => `<option value="${d}" ${agente?.departamento === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Modelo AI *</label>
        <select id="f-modelo">
          ${MODELOS.map((m) => `<option value="${m}" ${(agente?.modelo ?? 'claude-sonnet-4-6') === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Avatar (skin)</label>
        <select id="f-skin">
          ${SKINS.map((s) => `<option value="${s.id}" ${(agente?.skin_avatar ?? 'agent-default') === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      ${!isEdit ? `
      <div class="field">
        <label>Dono (usuário) *</label>
        <select id="f-dono">
          ${usuariosList.map((u) => `<option value="${u.id}">${esc(u.nome)}</option>`).join('')}
          ${usuariosList.length === 0 ? '<option value="">— nenhum usuário cadastrado —</option>' : ''}
        </select>
      </div>
      ` : ''}
    </div>
    <div class="field" style="margin-top:8px">
      <label>Prompt do Sistema *</label>
      <textarea id="f-prompt" rows="5" placeholder="Descreva a personalidade, especialidade e comportamento do agente...">${esc(agente?.prompt_sistema ?? '')}</textarea>
    </div>
    ${isEdit ? `
    <div class="field" style="margin-top:4px">
      <label>Status</label>
      <select id="f-estado">
        ${['ativo','offline','provisionando'].map((e) => `<option value="${e}" ${agente.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
      </select>
    </div>
    ` : ''}
  `;

  showModal(titulo, body, async () => {
    const nome      = (document.getElementById('f-nome') as HTMLInputElement).value.trim();
    const cargo     = (document.getElementById('f-cargo') as HTMLInputElement).value.trim();
    const depto     = (document.getElementById('f-depto') as HTMLSelectElement).value;
    const modelo    = (document.getElementById('f-modelo') as HTMLSelectElement).value;
    const skin      = (document.getElementById('f-skin') as HTMLSelectElement).value;
    const prompt    = (document.getElementById('f-prompt') as HTMLTextAreaElement).value.trim();

    if (!nome || !cargo || !prompt) {
      showFeedback('form-msg', 'Nome, cargo e prompt são obrigatórios.', false);
      return false;
    }

    try {
      if (isEdit) {
        const estado = (document.getElementById('f-estado') as HTMLSelectElement).value;
        await agentes.atualizar(agente.id, { nome, cargo, departamento: depto, modelo, skinAvatar: skin, promptSistema: prompt, estado } as unknown as Partial<Agente>);
      } else {
        const donoId = (document.getElementById('f-dono') as HTMLSelectElement)?.value;
        if (!donoId) { showFeedback('form-msg', 'Selecione um usuário dono.', false); return false; }
        await agentes.criar({ nome, cargo, departamento: depto, modelo, skinAvatar: skin, promptSistema: prompt, donoId } as unknown as Partial<Agente> & { donoId: string });
      }
      await renderAgentes();
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}

async function abrirFormRotina(agente: Agente): Promise<void> {
  let rotina: Rotina | null = null;
  try { rotina = await agentes.buscarRotina(agente.id); } catch { /* sem rotina ainda */ }

  const body = `
    <div id="form-msg"></div>
    <p style="color:#aaa;font-size:12px;margin-bottom:8px">Rotina diária de <strong>${esc(agente.nome)}</strong></p>
    <div class="rotina-grid">
      <div class="field">
        <label>Hora de início</label>
        <input id="r-inicio" type="time" value="${rotina?.hora_inicio ?? '09:00'}" />
      </div>
      <div class="field">
        <label>Hora de fim</label>
        <input id="r-fim" type="time" value="${rotina?.hora_fim ?? '18:00'}" />
      </div>
      <div class="field">
        <label>Início do almoço</label>
        <input id="r-almoco-ini" type="time" value="${rotina?.almoco_inicio ?? '12:00'}" />
      </div>
      <div class="field">
        <label>Fim do almoço</label>
        <input id="r-almoco-fim" type="time" value="${rotina?.almoco_fim ?? '13:00'}" />
      </div>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Dias da semana (1=Seg, 7=Dom)</label>
      <input id="r-dias" type="text" value="${rotina?.dias_semana ?? '1,2,3,4,5'}" placeholder="1,2,3,4,5" />
    </div>
    <div class="field" style="margin-top:4px">
      <label>Rotina ativa</label>
      <select id="r-ativa">
        <option value="1" ${(rotina?.ativa ?? 1) ? 'selected' : ''}>Sim</option>
        <option value="0" ${!(rotina?.ativa ?? 1) ? 'selected' : ''}>Não</option>
      </select>
    </div>
  `;

  showModal(`🕐 Rotina: ${agente.nome}`, body, async () => {
    const horaInicio   = (document.getElementById('r-inicio') as HTMLInputElement).value;
    const horaFim      = (document.getElementById('r-fim') as HTMLInputElement).value;
    const almocoInicio = (document.getElementById('r-almoco-ini') as HTMLInputElement).value;
    const almocoFim    = (document.getElementById('r-almoco-fim') as HTMLInputElement).value;
    const diasSemana   = (document.getElementById('r-dias') as HTMLInputElement).value;
    const ativa = (document.getElementById('r-ativa') as HTMLSelectElement).value === '1';

    try {
      await agentes.salvarRotina(agente.id, { horaInicio, horaFim, almocoInicio, almocoFim, diasSemana, ativa });
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}

async function confirmarDelete(id: string, nome: string): Promise<void> {
  showModal(
    `🗑️ Remover agente`,
    `<p>Tem certeza que deseja remover <strong>${esc(nome)}</strong>? Esta ação não pode ser desfeita.</p>`,
    async () => {
      try {
        await agentes.remover(id);
        await renderAgentes();
        return true;
      } catch (e) {
        alert(String(e));
        return false;
      }
    },
    'Remover',
  );
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
