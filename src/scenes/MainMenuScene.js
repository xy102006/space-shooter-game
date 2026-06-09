import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() { super('MainMenuScene'); }

  create() {
    // Scrolling background
    if (this.textures.exists('bg-level1')) {
      this._bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-level1').setOrigin(0);
    } else {
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000011).setOrigin(0);
    }

    const cx = GAME_WIDTH / 2;

    // Title
    this.add.text(cx, 160, 'WARPED', {
      font: 'bold 64px monospace',
      fill: '#44aaff',
      stroke: '#0033aa',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, 230, 'SPACE SHOOTER', {
      font: 'bold 24px monospace',
      fill: '#aaddff',
      stroke: '#003366',
      strokeThickness: 3
    }).setOrigin(0.5);

    // High score
    const hs = localStorage.getItem('highScore') || 0;
    this.add.text(cx, 290, `BEST: ${hs}`, {
      font: '16px monospace', fill: '#888888'
    }).setOrigin(0.5);

    // Start button
    const startBtn = this.add.text(cx, 380, '[ PRESS ENTER TO START ]', {
      font: 'bold 20px monospace',
      fill: '#ffffff',
      stroke: '#004488',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Blink
    this.tweens.add({ targets: startBtn, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    startBtn.on('pointerdown', () => this.scene.start('ShipSelectScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('ShipSelectScene'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('ShipSelectScene'));

    this.add.text(cx, GAME_HEIGHT - 30, 'ARROW KEYS / WASD — MOVE   |   SPACE — FIRE   |   X — BOMB', {
      font: '11px monospace', fill: '#556677'
    }).setOrigin(0.5);
  }

  update() {
    if (this._bg) this._bg.tilePositionY -= 0.4;
  }
}
