import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { conectarOffice, enviarMovimento, enviarChat, REST_URL } from '../net/colyseusClient.js';
import { OfficeState, JogadorState } from '../schema/OfficeState.js';
import { ChatOverlay } from '../ui/ChatOverlay.js';
import { TaskBoardOverlay } from '../ui/TaskBoardOverlay.js';
import { calcularVelocidade, aplicarMovimento } from '../logic/movement.js';
import type { UsuarioAuth } from '../net/colyseusClient.js';

const WORLD_W = 800;
const WORLD_H = 800;
const PLAYER_SPEED = 200;
const MOVE_SEND_INTERVAL = 80; // ms entre envios de posição ao servidor

interface ZonaSala {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cor: number;
}

const SALAS: ZonaSala[] = [
  { id: 'recepcao',   nome: 'Recepção',   x: 0,   y: 0,   w: 800, h: 220, cor: 0x1e3a5f },
  { id: 'marketing',  nome: 'Marketing',  x: 0,   y: 220, w: 400, h: 280, cor: 0x1e5f3a },
  { id: 'financeiro', nome: 'Financeiro', x: 400, y: 220, w: 400, h: 280, cor: 0x5f3a1e },
  { id: 'reuniao',    nome: 'Reunião',    x: 0,   y: 500, w: 800, h: 300, cor: 0x3a1e5f },
];

const LIMITES = { minX: 16, maxX: WORLD_W - 16, minY: 16, maxY: WORLD_H - 16 };

export class OfficeScene extends Phaser.Scene {
  static readonly key = 'OfficeScene';

  private room!: Room<OfficeState>;
  private playerX = 400;
  private playerY = 100;
  private playerSessionId = '';
  private usuario!: UsuarioAuth;

  private playerSprite!: Phaser.GameObjects.Image;
  private playerLabel!: Phaser.GameObjects.Text;
  private outrosJogadores = new Map<string, { sprite: Phaser.GameObjects.Image; label: Phaser.GameObjects.Text }>();

  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private tempoUltimoEnvio = 0;
  private salaAtual = 'recepcao';

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
    this.cameras.main.setBackgroundColor(0x0d0e12);

    this.desenharMapa();

    this.playerSprite = this.add.image(this.playerX, this.playerY, 'avatar-self').setDepth(10);
    this.playerLabel = this.add
      .text(this.playerX, this.playerY - 24, this.usuario?.nome ?? '?', {
        fontSize: '11px', color: '#ffffff', stroke: '#000000', strokeThickness: 2,
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

    if (vx !== 0 || vy !== 0) {
      const pos = aplicarMovimento(this.playerX, this.playerY, vx, vy, delta, LIMITES);
      this.playerX = pos.x;
      this.playerY = pos.y;
    }

    this.playerSprite.setPosition(this.playerX, this.playerY);
    this.playerLabel.setPosition(this.playerX, this.playerY - 24);

    const novaSala = this.detectarSala(this.playerX, this.playerY);
    if (novaSala !== this.salaAtual) {
      this.salaAtual = novaSala;
      this.chat.setSala(novaSala);
    }

    this.tempoUltimoEnvio += delta;
    if ((vx !== 0 || vy !== 0) && this.tempoUltimoEnvio >= MOVE_SEND_INTERVAL) {
      enviarMovimento(Math.round(this.playerX), Math.round(this.playerY));
      this.tempoUltimoEnvio = 0;
    }
  }

  shutdown(): void {
    this.chat?.destroy();
    this.taskBoard?.destroy();
  }

  private configurarColyseus(): void {
    // Usa any para compatibilidade com @colyseus/schema v3 callbacks
    const jogadores = this.room.state.jogadores as unknown as {
      onAdd: (cb: (item: JogadorState, key: string) => void) => void;
      onRemove: (cb: (item: JogadorState, key: string) => void) => void;
    };

    jogadores.onAdd((jogador, sessionId) => {
      if (sessionId === this.playerSessionId) return;
      this.adicionarOutroJogador(sessionId, jogador);

      const schemaJogador = jogador as unknown as {
        listen: (prop: string, cb: (val: number) => void) => void;
      };
      schemaJogador.listen('x', (val) => {
        this.outrosJogadores.get(sessionId)?.sprite.setX(val);
        this.outrosJogadores.get(sessionId)?.label.setX(val);
      });
      schemaJogador.listen('y', (val) => {
        this.outrosJogadores.get(sessionId)?.sprite.setY(val);
        this.outrosJogadores.get(sessionId)?.label.setY(val - 24);
      });
    });

    jogadores.onRemove((_jogador, sessionId) => {
      const obj = this.outrosJogadores.get(sessionId);
      if (obj) {
        obj.sprite.destroy();
        obj.label.destroy();
        this.outrosJogadores.delete(sessionId);
      }
    });

    this.room.onMessage('chat', (msg: { autorId: string; autorNome: string; texto: string; salaId: string }) => {
      this.chat.adicionarMensagem({ ...msg, timestamp: Date.now() });
    });
  }

  private adicionarOutroJogador(sessionId: string, jogador: JogadorState): void {
    const textureKey = 'avatar-outro';
    const sprite = this.add.image(jogador.x, jogador.y, textureKey).setDepth(10);
    const label = this.add
      .text(jogador.x, jogador.y - 24, jogador.nome, {
        fontSize: '11px', color: '#cccccc', stroke: '#000000', strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(11);
    this.outrosJogadores.set(sessionId, { sprite, label });
  }

  private desenharMapa(): void {
    const g = this.add.graphics();
    for (const sala of SALAS) {
      g.fillStyle(sala.cor, 1);
      g.fillRect(sala.x, sala.y, sala.w, sala.h);
      g.lineStyle(2, 0x2a2a4a, 1);
      g.strokeRect(sala.x, sala.y, sala.w, sala.h);

      this.add.text(sala.x + sala.w / 2, sala.y + 16, sala.nome, {
        fontSize: '13px', color: '#aaaacc', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);
    }
  }

  private configurarMinimap(): void {
    const mmW = 150;
    const mmH = 100;
    const mmX = this.scale.width - mmW - 8;
    const mmY = 8;
    const zoom = mmW / WORLD_W;

    const minimap = this.cameras.add(mmX, mmY, mmW, mmH);
    minimap.setZoom(zoom);
    minimap.setBounds(0, 0, WORLD_W, WORLD_H);
    minimap.setBackgroundColor(0x111122);
    minimap.startFollow(this.playerSprite, true, 0, 0);
    minimap.setAlpha(0.85);

    const border = this.add.graphics();
    border.lineStyle(1, 0x4dabf7, 0.8);
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

  private detectarSala(x: number, y: number): string {
    for (const sala of SALAS) {
      if (x >= sala.x && x < sala.x + sala.w && y >= sala.y && y < sala.y + sala.h) {
        return sala.id;
      }
    }
    return this.salaAtual;
  }
}
