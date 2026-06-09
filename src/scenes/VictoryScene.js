import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }

  init(data) {
    this.finalScore = data.score      || 0;
    this.level      = data.level      || 1;
    this.gameWon    = data.gameWon    || false;
    this.lives      = data.lives      || 3;
    this.bombs      = data.bombs      || 0;
    this.difficulty = data.difficulty || 'normal';
    this.shipConfig = data.shipConfig || null;
  }

  create() {
    // Animated background using current or next level background
    const bgKey = this.gameWon ? 'bg-level3-0' : `bg-level${this.level}`;
    const bg = this.textures.exists(bgKey) ? bgKey : 'bg-level1';
    this._bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, bg).setOrigin(0).setAlpha(0.6);

    const cx = GAME_WIDTH / 2;

    // Title
    const title = this.gameWon ? 'YOU WIN!' : 'LEVEL CLEAR!';
    const color = this.gameWon ? '#ffcc00' : '#44ff88';
    const stroke = this.gameWon ? '#664400' : '#004422';

    this.add.text(cx, 165, title, {
      font: 'bold 48px monospace', fill: color, stroke, strokeThickness: 5
    }).setOrigin(0.5);

    // Score
    this.add.text(cx, 255, `SCORE: ${this.finalScore}`, {
      font: 'bold 26px monospace', fill: '#ffffff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);

    // High score
    const prev = parseInt(localStorage.getItem('highScore') || '0');
    if (this.finalScore > prev) {
      localStorage.setItem('highScore', this.finalScore);
      this.add.text(cx, 300, 'NEW HIGH SCORE!', {
        font: 'bold 18px monospace', fill: '#ffcc00', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, 300, `BEST: ${prev}`, {
        font: '15px monospace', fill: '#888888'
      }).setOrigin(0.5);
    }

    if (this.gameWon) {
      this.add.text(cx, 355, 'All three sectors cleared.\nThe galaxy is safe.', {
        font: '14px monospace', fill: '#aaddff', align: 'center'
      }).setOrigin(0.5);
    } else {
      this.add.text(cx, 355, `LEVEL ${this.level + 1} AWAITS`, {
        font: '16px monospace', fill: '#88ccff', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5);
    }

    // Action button
    const nextLabel = this.gameWon ? '[ MAIN MENU ]' : '[ NEXT LEVEL ]';
    const btn = this.add.text(cx, 430, nextLabel, {
      font: 'bold 22px monospace', fill: '#44aaff', stroke: '#002244', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: btn, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    const goNext = () => {
      if (this.gameWon) {
        this.scene.start('MainMenuScene');
      } else {
        // Carry score, lives, bombs, difficulty, and ship into next level
        // (GameScene.create() launches HUDScene itself — don't double-launch)
        this.scene.start('GameScene', {
          level:      this.level + 1,
          score:      this.finalScore,
          lives:      this.lives,
          bombs:      this.bombs,
          difficulty: this.difficulty,
          shipConfig: this.shipConfig
        });
      }
    };

    btn.on('pointerdown', goNext);
    this.input.keyboard.once('keydown-ENTER', goNext);

    // Menu link
    const menuBtn = this.add.text(cx, 475, '[ M — MAIN MENU ]', {
      font: '15px monospace', fill: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));
    this.input.keyboard.once('keydown-M', () => this.scene.start('MainMenuScene'));
  }

  update() {
    if (this._bg) this._bg.tilePositionY -= 0.5;
  }
}
