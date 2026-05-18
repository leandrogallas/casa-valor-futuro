import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';

// Guard: require auth
const token = sessionStorage.getItem('bastiao_token');
if (!token) {
  window.location.replace('/');
  throw new Error('unauthenticated');
}

// ── Top bar user display ────────────────────────────────────────────────
const usuario = JSON.parse(sessionStorage.getItem('bastiao_usuario') ?? '{}') as {
  nome?: string;
};

if (usuario.nome) {
  const nomeEl = document.getElementById('bar-nome');
  const inicEl = document.getElementById('bar-initials');
  if (nomeEl) nomeEl.textContent = usuario.nome;
  if (inicEl) {
    inicEl.textContent = usuario.nome
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}

document.getElementById('bar-logout')?.addEventListener('click', () => {
  sessionStorage.clear();
  window.location.replace('/');
});

// ── Phaser game ─────────────────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 560,
  backgroundColor: '#0d0e12',
  parent: 'game',
  dom: { createContainer: true },
  scene: [BootScene, PreloadScene, LoginScene, OfficeScene],
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
