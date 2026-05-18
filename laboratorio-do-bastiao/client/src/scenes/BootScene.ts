import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  static readonly key = 'BootScene';

  constructor() {
    super({ key: BootScene.key });
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
