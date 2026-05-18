import { MensagemChat, filtrarPorSala, formatarTimestamp, sanitizarMensagem } from '../logic/chat.js';

const MAX_MENSAGENS_EXIBIDAS = 50;

export class ChatOverlay {
  private container: HTMLDivElement;
  private messagesDiv: HTMLDivElement;
  private input: HTMLInputElement;
  private salaId: string = 'recepcao';
  private mensagens: MensagemChat[] = [];
  private onEnviar: (texto: string, salaId: string) => void;

  constructor(onEnviar: (texto: string, salaId: string) => void) {
    this.onEnviar = onEnviar;

    this.container = document.createElement('div');
    this.container.id = 'chat-overlay';
    this.container.innerHTML = `
      <div id="chat-messages"></div>
      <div id="chat-input-row">
        <input id="chat-input" type="text" placeholder="Mensagem..." maxlength="500" autocomplete="off" />
        <button id="chat-send">↑</button>
      </div>
    `;
    document.body.appendChild(this.container);

    this.messagesDiv = document.getElementById('chat-messages') as HTMLDivElement;
    this.input = document.getElementById('chat-input') as HTMLInputElement;

    document.getElementById('chat-send')!.addEventListener('click', () => this.enviar());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.enviar();
      e.stopPropagation();
    });
    this.input.addEventListener('keyup', (e) => e.stopPropagation());
  }

  setSala(salaId: string): void {
    this.salaId = salaId;
    this.renderizar();
  }

  adicionarMensagem(msg: MensagemChat): void {
    this.mensagens.push(msg);
    if (this.mensagens.length > MAX_MENSAGENS_EXIBIDAS) {
      this.mensagens.shift();
    }
    this.renderizar();
  }

  private renderizar(): void {
    const visiveis = filtrarPorSala(this.mensagens, this.salaId);
    this.messagesDiv.innerHTML = visiveis
      .map(
        (m) =>
          `<div class="chat-msg">
            <span class="chat-time">${formatarTimestamp(m.timestamp)}</span>
            <span class="chat-autor">${escapeHtml(m.autorNome)}</span>
            <span class="chat-texto">${escapeHtml(m.texto)}</span>
          </div>`,
      )
      .join('');
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }

  private enviar(): void {
    const sanitizado = sanitizarMensagem(this.input.value);
    if (!sanitizado) return;
    this.onEnviar(sanitizado, this.salaId);
    this.input.value = '';
  }

  destroy(): void {
    this.container.remove();
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
