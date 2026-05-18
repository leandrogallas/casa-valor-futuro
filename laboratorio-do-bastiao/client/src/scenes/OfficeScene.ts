import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { conectarOffice, enviarMovimento, enviarChat, REST_URL } from '../net/colyseusClient.js';
import { OfficeState, JogadorState } from '../schema/OfficeState.js';
import { ChatOverlay } from '../ui/ChatOverlay.js';
import { TaskBoardOverlay } from '../ui/TaskBoardOverlay.js';
import { calcularVelocidade, aplicarMovimento } from '../logic/movement.js';
import { detectarSala, nomeSala, SALAS } from '../logic/zones.js';
import { FRAME_W, FRAME_H } from './PreloadScene.js';
import type { UsuarioAuth } from '../net/colyseusClient.js';

const WORLD_W = 1280;
const WORLD_H = 1760;
const PLAYER_SPEED = 320;
const MOVE_SEND_INTERVAL = 80; // ms
const CAMERA_ZOOM = 1.5;

// Idle frame index per direction (first frame of each animation row)
const IDLE_FRAME: Record<string, number> = { down: 0, left: 4, right: 8, up: 12 };

const LIMITES = { minX: FRAME_W / 2, maxX: WORLD_W - FRAME_W / 2, minY: FRAME_H / 2, maxY: WORLD_H - FRAME_H / 2 };

// Cores de destaque por sala
const COR_SALA: Record<string, number> = {
  meeting1:  0x378ADD,
  meeting2:  0x378ADD,
  executive: 0x7B4A4A,
  marketing: 0xD85A30,
  copy:      0xBA7517,
  research:  0x639922,
  growth:    0x378ADD,
  finance:   0x854F0B,
  kitchen:   0x5A5258,
  lounge:    0x7F77DD,
  reception: 0x8B6F47,
};

export class OfficeScene extends Phaser.Scene {
  static readonly key = 'OfficeScene';

  private room!: Room<OfficeState>;
  private playerX = 640;
  private playerY = 1400;
  private playerSessionId = '';
  private usuario!: UsuarioAuth;
  private direcao: string = 'down';
  private movendo = false;

  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerLabel!: Phaser.GameObjects.Text;
  private playerRing!: Phaser.GameObjects.Arc;
  private outrosJogadores = new Map<string, {
    sprite: Phaser.GameObjects.Sprite;
    label: Phaser.GameObjects.Text;
    ring: Phaser.GameObjects.Arc;
  }>();

  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private tempoUltimoEnvio = 0;
  private salaAtual = 'reception';

  private chat!: ChatOverlay;
  private taskBoard!: TaskBoardOverlay;
  private token = '';

  constructor() {
    super({ key: OfficeScene.key });
  }

  init(data: { token: string; usuario: UsuarioAuth }): void {
    this.usuario = data.usuario;
    this.token = data.token;
    conectarOffice(data.token, data.usuario.nome).then((room) => {
      this.room = room;
      this.playerSessionId = room.sessionId;
      this.configurarColyseus();
    }).catch((err) => {
      console.error('[OfficeScene] falha ao conectar:', err);
    });
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setZoom(CAMERA_ZOOM);
    this.cameras.main.setBackgroundColor(0x0d0e12);

    this.desenharMapa();

    this.playerRing = this.add.circle(this.playerX, this.playerY, FRAME_W * 0.55, 0x97C459, 0.35).setDepth(9);
    this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'avatar-human', 0).setDepth(10);
    this.playerLabel = this.add
      .text(this.playerX, this.playerY - FRAME_H * 0.7, this.usuario?.nome ?? '?', {
        fontSize: '10px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#00000066', padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.08);

    this.configurarMinimap();
    this.configurarInput();

    this.chat = new ChatOverlay((texto, salaId) => enviarChat(texto, salaId));
    this.chat.setSala(this.salaAtual);

    this.taskBoard = new TaskBoardOverlay(REST_URL, this.token, this.usuario.id);
  }

  update(_time: number, delta: number): void {
    if (!this.wasd) return;

    const keys = {
      up:    this.wasd.up.isDown    || this.cursors.up.isDown,
      down:  this.wasd.down.isDown  || this.cursors.down.isDown,
      left:  this.wasd.left.isDown  || this.cursors.left.isDown,
      right: this.wasd.right.isDown || this.cursors.right.isDown,
    };

    const { vx, vy } = calcularVelocidade(keys, PLAYER_SPEED);
    const movendo = vx !== 0 || vy !== 0;

    if (movendo) {
      const pos = aplicarMovimento(this.playerX, this.playerY, vx, vy, delta, LIMITES);
      this.playerX = pos.x;
      this.playerY = pos.y;

      if (vy > 0) this.direcao = 'down';
      else if (vy < 0) this.direcao = 'up';
      else if (vx > 0) this.direcao = 'right';
      else this.direcao = 'left';
    }

    if (movendo !== this.movendo || movendo) {
      if (movendo) {
        this.playerSprite.anims.play(`walk-${this.direcao}`, true);
      } else {
        this.playerSprite.anims.stop();
        this.playerSprite.setFrame(IDLE_FRAME[this.direcao] ?? 0);
      }
      this.movendo = movendo;
    }

    this.playerSprite.setPosition(this.playerX, this.playerY);
    this.playerLabel.setPosition(this.playerX, this.playerY - FRAME_H * 0.7);
    this.playerRing.setPosition(this.playerX, this.playerY);

    const novaSala = detectarSala(this.playerX, this.playerY);
    if (novaSala !== this.salaAtual) {
      this.salaAtual = novaSala;
      this.chat.setSala(nomeSala(novaSala));
    }

    this.tempoUltimoEnvio += delta;
    if (movendo && this.tempoUltimoEnvio >= MOVE_SEND_INTERVAL) {
      enviarMovimento(Math.round(this.playerX), Math.round(this.playerY), this.direcao);
      this.tempoUltimoEnvio = 0;
    }
  }

