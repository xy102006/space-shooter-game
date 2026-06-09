export const POWERUP_TYPES = ['double', 'spread', 'shield', 'speed', 'bomb'];

export default class Powerup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const tex = scene.textures.exists(`powerup-${type}`) ? `powerup-${type}` : 'powerup-double';
    super(scene, x, y, tex);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerupType = type;
    this.setDepth(7).setScale(1.5);
    this.body.allowGravity = false;
    this.body.setVelocity(0, 55);
    this.body.setSize(44, 44, true);

    // Subtle glow pulse
    scene.tweens.add({
      targets: this, alpha: 0.55, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.y > this.scene.scale.height + 40) {
      this.disableBody(true, true);
    }
  }
}
