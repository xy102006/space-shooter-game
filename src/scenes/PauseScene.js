import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  create() {
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setDepth(0);

    this.add.text(cx, cy - 60, 'PAUSED', {
      font: 'bold 48px monospace', fill: '#ffffff',
      stroke: '#004488', strokeThickness: 5
    }).setOrigin(0.5).setDepth(1);

    const resume = this.add.text(cx, cy + 20, '[ P  —  RESUME ]', {
      font: 'bold 20px monospace', fill: '#44aaff',
      stroke: '#001133', strokeThickness: 3
    }).setOrigin(0.5).setDepth(1).setInteractive({ useHandCursor: true });

    const menu = this.add.text(cx, cy + 65, '[ M  —  MAIN MENU ]', {
      font: '16px monospace', fill: '#aaaaaa',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(1).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: resume, alpha: 0.4, duration: 550, yoyo: true, repeat: -1 });

    const doResume = () => {
      this.input.keyboard.off('keydown-P', doResume);
      this.input.keyboard.off('keydown-ESC', doResume);
      this.input.keyboard.off('keydown-M', doMenu);
      this.scene.resume('GameScene');
      this.scene.resume('HUDScene');
      this.scene.stop();
    };

    const doMenu = () => {
      this.input.keyboard.off('keydown-P', doResume);
      this.input.keyboard.off('keydown-ESC', doResume);
      this.input.keyboard.off('keydown-M', doMenu);
      this.scene.stop('GameScene');
      this.scene.stop('HUDScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    };

    resume.on('pointerdown', doResume);
    menu.on('pointerdown',   doMenu);
    this.input.keyboard.on('keydown-P', doResume);
    this.input.keyboard.on('keydown-ESC', doResume);
    this.input.keyboard.on('keydown-M', doMenu);
  }
}
