// Stub de boot — sem dependência runtime obrigatória.
// Quando o Phaser estiver instalado e configurado, este arquivo passa a criar
// a instância de Phaser.Game e registrar as cenas em src/scenes/.
import { BootScene } from './scenes/BootScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';

const root = document.getElementById('game');
if (root) {
  root.innerHTML = '<p style="padding:1rem">Laboratório do Bastião — cliente em scaffold.</p>';
}

// Referências exportadas para que o build não derrube as cenas como dead code.
export const scenes = [BootScene, OfficeScene];
