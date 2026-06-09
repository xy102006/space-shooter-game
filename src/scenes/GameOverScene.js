import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    if (this.textures.exists('bg-level1')) {
      this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-level1').setOrigin(0).setAlpha(0.4);
    } else {
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000011).setOrigin(0);
    }

    const cx = GAME_WIDTH / 2;

    // Update high score
    const prev = parseInt(localStorage.getItem('highScore') || '0');
    const isNew = this.finalScore > prev;
    if (isNew) localStorage.setItem('highScore', this.finalScore);

    this.add.text(cx, 180, 'GAME OVER', {
      font: 'bold 52px monospace', fill: '#ff2222',
      stroke: '#660000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(cx, 270, `SCORE: ${this.finalScore}`, {
      font: 'bold 28px monospace', fill: '#ffffff'
    }).setOrigin(0.5);

    if (isNew) {
      this.add.text(cx, 320, 'NEW BEST!', {
        font: 'bold 20px monospace', fill: '#ffcc00'
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, 320, `BEST: ${Math.max(prev, this.finalScore)}`, {
        font: '18px monospace', fill: '#888888'
      }).setOrigin(0.5);
    }

    const btn = this.add.text(cx, 420, '[ PLAY AGAIN ]', {
      font: 'bold 22px monospace', fill: '#44aaff',
      stroke: '#002244', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: btn, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    btn.on('pointerdown', () => this.scene.start('ShipSelectScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('ShipSelectScene'));
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('ShipSelectScene'));

    this.add.text(cx, 490, '[ MAIN MENU ]', {
      font: '16px monospace', fill: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
