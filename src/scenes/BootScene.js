export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('loading-bg', 'assets/backgrounds/bg-level1.png');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
