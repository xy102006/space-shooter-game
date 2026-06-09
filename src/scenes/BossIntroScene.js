import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class BossIntroScene extends Phaser.Scene {
  constructor() { super({ key: 'BossIntroScene', active: false }); }

  init(data) {
    this.bossName = data.bossName || 'BOSS';
  }

  create() {
    this.scene.pause('GameScene');

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72);

    const warning = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '!! WARNING !!', {
      font: 'bold 38px monospace', fill: '#ff2222', stroke: '#660000', strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    const name = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, this.bossName, {
      font: 'bold 26px monospace', fill: '#ffaa00', stroke: '#663300', strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);

    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'INCOMING', {
      font: '16px monospace', fill: '#ff6644', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [warning, name, sub], alpha: 1, duration: 300 });

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [overlay, warning, name, sub], alpha: 0, duration: 400,
        onComplete: () => {
          const gs = this.scene.get('GameScene');
          this.scene.resume('GameScene');
          this.scene.stop();
          if (gs) gs.events.emit('bossIntroComplete');
        }
      });
    });
  }
}
