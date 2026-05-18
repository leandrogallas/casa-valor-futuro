import { labelStatus, corStatus, validarTarefaForm } from '../logic/taskBoard.js';
import type { TarefaItem } from '../logic/taskBoard.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STATUS_OPTIONS = ['aberta', 'em_andamento', 'concluida', 'cancelada'];

export class TaskBoardOverlay {
  private container: HTMLDivElement;
  private visible = false;

  constructor(
    private serverUrl: string,
    private token: string,
    private usuarioId: string,
  ) {
    this.container = document.createElement('div');
    this.container.id = 'task-board';
    this.container.innerHTML = `
      <div id="tb-header">
        <span>Task Board</span>
        <kbd id="tb-hint">[T]</kbd>
        <button id="tb-close">✕</button>
      </div>
      <div id="tb-tabs">
        <button class="tb-tab active" data-tab="list">Tarefas</button>
        <button class="tb-tab" data-tab="create">+ Nova</button>
      </div>
      <div id="tb-list" class="tb-panel">
        <div id="tb-task-list"><p class="tb-info">Carregando...</p></div>
      </div>
      <div id="tb-create" class="tb-panel" style="display:none">
        <input id="tb-titulo" type="text" placeholder="Título da tarefa" maxlength="200" />
        <textarea id="tb-descricao" placeholder="Descrição (opcional)" maxlength="2000" rows="3"></textarea>
        <input id="tb-responsavel" type="text" placeholder="ID do responsável (agente ou usuário)" />
        <select id="tb-prioridade">
          <option value="baixa">Prioridade: Baixa</option>
          <option value="media" selected>Prioridade: Média</option>
          <option value="alta">Prioridade: Alta</option>
        </select>
        <button id="tb-submit">Criar tarefa</button>
        <p id="tb-msg"></p>
      </div>
    `;
    document.body.appendChild(this.container);
    this.container.style.display = 'none';

    this.bindEvents();
    this.blockKeys();
  }

  private bindEvents(): void {
    document.getElementById('tb-close')!.addEventListener('click', () => this.hide());

    document.querySelectorAll('.tb-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.tab!;
        document.querySelectorAll('.tb-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        (document.getElementById('tb-list') as HTMLElement).style.display = tab === 'list' ? '' : 'none';
        (document.getElementById('tb-create') as HTMLElement).style.display = tab === 'create' ? '' : 'none';
        if (tab === 'list') void this.carregarTarefas();
      });
    });

    document.getElementById('tb-submit')!.addEventListener('click', () => void this.criarTarefa());
  }

  private blockKeys(): void {
    ['keydown', 'keyup'].forEach((ev) => {
      this.container.addEventListener(ev, (e) => e.stopPropagation());
    });
  }

  toggle(): void {
    this.visible ? this.hide() : this.show();
  }

  show(): void {
    this.visible = true;
    this.container.style.display = '';
    void this.carregarTarefas();
  }

  hide(): void {
    this.visible = false;
    this.container.style.display = 'none';
  }

  private async carregarTarefas(): Promise<void> {
    const listEl = document.getElementById('tb-task-list')!;
    listEl.innerHTML = '<p class="tb-info">Carregando...</p>';
    try {
      const res = await fetch(`${this.serverUrl}/tarefas`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const tarefas = (await res.json()) as TarefaItem[];

      if (tarefas.length === 0) {
        listEl.innerHTML = '<p class="tb-info">Nenhuma tarefa ainda.</p>';
        return;
      }

      listEl.innerHTML = tarefas.map((t) => this.renderTarefa(t)).join('');

      listEl.querySelectorAll('.tb-status-sel').forEach((sel) => {
        sel.addEventListener('change', (e) => {
          const id = (sel as HTMLElement).dataset.id!;
          const status = (e.target as HTMLSelectElement).value;
          void this.atualizarStatus(id, status);
        });
      });
    } catch {
      listEl.innerHTML = '<p class="tb-erro">Erro ao carregar tarefas.</p>';
    }
  }

  private renderTarefa(t: TarefaItem): string {
    const cor = corStatus(t.status);
    const label = labelStatus(t.status);
    const options = STATUS_OPTIONS.map(
      (s) => `<option value="${s}"${s === t.status ? ' selected' : ''}>${escapeHtml(labelStatus(s))}</option>`,
    ).join('');
    return `
      <div class="tb-task">
        <div class="tb-task-top">
          <span class="tb-task-titulo">${escapeHtml(t.titulo)}</span>
          <span class="tb-badge" style="background:${cor}">${escapeHtml(label)}</span>
        </div>
        ${t.descricao ? `<div class="tb-task-desc">${escapeHtml(t.descricao)}</div>` : ''}
        <div class="tb-task-foot">
          <span class="tb-prio">${escapeHtml(t.prioridade)}</span>
          <select class="tb-status-sel" data-id="${t.id}">${options}</select>
        </div>
      </div>
    `;
  }

  private async atualizarStatus(tarefaId: string, status: string): Promise<void> {
    await fetch(`${this.serverUrl}/tarefas/${tarefaId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
      body: JSON.stringify({ status }),
    });
    void this.carregarTarefas();
  }

  private async criarTarefa(): Promise<void> {
    const titulo = (document.getElementById('tb-titulo') as HTMLInputElement).value;
    const descricao = (document.getElementById('tb-descricao') as HTMLTextAreaElement).value.trim();
    const responsavelId = (document.getElementById('tb-responsavel') as HTMLInputElement).value;
    const prioridade = (document.getElementById('tb-prioridade') as HTMLSelectElement).value;
    const msgEl = document.getElementById('tb-msg')!;

    const erro = validarTarefaForm(titulo, responsavelId);
    if (erro) {
      msgEl.textContent = erro;
      msgEl.className = 'tb-erro';
      return;
    }

    const res = await fetch(`${this.serverUrl}/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
      body: JSON.stringify({ titulo: titulo.trim(), descricao, responsavelId: responsavelId.trim(), autorId: this.usuarioId, prioridade }),
    });

    if (res.ok) {
      msgEl.textContent = 'Tarefa criada!';
      msgEl.className = 'tb-ok';
      (document.getElementById('tb-titulo') as HTMLInputElement).value = '';
      (document.getElementById('tb-descricao') as HTMLTextAreaElement).value = '';
      (document.getElementById('tb-responsavel') as HTMLInputElement).value = '';
    } else {
      msgEl.textContent = 'Erro ao criar tarefa.';
      msgEl.className = 'tb-erro';
    }
  }

  destroy(): void {
    this.container.remove();
  }
}
