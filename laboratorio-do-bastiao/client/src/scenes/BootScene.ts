import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  static readonly key = 'BootScene';

  constructor() {
    super({ key: BootScene.key });
  }

  preload(): void {
    // Gera texturas procedurais — sem arquivos externos no MVP
    this.criarTexturaAvatar('avatar-self', 0x4dabf7);
    this.criarTexturaAvatar('avatar-outro', 0x51cf66);
    this.criarTexturaAvatar('avatar-agente', 0xff9900);
  }

  create(): void {
    this.scene.start('LoginScene');
  }

  private criarTexturaAvatar(key: string, cor: number): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x000000, 0.3);
    g.fillCircle(18, 18, 16);
    g.fillStyle(cor, 1);
    g.fillCircle(16, 16, 16);
    g.lineStyle(2, 0xffffff, 0.6);
    g.strokeCircle(16, 16, 16);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }
}
