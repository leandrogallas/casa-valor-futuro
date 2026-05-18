import Phaser from 'phaser';

export const FRAME_W = 64;
export const FRAME_H = 96;
export const SITTING_FRAME_W = 64;
export const SITTING_FRAME_H = 128;

const DIRS = ['down', 'left', 'right', 'up'] as const;

export class PreloadScene extends Phaser.Scene {
  static readonly key = 'PreloadScene';

  constructor() {
    super({ key: PreloadScene.key });
  }

  preload(): void {
    const { width, height } = this.scale;

    const bar = this.add.graphics();
    const onProgress = (v: number) => {
      bar.clear();
      bar.fillStyle(0x1a1a2e, 1);
      bar.fillRect(width / 4, height / 2 - 10, width / 2, 20);
      bar.fillStyle(0x4dabf7, 1);
      bar.fillRect(width / 4, height / 2 - 10, (width / 2) * v, 20);
    };
    this.load.on('progress', onProgress);

    this.load.spritesheet('avatar-human', 'assets/sprites/avatar-human.png', {
      frameWidth: FRAME_W, frameHeight: FRAME_H,
    });
    this.load.spritesheet('agent-skins', 'assets/sprites/agent-skins.png', {
      frameWidth: FRAME_W, frameHeight: FRAME_H,
    });
    this.load.spritesheet('avatars-sitting', 'assets/sprites/avatars-sitting.png', {
      frameWidth: SITTING_FRAME_W, frameHeight: SITTING_FRAME_H,
    });
  }

  create(): void {
    DIRS.forEach((dir, i) => {
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers('avatar-human', { start: i * 4, end: i * 4 + 3 }),
        frameRate: 8,
        repeat: -1,
      });
    });

    this.scene.start('LoginScene');
  }
}
