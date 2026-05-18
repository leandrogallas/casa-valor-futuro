import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { OfficeScene } from './scenes/OfficeScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  backgroundColor: '#0d0e12',
  parent: 'game',
  dom: { createContainer: true },
  scene: [BootScene, LoginScene, OfficeScene],
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
