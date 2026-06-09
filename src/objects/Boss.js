import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { spawnExplosion } from './Explosion.js';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, hp, level) {
    super(scene, x, y, 'boss-body');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp     = hp;
    this.maxHp  = hp;
    this.level  = level;
    this.phase  = 1;

    this._entered   = false;
    this._enterY    = 155;
    this._moveDir   = 1;
    this._lastFired = 0;
    this._lastCannon = 0;
    this._lastMinion = 0;
    this._lastRay   = 0;
    this._p2Timer   = 0;
    this._p3Timer   = 0;

    this.setDepth(6).setScale(0.85);  // 192x144 * 0.85 ≈ 163x122
    this.body.allowGravity = false;
    this.body.setImmovable(true);
    this.body.setSize(140, 85, true);

    // Decorative cannons (no physics)
    this._cannonL = scene.textures.exists('boss-cannon-left')
      ? scene.add.image(x - 68, y + 22, 'boss-cannon-left').setDepth(6).setScale(0.85)
      : null;
    this._cannonR = scene.textures.exists('boss-cannon-right')
      ? scene.add.image(x + 68, y + 22, 'boss-cannon-right').setDepth(6).setScale(0.85)
      : null;

    // Rays sprite (hidden until phase 2 attack)
    this._rays = null;
    if (scene.textures.exists('boss-rays')) {
      this._rays = scene.add.sprite(x, y + 130, 'boss-rays').setDepth(5).setAlpha(0).setScale(0.85);
      if (scene.anims.exists('boss-rays-anim')) this._rays.play('boss-rays-anim');
    }

    // Play idle anim
    if (scene.anims.exists('boss-idle')) this.play('boss-idle');

    // Fly-in tween
    scene.tweens.add({
      targets: this, y: this._enterY, duration: 2200, ease: 'Power2.easeOut',
      onComplete: () => { this._entered = true; }
    });
  }

  // Called every frame from GameScene.update()
  update(time, delta, player, enemyBullets, enemyGroup) {
    if (!this.active) return;

    // Keep cannons & rays aligned
    if (this._cannonL) this._cannonL.setPosition(this.x - 68, this.y + 22);
    if (this._cannonR) this._cannonR.setPosition(this.x + 68, this.y + 22);
    if (this._rays)   this._rays.setPosition(this.x, this.y + 130);

    if (!this._entered) return;

    // Phase transition at 50% HP
    if (this.phase === 1 && this.hp <= this.maxHp * 0.5) this._enterPhase2();

    if (this.phase === 1) {
      this._updatePhase1(time, delta, player, enemyBullets);
    } else if (this.phase === 2) {
      this._updatePhase2(time, delta, player, enemyBullets, enemyGroup);
    } else {
      this._updatePhase3(time, delta, player, enemyBullets, enemyGroup);
    }
  }

  // ── Phase 1: sweep + burst ────────────────────────────────────────────────

  _updatePhase1(time, delta, player, enemyBullets) {
    // Horizontal sweep
    this.x += 95 * this._moveDir * (delta / 1000);
    if (this.x > GAME_WIDTH - 55) { this.x = GAME_WIDTH - 55; this._moveDir = -1; }
    if (this.x < 55)              { this.x = 55;              this._moveDir =  1; }

    // Burst downward every 1600ms
    if (time > this._lastFired + 1600) {
      this._fireBurst(enemyBullets, [75, 90, 105]);
      this._lastFired = time;
    }

    // Cannon aimed shot every 2600ms
    if (player && time > this._lastCannon + 2600) {
      this._fireCannonAt(player, enemyBullets);
      this._lastCannon = time;
    }
  }

  // ── Phase 2: figure-8 + spread + minions ─────────────────────────────────

  _updatePhase2(time, delta, player, enemyBullets, enemyGroup) {
    if (this.phase === 2 && this.hp <= this.maxHp * 0.25) {
      this._enterPhase3();
      return;
    }
    this._p2Timer += delta;
    const t  = this._p2Timer / 1000;
    const cx = GAME_WIDTH / 2;
    // Figure-8 oscillation
    const tx = cx + Math.sin(t * 1.1) * 170;
    const ty = this._enterY + Math.sin(t * 2.2) * 38;
    this.x += (tx - this.x) * 0.045;
    this.y += (ty - this.y) * 0.045;

    // Wider spread every 1000ms
    if (time > this._lastFired + 1000) {
      this._fireBurst(enemyBullets, [60, 75, 90, 105, 120]);
      this._lastFired = time;
    }

    // Cannon aimed every 1800ms
    if (player && time > this._lastCannon + 1800) {
      this._fireCannonAt(player, enemyBullets);
      this._lastCannon = time;
    }

    // Spawn minion pair every 5000ms
    if (enemyGroup && time > this._lastMinion + 5000) {
      this._spawnMinions();
      this._lastMinion = time;
    }

    // Ray attack every 4200ms
    if (time > this._lastRay + 4200 && this._rays) {
      this._triggerRay(player, enemyBullets);
      this._lastRay = time;
    }
  }

  // ── Firing helpers ────────────────────────────────────────────────────────

  _fireBurst(enemyBullets, angles) {
    angles.forEach(deg => {
      const b = enemyBullets.get();
      if (!b) return;
      const rad = Phaser.Math.DegToRad(deg);
      b.fire(this.x, this.y + 55, Math.cos(rad) * 210, Math.sin(rad) * 210);
      b.setTint(0xff0044).setScale(1.3);
    });
  }

  _fireCannonAt(player, enemyBullets) {
    [[-68, 22], [68, 22]].forEach(([dx, dy]) => {
      const cx = this.x + dx, cy = this.y + dy;
      const angle = Phaser.Math.Angle.Between(cx, cy, player.x, player.y);
      const b = enemyBullets.get();
      if (b) {
        b.fire(cx, cy, Math.cos(angle) * 190, Math.sin(angle) * 190);
        b.setTint(0xcc00ff).setScale(1.5);
      }
    });
  }

  _triggerRay(player, enemyBullets) {
    if (!this._rays) return;
    this._rays.setAlpha(0.9);
    // Volley of 3 center-aimed shots timed with ray animation
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        if (!player?.active) return;
        const b = enemyBullets.get();
        if (b) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y + 130, player.x, player.y);
          b.fire(this.x, this.y + 130, Math.cos(angle) * 240, Math.sin(angle) * 240);
          b.setTint(0xff8800).setScale(1.2);
        }
      });
    }
    this.scene.time.delayedCall(900, () => {
      if (this._rays) this._rays.setAlpha(0);
    });
  }

  _spawnMinions() {
    const cfg = {
      texture: 'enemy-02', type: 'swarmer', hp: 1, speed: 140, fireRate: 9999,
      shootsAt: false, movePattern: 'sine', amplitude: 55, frequency: 0.003, animKey: 'enemy-02-fly'
    };
    [this.x - 90, this.x + 90].forEach(x => {
      this.scene.events.emit('spawnEnemy', x, this.y + 80, cfg);
    });
  }

  // ── Phase 2 transition ────────────────────────────────────────────────────

  _enterPhase2() {
    this.phase = 2;
    this._p2Timer = 0;
    this._lastMinion = this.scene.time.now;
    this._lastRay    = this.scene.time.now;

    this.scene.cameras.main.flash(350, 255, 80, 0);
    this.scene.cameras.main.shake(300, 0.015);

    const txt = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '!! PHASE 2 !!', {
      font: 'bold 30px monospace', fill: '#ff4400', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.scene.tweens.add({
      targets: txt, alpha: 1, duration: 250, yoyo: true, hold: 700, onComplete: () => txt.destroy()
    });
  }

  // ── Phase 3 transition ────────────────────────────────────────────────────

  _enterPhase3() {
    this.phase = 3;
    this._p3Timer = 0;
    this._lastMinion = this.scene.time.now;
    this._lastRay    = this.scene.time.now;
    this._lastFired  = this.scene.time.now;
    this._lastCannon = this.scene.time.now;

    this.scene.cameras.main.flash(350, 255, 0, 0);
    this.scene.cameras.main.shake(400, 0.02);

    const txt = this.scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, '!! FINAL PHASE !!', {
      font: 'bold 28px monospace', fill: '#ff0000', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.scene.tweens.add({
      targets: txt, alpha: 1, duration: 250, yoyo: true, hold: 700, onComplete: () => txt.destroy()
    });
  }

  _updatePhase3(time, delta, player, enemyBullets, enemyGroup) {
    this._p3Timer += delta;
    const t  = this._p3Timer / 1000;
    const cx = GAME_WIDTH / 2;
    const tx = cx + Math.sin(t * 1.6) * 180;
    const ty = this._enterY + Math.sin(t * 3.2) * 50;
    this.x += (tx - this.x) * 0.07;
    this.y += (ty - this.y) * 0.07;

    // Spiral: 12 evenly-spaced angles every 800ms
    if (time > this._lastFired + 800) {
      const angles = Array.from({ length: 12 }, (_, i) => i * 30);
      this._fireBurst(enemyBullets, angles);
      this._lastFired = time;
    }
    // Cannon every 1200ms
    if (player && time > this._lastCannon + 1200) {
      this._fireCannonAt(player, enemyBullets);
      this._lastCannon = time;
    }
    // Minions every 3000ms
    if (enemyGroup && time > this._lastMinion + 3000) {
      this._spawnMinions();
      this._lastMinion = time;
    }
    // Ray every 3000ms
    if (time > this._lastRay + 3000 && this._rays) {
      this._triggerRay(player, enemyBullets);
      this._lastRay = time;
    }
  }

  // ── Damage & defeat ───────────────────────────────────────────────────────

  takeDamage(amount) {
    if (this.hp <= 0) return false;   // guard: prevent re-kill on simultaneous hits
    this.hp = Math.max(0, this.hp - amount);
    this.scene.events.emit('bossHealthChanged', this.hp / this.maxHp);

    // Hit flash
    this.setTint(0xff4444);
    this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });

    // Hit spark
    if (this.scene.anims.exists('hit-anim')) {
      const spark = this.scene.add.sprite(this.x, this.y, 'hit-fx').setDepth(11).setScale(1.5);
      spark.play('hit-anim');
      spark.once('animationcomplete', () => spark.destroy());
    }

    return this.hp <= 0;
  }

  defeat() {
    this.disableBody(true, false); // stop physics, keep visual for explosions

    const scene = this.scene;
    scene.cameras.main.flash(400, 255, 200, 50);
    scene.cameras.main.shake(500, 0.025);

    for (let i = 0; i < 10; i++) {
      scene.time.delayedCall(i * 220, () => {
        const ex = this.x + (Math.random() - 0.5) * 160;
        const ey = this.y + (Math.random() - 0.5) * 100;
        spawnExplosion(scene, ex, ey, i < 5 ? 'small' : 'large');
      });
    }

    // Final big explosion then destroy
    scene.time.delayedCall(2400, () => {
      spawnExplosion(scene, this.x, this.y, 'large');
      this.destroy();
    });
  }

  destroy(fromScene) {
    if (this._cannonL) { this._cannonL.destroy(); this._cannonL = null; }
    if (this._cannonR) { this._cannonR.destroy(); this._cannonR = null; }
    if (this._rays)    { this._rays.destroy();    this._rays    = null; }
    super.destroy(fromScene);
  }
}
