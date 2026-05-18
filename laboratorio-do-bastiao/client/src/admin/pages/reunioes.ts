import { reunioes, agentes, type Reuniao, type Agente } from '../api.js';
import { $main, showModal, showFeedback } from '../dom.js';

const STATUS_BADGE: Record<string, string> = {
  agendada:    'badge-blue',
  em_andamento:'badge-yellow',
  concluida:   'badge-green',
  cancelada:   'badge-gray',
};

const SALAS = [
  { id: 'meeting1',  nome: 'Sala de Reunião 1' },
  { id: 'meeting2',  nome: 'Sala de Reunião 2' },
  { id: 'executive', nome: 'Diretoria' },
];

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function renderReunioes(): Promise<void> {
  $main().innerHTML = '<div class="loading">Carregando reuniões...</div>';

  let lista: Reuniao[] = [];
  let agentesLista: Agente[] = [];

  try {
    [lista, agentesLista] = await Promise.all([reunioes.listar(), agentes.listar()]);
  } catch (e) {
    $main().innerHTML = `<div class="msg msg-err">Erro: ${String(e)}</div>`;
    return;
  }

  const nomeParticipante = (id: string): string => agentesLista.find((a) => a.id === id)?.nome ?? id.slice(0, 8);
  const nomeSala = (salaId: string): string => SALAS.find((s) => s.id === salaId)?.nome ?? salaId;

  const porStatus = (s: string) => lista.filter((r) => r.status === s).length;

  $main().innerHTML = `
    <div id="page-title">📅 Reuniões <span class="badge">${lista.length} total</span></div>
    <div class="stats">
      <div class="stat-card"><div class="stat-val">${porStatus('agendada')}</div><div class="stat-lbl">Agendadas</div></div>
      <div class="stat-card"><div class="stat-val">${porStatus('em_andamento')}</div><div class="stat-lbl">Em andamento</div></div>
      <div class="stat-card"><div class="stat-val">${porStatus('concluida')}</div><div class="stat-lbl">Concluídas</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Todas as reuniões</span>
        <button class="btn btn-primary btn-sm" id="btn-nova-reuniao">+ Agendar Reunião</button>
      </div>
      <table>
        <thead>
          <tr><th>Título</th><th>Sala</th><th>Início</th><th>Participantes</th><th>Status</th><th>Ações</th></tr>
        </thead>
        <tbody>
          ${lista.map((r) => `
            <tr>
              <td>
                <strong>${esc(r.titulo)}</strong>
                ${r.descricao ? `<br><span style="color:#888;font-size:11px">${esc(r.descricao.slice(0, 50))}</span>` : ''}
              </td>
              <td>${nomeSala(r.sala_id)}</td>
              <td style="font-size:12px;color:#aaa">${fmtData(r.inicio_em)}</td>
              <td style="font-size:12px">${(r.participantes ?? []).map((p) => esc(nomeParticipante(p.participante_id))).join(', ') || '—'}</td>
              <td><span class="badge ${STATUS_BADGE[r.status] ?? 'badge-gray'}">${r.status.replace('_', ' ')}</span></td>
              <td>
                ${r.status === 'agendada' ? `<button class="btn btn-ghost btn-sm" data-iniciar="${r.id}">▶ Iniciar</button>` : ''}
                ${r.status === 'em_andamento' ? `<button class="btn btn-ghost btn-sm" data-concluir="${r.id}">✅ Concluir</button>` : ''}
                ${r.ata ? `<button class="btn btn-ghost btn-sm" data-ver-ata="${r.id}">📄 Ata</button>` : ''}
              </td>
            </tr>
          `).join('')}
          ${lista.length === 0 ? '<tr><td colspan="6" style="color:#555;text-align:center;padding:24px">Nenhuma reunião agendada</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('btn-nova-reuniao')!.addEventListener('click', () => void abrirFormReuniao(agentesLista));

  document.querySelectorAll<HTMLButtonElement>('[data-iniciar]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await reunioes.atualizarStatus(btn.dataset.iniciar!, 'em_andamento');
      void renderReunioes();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-concluir]').forEach((btn) => {
    btn.addEventListener('click', () => void abrirFormAta(btn.dataset.concluir!));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-ver-ata]').forEach((btn) => {
    const reuniao = lista.find((r) => r.id === btn.dataset.verAta);
    if (reuniao) {
      btn.addEventListener('click', () => {
        showModal('📄 Ata da Reunião', `<div class="report-content">${esc(reuniao.ata)}</div>`, async () => true, 'Fechar');
      });
    }
  });
}

async function abrirFormReuniao(agentesLista: Agente[]): Promise<void> {
  const agora = new Date();
  agora.setMinutes(Math.ceil(agora.getMinutes() / 15) * 15, 0, 0);
  const defaultInicio = agora.toISOString().slice(0, 16);

  const body = `
    <div id="form-msg"></div>
    <div class="form-grid">
      <div class="field">
        <label>Título *</label>
        <input id="re-titulo" type="text" placeholder="Ex: Alinhamento semanal" />
      </div>
      <div class="field">
        <label>Sala</label>
        <select id="re-sala">
          ${SALAS.map((s) => `<option value="${s.id}">${s.nome}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Data e hora *</label>
        <input id="re-inicio" type="datetime-local" value="${defaultInicio}" />
      </div>
      <div class="field">
        <label>Organizador *</label>
        <select id="re-org">
          ${agentesLista.map((a) => `<option value="${a.id}">${esc(a.nome)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Pauta</label>
      <textarea id="re-desc" rows="3" placeholder="O que será discutido..."></textarea>
    </div>
    <div class="field" style="margin-top:8px">
      <label>Participantes adicionais</label>
      <div style="display:flex;flex-direction:column;gap:4px;max-height:140px;overflow-y:auto;border:1px solid var(--border);border-radius:6px;padding:8px">
        ${agentesLista.map((a) => `
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
            <input type="checkbox" data-part="${a.id}" />
            ${esc(a.nome)} <span style="color:#666;font-size:11px">(${esc(a.cargo)})</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  showModal('📅 Agendar Reunião', body, async () => {
    const titulo = (document.getElementById('re-titulo') as HTMLInputElement).value.trim();
    const salaId = (document.getElementById('re-sala') as HTMLSelectElement).value;
    const inicioLocal = (document.getElementById('re-inicio') as HTMLInputElement).value;
    const organizadorId = (document.getElementById('re-org') as HTMLSelectElement).value;
    const descricao = (document.getElementById('re-desc') as HTMLTextAreaElement).value.trim();

    if (!titulo || !inicioLocal) {
      showFeedback('form-msg', 'Título e data/hora são obrigatórios.', false);
      return false;
    }

    const checkedParts = Array.from(document.querySelectorAll<HTMLInputElement>('[data-part]:checked'))
      .map((cb) => ({ id: cb.dataset.part!, tipo: 'agente' }));

    try {
      await reunioes.criar({ titulo, descricao, salaId, inicioEm: new Date(inicioLocal).toISOString(), organizadorId, participantes: checkedParts });
      await renderReunioes();
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  });
}

async function abrirFormAta(reuniaoId: string): Promise<void> {
  showModal('✅ Concluir reunião', `
    <div id="form-msg"></div>
    <div class="field">
      <label>Ata / Resumo da reunião</label>
      <textarea id="ata-texto" rows="6" placeholder="O que foi discutido, decisões tomadas, próximos passos..."></textarea>
    </div>
  `, async () => {
    const ata = (document.getElementById('ata-texto') as HTMLTextAreaElement).value.trim();
    try {
      await reunioes.atualizarStatus(reuniaoId, 'concluida', ata || undefined);
      await renderReunioes();
      return true;
    } catch (e) {
      showFeedback('form-msg', String(e), false);
      return false;
    }
  }, 'Concluir');
}
