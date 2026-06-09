export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet-bolt');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false).setVisible(false);
  }

  fire(x, y, speed, weaponMode = 'single', angle = -90) {
    this.enableBody(true, x, y, true, true);
    this.setDepth(9);

    // Visual tint by weapon mode
    if (weaponMode === 'double') { this.setTint(0x4488ff).setScale(1.0); }
    else if (weaponMode === 'spread') { this.setTint(0xff88ff).setScale(0.9); }
    else if (weaponMode === 'burst') { this.setTint(0xffff00).setScale(1.1); }
    else if (weaponMode === 'wide') { this.setTint(0x44ff88).setScale(0.85); }
    else { this.setTint(0x88ffff).setScale(1.0); }

    if (this.scene.anims.exists('bolt-anim')) {
      this.play('bolt-anim');
    }

    const rad = Phaser.Math.DegToRad(angle);
    this.setVelocity(Math.cos(rad) * speed, Math.sin(rad) * speed);
    this.setRotation(rad);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y < -20 || this.y > this.scene.scale.height + 20 ||
        this.x < -20 || this.x > this.scene.scale.width + 20) {
      this.disableBody(true, true);
    }
  }
}
