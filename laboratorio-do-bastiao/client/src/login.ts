import { autenticar } from './net/colyseusClient.js';

// Already authenticated → skip to portal
if (sessionStorage.getItem('bastiao_token')) {
  window.location.replace('/portal.html');
}

const form  = document.getElementById('login-form')  as HTMLFormElement;
const btn   = document.getElementById('login-btn')   as HTMLButtonElement;
const erroEl = document.getElementById('login-erro') as HTMLElement;

function setLoading(v: boolean): void {
  btn.disabled = v;
  btn.classList.toggle('loading', v);
}

function showErro(msg: string): void {
  erroEl.textContent = msg;
  erroEl.style.display = 'block';
}

function hideErro(): void {
  erroEl.style.display = 'none';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideErro();

  const nome  = (document.getElementById('f-nome')  as HTMLInputElement).value.trim();
  const email = (document.getElementById('f-email') as HTMLInputElement).value.trim();

  if (!nome)  { showErro('Informe seu nome.'); return; }
  if (!email) { showErro('Informe seu e-mail.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErro('E-mail inválido.'); return; }

  setLoading(true);

  try {
    const { token, usuario } = await autenticar(email, nome);
    sessionStorage.setItem('bastiao_token', token);
    sessionStorage.setItem('bastiao_usuario', JSON.stringify(usuario));
    window.location.replace('/portal.html');
  } catch {
    showErro('Não foi possível conectar. O servidor está no ar?');
    setLoading(false);
  }
});
