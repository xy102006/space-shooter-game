import { GAME_HEIGHT } from '../constants.js';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = 'asteroid';
    this.setDepth(5);
    this.hp = 1;
    this.speed = 100;
  }

  init() {
    this.hp    = Math.random() < 0.5 ? 1 : 2;
    this.speed = 80 + Math.floor(Math.random() * 60);
    this.setAngularVelocity(30 + Math.random() * 60);
    this.body.setVelocity(0, this.speed);
    return this;
  }

  takeDamage(amount = 1) {
    this.hp -= amount;
    return this.hp <= 0;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y > GAME_HEIGHT + 60) this.disableBody(true, true);
  }
}
