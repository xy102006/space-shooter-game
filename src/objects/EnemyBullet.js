export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet-charged');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  fire(x, y, vx, vy) {
    this.enableBody(true, x, y, true, true);
    this.setDepth(5);
    this.setTint(0xff5500).setScale(1.0);
    this.setVelocity(vx, vy);
    this.setRotation(Math.atan2(vy, vx) + Math.PI / 2);
    if (this.scene.anims.exists('charged-anim')) this.play('charged-anim');
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    const h = this.scene.scale.height;
    const w = this.scene.scale.width;
    if (this.y > h + 20 || this.y < -20 || this.x < -20 || this.x > w + 20) {
      this.disableBody(true, true);
    }
  }
}
