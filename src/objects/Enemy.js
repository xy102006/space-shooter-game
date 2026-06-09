import { GAME_WIDTH } from '../constants.js';
import { hpBarWidth } from '../utils/hpBarCalc.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.hp = 1;
    this.maxHp = 1;
    this.speed = 120;
    this.fireRate = 2000;
    this._lastFired = 0;
    this.shootsAt = true;
    this.movePattern = 'straight';
    this._spawnTime = scene.time.now;
    this._hpBar = null;

    this.setDepth(6).setScale(1.2);
    this.body.setSize(36, 36, true);
    this.body.setCollideWorldBounds(false);
  }

  init(config) {
    this._entering = false;
    // Destroy old HP bar if recycling this enemy
    if (this._hpBar) { this._hpBar.destroy(); this._hpBar = null; }

    this.speed = config.speed || this.speed;
    this.fireRate = config.fireRate || this.fireRate;
    this.shootsAt = config.shootsAt !== undefined ? config.shootsAt : this.shootsAt;
    this.movePattern = config.movePattern || this.movePattern;
    this._amplitude = config.amplitude || 60;
    this._frequency = config.frequency || 0.003;
    this._spawnX = this.x;
    this._spawnTime = this.scene.time.now;
    this._lastFired = 0;

    // HP bar for multi-HP enemies (turret has hp:3)
    const configHp = config.hp || 1;
    if (configHp > 1) {
      this._hpBar = this.scene.add.graphics().setDepth(9);
      this._renderHpBar();
    }

    if (this.movePattern === 'flank') {
      this._flankFired = false;
      this._flankDir = (this.x < GAME_WIDTH / 2) ? 1 : -1;
    }

    return this;
  }

  _renderHpBar() {
    if (!this._hpBar) return;
    const w = hpBarWidth(this.hp, this.maxHp, 24);
    this._hpBar.clear();
    this._hpBar.fillStyle(0x330000).fillRect(this.x - 12, this.y - 22, 24, 4);
    this._hpBar.fillStyle(0xff3333).fillRect(this.x - 12, this.y - 22, w, 4);
  }

  updateMovement(time, delta, player) {
    if (this._entering) { this.body.setVelocity(0, 0); return; }
    if (this.movePattern === 'straight') {
      this.body.setVelocity(0, this.speed);
    } else if (this.movePattern === 'sine') {
      const elapsed = time - this._spawnTime;
      this.body.setVelocityX(Math.sin(elapsed * this._frequency) * this._amplitude * 1.5);
      this.body.setVelocityY(this.speed);
    } else if (this.movePattern === 'dive' && player) {
      if (this.y < 200) {
        this.body.setVelocityY(this.speed * 0.5);
      } else {
        this.scene.physics.moveToObject(this, player, this.speed * 1.2);
      }
    } else if (this.movePattern === 'flank') {
      this.body.setVelocity(this._flankDir * this.speed, 0);
      if (!this._flankFired) {
        const crossed = this._flankDir > 0 ? this.x > GAME_WIDTH / 2 : this.x < GAME_WIDTH / 2;
        if (crossed) { this._flankFired = true; this._lastFired = 0; }
      }
      if (this.x < -60 || this.x > GAME_WIDTH + 60) this.disableBody(true, true);
    }
  }

  tryFire(time, player, enemyBulletGroup) {
    if (!this.shootsAt || !player || !enemyBulletGroup) return;
    if (time < this._lastFired + this.fireRate) return;
    this._lastFired = time;

    const bullet = enemyBulletGroup.get();
    if (!bullet) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const speed = 160;
    bullet.fire(this.x, this.y + 10, Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  takeDamage(amount = 1) {
    this.hp -= amount;
    this._renderHpBar();
    this.scene.tweens.add({ targets: this, alpha: 0.2, duration: 60, yoyo: true });
    return this.hp <= 0;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (!this.active && this._hpBar) { this._hpBar.destroy(); this._hpBar = null; }
    if (this.y > this.scene.scale.height + 60) {
      this.disableBody(true, true);
    }
  }
}
