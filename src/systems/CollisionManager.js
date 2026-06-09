import { SCORE_VALUES, GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { spawnExplosion } from '../objects/Explosion.js';
import { deathParticleConfig } from '../utils/deathParticleConfig.js';

export default class CollisionManager {
  constructor(scene, { player, playerBullets, enemyGroup, enemyBullets, powerupGroup }) {
    this.scene  = scene;
    this.player = player;
    this._bossKilled = false;

    // Player bullets vs enemies
    scene.physics.add.overlap(playerBullets, enemyGroup, (bullet, enemy) => {
      bullet.disableBody(true, true);
      // Bullet impact spark
      const hit = scene.add.particles(bullet.x, bullet.y, 'particle-dot', {
        speed:    { min: 30, max: 90 },
        angle:    { min: 0, max: 360 },
        scale:    { start: 0.8, end: 0 },
        tint:     [0xffffff, 0xffff44],
        lifespan: 150,
        quantity:  5,
        frequency: -1
      });
      hit.explode(5, bullet.x, bullet.y);
      scene.time.delayedCall(300, () => { if (hit.active) hit.destroy(); });
      if (enemy.takeDamage(1)) this._killEnemy(enemy);
    });

    // Enemy bullets vs player
    // NOTE: Phaser's collideSpriteVsGroup always passes (sprite, groupMember).
    // So for overlap(group, sprite, cb), the callback receives (player, enemyBullet).
    scene.physics.add.overlap(enemyBullets, player, (_p, bullet) => {
      bullet.disableBody(true, true);
      this._hitPlayer(bullet.x, bullet.y);
    });

    // Player body vs enemies (ram)
    scene.physics.add.overlap(player, enemyGroup, (p, enemy) => {
      if (enemy.takeDamage(999)) this._killEnemy(enemy);
      this._hitPlayer(enemy.x, enemy.y);
    });

    // Player vs powerups
    if (powerupGroup) {
      scene.physics.add.overlap(player, powerupGroup, (p, powerup) => {
        if (!powerup.active) return;
        const type = powerup.powerupType;
        powerup.disableBody(true, true);
        scene.events.emit('powerupCollected', type);
        const score = scene.registry.get('score') + (SCORE_VALUES.powerup || 10);
        scene.registry.set('score', score);
        scene.events.emit('scoreChanged', score);
      });
    }
  }

  // Called once the boss spawns
  addBossCollision(boss) {
    const scene = this.scene;

    // Player bullets hit boss
    // Same Phaser ordering: overlap(group, sprite, cb) → cb receives (sprite, groupMember).
    scene.physics.add.overlap(scene._playerBullets, boss, (_b, bullet) => {
      bullet.disableBody(true, true);
      if (boss.takeDamage(1)) this._killBoss(boss);
    });

    // Boss body hits player
    scene.physics.add.overlap(this.player, boss, () => {
      this._hitPlayer(boss.x, boss.y);
    });

    // Enemy bullets still hit player (already registered above)
  }

  addAsteroidCollision(asteroidGroup) {
    // Player bullets destroy asteroids
    this.scene.physics.add.overlap(this.scene._playerBullets, asteroidGroup, (bullet, asteroid) => {
      bullet.disableBody(true, true);
      if (asteroid.takeDamage(1)) {
        spawnExplosion(this.scene, asteroid.x, asteroid.y, 'small');
        asteroid.disableBody(true, true);
      }
    });
    // Player contact kills player and destroys asteroid
    this.scene.physics.add.overlap(this.player, asteroidGroup, (player, asteroid) => {
      asteroid.disableBody(true, true);
      this._hitPlayer(asteroid.x, asteroid.y);
    });
  }

  // ── Kills ─────────────────────────────────────────────────────────────────

  _killEnemy(enemy) {
    const scene = this.scene;
    const explSize = (enemy.type === 'turret' || enemy.type === 'flanker') ? 'medium' : 'small';
    spawnExplosion(scene, enemy.x, enemy.y, explSize);

    // Typed death particles
    const pCfg = deathParticleConfig(enemy.type);
    const sparks = scene.add.particles(enemy.x, enemy.y, 'particle-dot', {
      speed:    { min: 60, max: 160 },
      angle:    { min: 0, max: 360 },
      scale:    { start: 1.2, end: 0 },
      tint:     pCfg.tint,
      lifespan: { min: pCfg.lifespan * 0.6, max: pCfg.lifespan },
      quantity:  pCfg.quantity,
      frequency: -1
    });
    sparks.explode(pCfg.quantity, enemy.x, enemy.y);
    scene.time.delayedCall(500, () => { if (sparks.active) sparks.destroy(); });
    scene.cameras.main.shake(80, 0.004);

    try { if (scene.sound.get('sfx-explosion')) scene.sound.play('sfx-explosion', { volume: 0.45 }); } catch (_) {}

    const scoreValue = SCORE_VALUES[enemy.type] || SCORE_VALUES.fighter;
    const comboMgr = scene._comboMgr;
    const finalScore = comboMgr ? comboMgr.recordKill(scoreValue) : scoreValue;
    scene._killCount = (scene._killCount || 0) + 1;
    const score = scene.registry.get('score') + finalScore;
    scene.registry.set('score', score);
    scene.events.emit('scoreChanged', score);

    // Score floater
    const floater = scene.add.text(enemy.x, enemy.y, `+${scoreValue}`, {
      font: 'bold 14px monospace', fill: '#ffff44', stroke: '#000000', strokeThickness: 2
    }).setDepth(30).setOrigin(0.5);
    scene.tweens.add({
      targets: floater, y: enemy.y - 50, alpha: 0, duration: 900,
      onComplete: () => floater.destroy()
    });

    if (Math.random() < 0.20) scene.events.emit('tryDropPowerup', enemy.x, enemy.y);

    if (enemy._hpBar) { enemy._hpBar.destroy(); enemy._hpBar = null; }
    enemy.disableBody(true, true);
  }

  _killBoss(boss) {
    if (this._bossKilled) return;
    this._bossKilled = true;
    const scene = this.scene;

    // Score
    const score = scene.registry.get('score') + (SCORE_VALUES.boss || 2000);
    scene.registry.set('score', score);
    scene.events.emit('scoreChanged', score);

    // Bomber bonus: +1 bomb on boss kill
    if (scene._player?.shipConfig?.type === 'ship-03') {
      const bombs = scene.registry.get('bombs') + 1;
      scene.registry.set('bombs', bombs);
      scene.events.emit('bombsChanged', bombs);
    }

    scene.events.emit('bossDefeated');
    spawnExplosion(scene, boss.x, boss.y, 'large');
    boss.defeat();

    // Transition after explosions finish (defeat() takes ~2.6s)
    scene.time.delayedCall(2800, () => {
      ['HUDScene', 'PauseScene'].forEach(k => {
        try {
          if (scene.scene.isActive(k) || scene.scene.isPaused(k)) scene.scene.stop(k);
        } catch (_) {}
      });
      scene.scene.start('LevelClearScene', {
        kills:      scene._killCount || 0,
        shotsFired: scene._shotsFired || 0,
        bestCombo:  scene._bestCombo || 0,
        score:      scene.registry.get('score'),
        level:      scene.level || 1,
        lives:      scene.registry.get('lives'),
        bombs:      scene.registry.get('bombs'),
        difficulty: scene.difficulty,
        shipConfig: scene._player?.shipConfig
      });
    });
  }

  // ── Player hit ────────────────────────────────────────────────────────────

  _hitPlayer(fromX = this.player.x, fromY = this.player.y - 50) {
    const scene = this.scene;
    const wasHit = this.player.hit();
    if (!wasHit) return;

    const lostLife = this.player._justLostLife;

    scene.cameras.main.shake(lostLife ? 150 : 80, lostLife ? 0.01 : 0.004);
    try {
      if (scene.sound.get && scene.sound.get('sfx-player-hit')) {
        scene.sound.play('sfx-player-hit', { volume: lostLife ? 0.6 : 0.35 });
      }
    } catch (_) {}

    if (scene._comboMgr) scene._comboMgr.onPlayerHit();

    if (lostLife) {
      const lives = scene.registry.get('lives') - 1;
      scene.registry.set('lives', lives);
      scene.events.emit('livesChanged', lives);

      if (lives <= 0) {
        this.player.dead = true;
        this.player.clearIFrames();
        scene.time.delayedCall(500, () => scene.showDeathOverlay());
      } else {
        this.player.knockback(fromX, fromY);
        scene.time.delayedCall(250, () => {
          if (!this.player.dead) {
            this.player.respawn(GAME_WIDTH / 2, GAME_HEIGHT - 80);
          }
        });
        const toast = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30,
          `LIFE LOST  —  ${lives} LEFT`, {
            font: 'bold 18px monospace', fill: '#ff4444',
            stroke: '#000000', strokeThickness: 3
          }).setOrigin(0.5).setDepth(50).setAlpha(0);
        scene.tweens.add({
          targets: toast, alpha: 1, duration: 180, yoyo: true,
          hold: 700, onComplete: () => toast.destroy()
        });
      }
    } else {
      // HP damage only — no life lost, just knockback
      this.player.knockback(fromX, fromY);
    }
  }
}
