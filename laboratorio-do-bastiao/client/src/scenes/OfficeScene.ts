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

// Canvas 960×600 @ zoom 0.75 → viewport 1280×800 = world inteiro visível
const WORLD_W = 1280;
const WORLD_H = 800;
const CAMERA_ZOOM = 0.7;
const PLAYER_SPEED = 260;
const MOVE_SEND_INTERVAL = 80;

const IDLE_FRAME: Record<string, number> = { down: 0, left: 4, right: 8, up: 12 };

// frame offset per skin in agent-skins spritesheet (4 rows × 4 frames per skin block)
const SKIN_OFFSETS: Record<string, number> = {
  'agent-pink':     0,
  'agent-orange':  16,
  'agent-green':   32,
  'agent-blue':    48,
  'agent-gold':    64,
  'agent-burgundy': 80,
};

const LIMITES = {
  minX: FRAME_W / 2,
  maxX: WORLD_W - FRAME_W / 2,
  minY: FRAME_H / 2,
  maxY: WORLD_H - FRAME_H / 2,
};

// Spawn no centro da Recepção (col 1, y=260..800)
const SPAWN = { x: 197, y: 530 };

// Tint sutil por sala (sem cobrir o mapa real)
const TINT_SALA: Record<string, number> = {
  meeting1:  0x378ADD,
  meeting2:  0x4a9de0,
  executive: 0x7B4A4A,
  marketing: 0xD85A30,
  copy:      0xBA7517,
  research:  0x639922,
  growth:    0x2980b9,
  finance:   0x854F0B,
  kitchen:   0x5A5258,
  lounge:    0x7F77DD,
  reception: 0x8B6F47,
};

export class OfficeScene extends Phaser.Scene {
  static readonly key = 'OfficeScene';

  private room!: Room<OfficeState>;
  private playerX = SPAWN.x;
  private playerY = SPAWN.y;
  private playerSessionId = '';
  private usuario!: UsuarioAuth;
  private direcao = 'down';
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
    this.playerX = SPAWN.x;
    this.playerY = SPAWN.y;
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
    this.cameras.main.setBackgroundColor(0x090a10);

    this.desenharMapa();

    this.playerRing = this.add.circle(this.playerX, this.playerY, FRAME_W * 0.55, 0x97C459, 0.35).setDepth(9);
    this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'avatar-human', 0).setDepth(10);
    this.playerLabel = this.add
      .text(this.playerX, this.playerY - FRAME_H * 0.65, this.usuario?.nome ?? '?', {
        fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#00000077', padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);

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

      if      (vy > 0) this.direcao = 'down';
      else if (vy < 0) this.direcao = 'up';
      else if (vx > 0) this.direcao = 'right';
      else              this.direcao = 'left';
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
    this.playerLabel.setPosition(this.playerX, this.playerY - FRAME_H * 0.65);
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
      forEach: (cb: (item: JogadorState, key: string) => void) => void;
    };

    // Render players already in the room at join time (onAdd doesn't fire retroactively)
    jogadores.forEach((jogador, sessionId) => {
      if (sessionId === this.playerSessionId) return;
      this.adicionarOutroJogador(sessionId, jogador);
      this.configurarListenersJogador(sessionId, jogador);
    });

    jogadores.onAdd((jogador, sessionId) => {
      if (sessionId === this.playerSessionId) return;
      if (this.outrosJogadores.has(sessionId)) return;
      this.adicionarOutroJogador(sessionId, jogador);
      this.configurarListenersJogador(sessionId, jogador);
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

  private configurarListenersJogador(sessionId: string, jogador: JogadorState): void {
    const j = jogador as unknown as {
      listen: (prop: string, cb: (val: number | string) => void) => void;
    };
    j.listen('x', (val) => {
      const obj = this.outrosJogadores.get(sessionId);
      if (obj) { obj.sprite.setX(val as number); obj.ring.setX(val as number); obj.label.setX(val as number); }
    });
    j.listen('y', (val) => {
      const obj = this.outrosJogadores.get(sessionId);
      if (obj) { obj.sprite.setY(val as number); obj.ring.setY(val as number); obj.label.setY((val as number) - FRAME_H * 0.65); }
    });
    j.listen('direcao', (val) => {
      const obj = this.outrosJogadores.get(sessionId);
      if (!obj) return;
      const dirFrame = IDLE_FRAME[val as string] ?? 0;
      const skinOffset = jogador.tipo === 'agent' ? (SKIN_OFFSETS[jogador.skinId] ?? 0) : 0;
      obj.sprite.setFrame(skinOffset + dirFrame);
    });
  }

  private adicionarOutroJogador(sessionId: string, jogador: JogadorState): void {
    const isAgent = jogador.tipo === 'agent';
    const ringColor = isAgent ? 0x00D4FF : 0x51cf66;
    const ring = this.add.circle(jogador.x, jogador.y, FRAME_W * 0.55, ringColor, 0.3).setDepth(9);

    let sprite: Phaser.GameObjects.Sprite;
    if (isAgent) {
      const offset = SKIN_OFFSETS[jogador.skinId] ?? 0;
      sprite = this.add.sprite(jogador.x, jogador.y, 'agent-skins', offset).setDepth(10);
    } else {
      sprite = this.add.sprite(jogador.x, jogador.y, 'avatar-human', 0).setDepth(10);
    }

    const labelColor = isAgent ? '#00D4FF' : '#cccccc';
    const label = this.add
      .text(jogador.x, jogador.y - FRAME_H * 0.65, jogador.nome, {
        fontSize: '11px', color: labelColor, stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#00000077', padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(11);
    this.outrosJogadores.set(sessionId, { sprite, label, ring });
  }

  private desenharMapa(): void {
    // Fundo: mapa pixel-art landscape (SVG portrait rotacionado 90° CW)
    this.add.image(WORLD_W / 2, WORLD_H / 2, 'map-bg').setDepth(0);

    // Overlay bem sutil: só para demarcar salas visualmente
    const g = this.add.graphics().setDepth(1).setAlpha(0.07);
    for (const sala of SALAS) {
      const cor = TINT_SALA[sala.id] ?? 0x334455;
      g.fillStyle(cor, 1);
      g.fillRect(sala.x + 4, sala.y + 4, sala.w - 8, sala.h - 8);
    }

    // Nomes das salas com sombra
    for (const sala of SALAS) {
      this.add.text(sala.x + sala.w / 2, sala.y + 18, sala.nome, {
        fontSize: '11px', color: '#ffffffdd', fontStyle: 'bold',
        stroke: '#000000bb', strokeThickness: 4,
      }).setOrigin(0.5).setDepth(2);
    }
  }

  private configurarMinimap(): void {
    const mmW = 160;
    const mmH = Math.round(mmW * WORLD_H / WORLD_W); // 100
    const padding = 8;
    const mmX = this.scale.width - mmW - padding;
    const mmY = padding;

    const minimap = this.cameras.add(mmX, mmY, mmW, mmH);
    minimap.setZoom(mmW / WORLD_W);
    minimap.setBounds(0, 0, WORLD_W, WORLD_H);
    minimap.setBackgroundColor(0x090a10);
    minimap.startFollow(this.playerSprite, false, 0, 0);
    minimap.setAlpha(0.88);

    const border = this.add.graphics();
    border.lineStyle(1, 0x4dabf7, 0.6);
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