  shutdown(): void {
    this.chat?.destroy();
    this.taskBoard?.destroy();
  }

  private configurarColyseus(): void {
    const jogadores = this.room.state.jogadores as unknown as {
      onAdd: (cb: (item: JogadorState, key: string) => void) => void;
      onRemove: (cb: (item: JogadorState, key: string) => void) => void;
    };

    jogadores.onAdd((jogador, sessionId) => {
      if (sessionId === this.playerSessionId) return;
      this.adicionarOutroJogador(sessionId, jogador);

      const j = jogador as unknown as {
        listen: (prop: string, cb: (val: number | string) => void) => void;
      };
      j.listen('x', (val) => {
        const obj = this.outrosJogadores.get(sessionId);
        if (obj) { obj.sprite.setX(val as number); obj.ring.setX(val as number); obj.label.setX(val as number); }
      });
      j.listen('y', (val) => {
        const obj = this.outrosJogadores.get(sessionId);
        if (obj) { obj.sprite.setY(val as number); obj.ring.setY(val as number); obj.label.setY((val as number) - FRAME_H * 0.7); }
      });
      j.listen('direcao', (val) => {
        const obj = this.outrosJogadores.get(sessionId);
        if (obj) obj.sprite.setFrame(IDLE_FRAME[val as string] ?? 0);
      });
    });

    jogadores.onRemove((_jogador, sessionId) => {
      const obj = this.outrosJogadores.get(sessionId);
      if (obj) {
        obj.sprite.destroy();
        obj.label.destroy();
        obj.ring.destroy();
        this.outrosJogadores.delete(sessionId);
      }
    });

    this.room.onMessage('chat', (msg: { autorId: string; autorNome: string; texto: string; salaId: string }) => {
      this.chat.adicionarMensagem({ ...msg, timestamp: Date.now() });
    });
  }

  private adicionarOutroJogador(sessionId: string, jogador: JogadorState): void {
    const ring = this.add.circle(jogador.x, jogador.y, FRAME_W * 0.55, 0x51cf66, 0.3).setDepth(9);
    const sprite = this.add.sprite(jogador.x, jogador.y, 'avatar-human', 0).setDepth(10);
    const label = this.add
      .text(jogador.x, jogador.y - FRAME_H * 0.7, jogador.nome, {
        fontSize: '10px', color: '#cccccc', stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#00000066', padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(11);
    this.outrosJogadores.set(sessionId, { sprite, label, ring });
  }

  private desenharMapa(): void {
    // Mapa pixel-art como fundo
    this.add.image(WORLD_W / 2, WORLD_H / 2, 'map-bg').setDepth(0);

    // Overlay semitransparente com nome de cada zona
    const g = this.add.graphics().setDepth(1).setAlpha(0.08);
    for (const sala of SALAS) {
      const cor = COR_SALA[sala.id] ?? 0x333333;
      g.fillStyle(cor, 1);
      g.fillRect(sala.x, sala.y, sala.w, sala.h);
    }

    // Labels de salas (visíveis ao longe)
    for (const sala of SALAS) {
      this.add.text(sala.x + sala.w / 2, sala.y + 14, sala.nome, {
        fontSize: '9px', color: '#ffffff99', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(2);
    }
  }

  private configurarMinimap(): void {
    const mmW = 160;
    const mmH = Math.round(mmW * WORLD_H / WORLD_W); // proporcional ao mapa
    const padding = 8;
    const mmX = this.scale.width - mmW - padding;
    const mmY = padding;
    const zoom = mmW / WORLD_W;

    const minimap = this.cameras.add(mmX, mmY, mmW, mmH);
    minimap.setZoom(zoom);
    minimap.setBounds(0, 0, WORLD_W, WORLD_H);
    minimap.setBackgroundColor(0x0d0e12);
    minimap.startFollow(this.playerSprite, false, 0, 0);
    minimap.setAlpha(0.9);

    const border = this.add.graphics();
    border.lineStyle(1, 0x4dabf7, 0.7);
    border.strokeRect(mmX, mmY, mmW, mmH);
    border.setScrollFactor(0).setDepth(100);
  }

  private configurarInput(): void {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.T).on('down', () => this.taskBoard?.toggle());
  }
}
