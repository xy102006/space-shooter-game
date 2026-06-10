import { PLAYER_MAX_HP } from '../constants.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { computeKnockback } from '../utils/knockbackCalc.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, shipConfig) {
    super(scene, x, y, shipConfig.textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.shipConfig = shipConfig;
    this.speed = shipConfig.speed;
    this.fireRate = shipConfig.fireRate;
    this.weaponMode = shipConfig.startingWeapon;
    this.bulletSpeed = shipConfig.bulletSpeed;
    this.bombs = shipConfig.startingBombs;
    this.shieldActive = false;
    this.invincible = false;
    this.dead = false;
    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this._justLostLife = false;
    this._lastFired = 0;
    this._blinkTimer  = null;
    this._iFrameTimer = null;
    this._thrustEmitter = null;

    this.setDepth(8);
    this.setScale(1.5);
    // Sprites are 48x48; hitbox centered in the frame
    const hr = shipConfig.hitboxRadius;
    this.body.setCircle(hr, 24 - hr, 24 - hr);
    this.body.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = {
      up:    scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    this.fireKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bombKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Thrust image (plain image, tinted cyan, displayed behind player)
    const thrustKey = shipConfig.thrustKey;
    if (thrustKey && scene.textures.exists(thrustKey)) {
      this._thrust = scene.add.image(x, y + 28, thrustKey).setScale(2).setDepth(7).setTint(0x44ccff);
    }

    // Thrust particle emitter
    this._thrustEmitter = scene.add.particles(x, y + 22, 'particle-dot', {
      speed:    { min: 20, max: 55 },
      angle:    { min: 85, max: 95 },
      scale:    { start: 0.9, end: 0 },
      alpha:    { start: 0.6, end: 0 },
      tint:     [0x44ccff, 0x0088ff, 0xffffff],
      lifespan: 280,
      frequency: 35,
      quantity:  2,
      depth:     7
    }).startFollow(this, 0, 22);

    // Play idle anim
    const idleAnim = `${shipConfig.textureKey}-idle`;
    if (scene.anims.exists(idleAnim)) this.play(idleAnim);

    // Shield visual
    this._shieldGraphic = scene.add.graphics().setDepth(8);

    if (scene.anims.exists(`${shipConfig.textureKey}-idle`)) {
      this.play(`${shipConfig.textureKey}-idle`);
    }
  }

  update(time, delta, bulletGroup) {
    if (this.dead) return;

    const body = this.body;
    body.setVelocity(0);

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up    = this.cursors.up.isDown    || this.wasd.up.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.down.isDown;

    const touchVX = this._touchVelX || 0;
    const touchVY = this._touchVelY || 0;

    if (touchVX !== 0 || touchVY !== 0) {
      body.setVelocity(touchVX, touchVY);
    } else {
      if (left)  body.setVelocityX(-this.speed);
      if (right) body.setVelocityX(this.speed);
      if (up)    body.setVelocityY(-this.speed);
      if (down)  body.setVelocityY(this.speed);
      if ((left || right) && (up || down)) {
        body.velocity.normalize().scale(this.speed);
      }
    }

    // Clamp to screen
    this.x = Phaser.Math.Clamp(this.x, 20, GAME_WIDTH - 20);
    this.y = Phaser.Math.Clamp(this.y, 40, GAME_HEIGHT - 40);

    // Update thrust position
    if (this._thrust) {
      this._thrust.setPosition(this.x, this.y + 18);
      this._thrust.setVisible(up || (!down && !left && !right));
    }

    // Shield graphic
    if (this.shieldActive) {
      this._shieldGraphic.clear();
      this._shieldGraphic.lineStyle(2, 0x44ffff, 0.8);
      this._shieldGraphic.strokeCircle(this.x, this.y, 26);
    } else {
      this._shieldGraphic.clear();
    }

    // Shooting
    const isTouchDevice = this.scene.sys.game.device.input.touch;
    if ((this.fireKey.isDown || (isTouchDevice && this._autoFire)) && time > this._lastFired + this.fireRate) {
      this._shoot(bulletGroup);
      this._lastFired = time;
    }
  }

  _shoot(bulletGroup) {
    const sfx = this.scene.sound.get ? this.scene.sound.get('sfx-shoot') : null;
    if (sfx) sfx.play();

    const fire = (x, angle) => {
      const bullet = bulletGroup.get();
      if (bullet) bullet.fire(x, this.y - 20, this.bulletSpeed, this.weaponMode, angle);
    };

    if (this.weaponMode === 'single') {
      fire(this.x, -90);
    } else if (this.weaponMode === 'double') {
      fire(this.x - 12, -90);
      fire(this.x + 12, -90);
    } else if (this.weaponMode === 'spread') {
      fire(this.x, -90);
      fire(this.x, -65);
      fire(this.x, -115);
    } else if (this.weaponMode === 'burst') {
      // 3 bullets tight straight-ahead, fires at normal fire rate
      fire(this.x - 5, -90);
      fire(this.x,     -90);
      fire(this.x + 5, -90);
    } else if (this.weaponMode === 'wide') {
      // 5-bullet fan, ~90° total spread — all pointing forward
      fire(this.x, -90);
      fire(this.x, -65);
      fire(this.x, -115);
      fire(this.x, -48);
      fire(this.x, -132);
    }

    this.scene.events.emit('playerShoot');
  }

  hit() {
    if (this.invincible || this.shieldActive) {
      if (this.shieldActive) this.deactivateShield();
      return false;
    }
    this._justLostLife = false;
    this.hp -= 1;
    if (this.hp <= 0) {
      this.hp = this.maxHp;
      this._justLostLife = true;
      this._startIFrames(1400);
    } else {
      this._startIFrames(800);
    }
    this.scene.events.emit('playerHpChanged', this.hp, this.maxHp);
    return true;
  }

  // Teleport to spawn position and reset i-frames (called after losing a life)
  respawn(x, y) {
    // Ensure visible/active in case disableBody was somehow called on this object
    this.setActive(true).setVisible(true);
    if (this._thrustEmitter) this._thrustEmitter.start();
    this.body.reset(x, y); // resets body position + zeros velocity in one atomic call
    if (this._thrust) this._thrust.setPosition(x, y + 18);
    // Extend i-frames from respawn point; _startIFrames cancels the old timers first
    this._startIFrames(1800);
  }

  // Starts invincibility + blink. Always cancels any existing timers first so
  // multiple rapid calls (hit → respawn) can never stack competing animations.
  _startIFrames(duration) {
    // Cancel any active blink/iframe timers
    if (this._blinkTimer)  { this._blinkTimer.remove(false);  this._blinkTimer  = null; }
    if (this._iFrameTimer) { this._iFrameTimer.remove(false); this._iFrameTimer = null; }

    // Ensure we start from a fully-visible state
    this.setAlpha(1);
    if (this._thrust) this._thrust.setAlpha(1);

    this.invincible = true;
    let visible = false; // blink: starts invisible so first flash is OFF → ON

    const steps = Math.max(2, Math.floor(duration / 120));
    this._blinkTimer = this.scene.time.addEvent({
      delay: 120,
      repeat: steps - 1,
      callback: () => {
        visible = !visible;
        const a = visible ? 1 : 0;
        this.setAlpha(a);
        if (this._thrust) this._thrust.setAlpha(a);
      }
    });

    this._iFrameTimer = this.scene.time.delayedCall(duration, () => {
      this.invincible   = false;
      this._blinkTimer  = null;
      this._iFrameTimer = null;
      // Restore full visibility when i-frames end
      this.setAlpha(1);
      if (this._thrust) this._thrust.setAlpha(1);
    });
  }

  clearIFrames() {
    if (this._blinkTimer)  { this._blinkTimer.remove(false);  this._blinkTimer  = null; }
    if (this._iFrameTimer) { this._iFrameTimer.remove(false); this._iFrameTimer = null; }
    this.invincible = false;
    this.setAlpha(1);
    if (this._thrust) this._thrust.setAlpha(1);
    if (this._thrustEmitter) this._thrustEmitter.stop();
  }

  knockback(fromX, fromY) {
    if (this.dead) return;
    const { vx, vy } = computeKnockback(fromX, fromY, this.x, this.y);
    this.body.setVelocity(vx, vy);
    this.scene.time.delayedCall(200, () => {
      if (!this.dead) this.body.setVelocity(0, 0);
    });
  }

  setWeaponMode(mode) {
    this.weaponMode = mode;
  }

  activateShield() {
    this.shieldActive = true;
  }

  deactivateShield() {
    this.shieldActive = false;
    this._shieldGraphic.clear();
  }

  destroy() {
    if (this._thrustEmitter) { this._thrustEmitter.destroy(); this._thrustEmitter = null; }
    if (this._thrust) this._thrust.destroy();
    if (this._shieldGraphic) this._shieldGraphic.destroy();
    super.destroy();
  }
}
