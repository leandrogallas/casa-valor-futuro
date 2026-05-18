import Phaser from 'phaser';
import { autenticar } from '../net/colyseusClient.js';

export class LoginScene extends Phaser.Scene {
  static readonly key = 'LoginScene';

  constructor() {
    super({ key: LoginScene.key });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0e12);

    this.add.text(width / 2, height / 2 - 100, 'Laboratório do Bastião', {
      fontSize: '28px',
      color: '#4dabf7',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const form = this.add.dom(width / 2, height / 2).createFromHTML(`
      <div style="
        background: rgba(26,26,46,0.95);
        border: 1px solid #4dabf7;
        border-radius: 8px;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 280px;
        font-family: system-ui, sans-serif;
      ">
        <div id="login-erro" style="color:#ff6b6b;font-size:13px;display:none"></div>
        <input id="login-nome" type="text" placeholder="Seu nome"
          style="padding:0.6rem;border-radius:4px;border:1px solid #555;background:#1a1a2e;color:#e6e6e6;font-size:14px;outline:none" />
        <input id="login-email" type="email" placeholder="email@bastiao.dev"
          style="padding:0.6rem;border-radius:4px;border:1px solid #555;background:#1a1a2e;color:#e6e6e6;font-size:14px;outline:none" />
        <button id="login-btn" style="
          padding:0.7rem;border-radius:4px;border:none;background:#4dabf7;color:#0d0e12;
          font-size:14px;font-weight:bold;cursor:pointer;
        ">Entrar</button>
      </div>
    `);

    form.addListener('click');
    form.on('click', async (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.id !== 'login-btn') return;

      const nome = (document.getElementById('login-nome') as HTMLInputElement).value.trim();
      const email = (document.getElementById('login-email') as HTMLInputElement).value.trim();
      const erroEl = document.getElementById('login-erro') as HTMLElement;

      if (!nome || !email) {
        erroEl.textContent = 'Nome e e-mail são obrigatórios.';
        erroEl.style.display = 'block';
        return;
      }

      (document.getElementById('login-btn') as HTMLButtonElement).disabled = true;
      erroEl.style.display = 'none';

      try {
        const { token, usuario } = await autenticar(email, nome);
        sessionStorage.setItem('bastiao_token', token);
        sessionStorage.setItem('bastiao_usuario', JSON.stringify(usuario));
        form.destroy();
        this.scene.start('OfficeScene', { token, usuario });
      } catch (err) {
        erroEl.textContent = 'Erro ao conectar. Servidor está rodando?';
        erroEl.style.display = 'block';
        (document.getElementById('login-btn') as HTMLButtonElement).disabled = false;
      }
    });
  }
}
