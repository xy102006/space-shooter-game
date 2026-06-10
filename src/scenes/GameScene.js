import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Bullet from '../objects/Bullet.js';
import EnemyBullet from '../objects/EnemyBullet.js';
import { spawnExplosion } from '../objects/Explosion.js';
import Boss from '../objects/Boss.js';
import ScrollManager from '../systems/ScrollManager.js';
import CollisionManager from '../systems/CollisionManager.js';
import ComboManager from '../systems/ComboManager.js';
import WaveManager from '../systems/WaveManager.js';
import PowerupManager from '../systems/PowerupManager.js';
import TouchControls from '../systems/TouchControls.js';
import { LEVELS } from '../data/levels.js';
import Asteroid from '../objects/Asteroid.js';

const DIFFICULTY_PRESETS = {
  easy:   { speedMult: 0.65, fireRateMult: 2.0, rampInterval: 30000, rampAmount: 0.05, delayMult: 1.4 },
  normal: { speedMult: 0.90, fireRateMult: 1.2, rampInterval: 20000, rampAmount: 0.09, delayMult: 1.0 },
  hard:   { speedMult: 1.20, fireRateMult: 0.8, rampInterval: 15000, rampAmount: 0.13, delayMult: 0.72 }
};

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    console.log('[GameScene] init() level=', data.level);
    this.level      = data.level      || 1;
    this.shipConfig = data.shipConfig || null;
    this.difficulty = data.difficulty || 'normal';
    this._boss      = null;

    this.registry.set('score',      data.score || 0);
    this.registry.set('lives',      data.lives || 3);
    this.registry.set('bombs',      data.bombs || 0);
    this.registry.set('level',      this.level);
    this.registry.set('difficulty', this.difficulty);

    this._shotsFired = 0;
    this._killCount  = 0;
    this._bestCombo  = 0;
  }

  create() {
    console.log('[GameScene] create() level=', this.level);
    try {
    // Background scroll
    this._scroll = new ScrollManager(this, { level: this.level });

    // Bullet pools
    this._playerBullets = this.physics.add.group({ classType: Bullet,      maxSize: 60, runChildUpdate: true });
    this._enemyBullets  = this.physics.add.group({ classType: EnemyBullet, maxSize: 60, runChildUpdate: true });

    // Shared particle texture (4×4 white dot)
    if (!this.textures.exists('particle-dot')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff);
      g.fillRect(0, 0, 4, 4);
      g.generateTexture('particle-dot', 4, 4);
      g.destroy();
    }

    // Object groups
    this._enemyGroup   = this.physics.add.group({ maxSize: 50 });
    this._powerupGroup = this.physics.add.group({ maxSize: 12 });

    // Player
    const sc = this.shipConfig || {
      textureKey: 'ship-yellow-01', thrustKey: 'thrust-01',
      speed: 220, fireRate: 280, startingWeapon: 'single',
      bulletSpeed: 500, hitboxRadius: 10,
      startingLives: 3, startingBombs: 0, powerupDurationMult: 1.0
    };
    this._player = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 80, sc);

    // Difficulty
    const preset = DIFFICULTY_PRESETS[this.difficulty] || DIFFICULTY_PRESETS.normal;
    this._diff = { ...preset, currentSpeedMult: preset.speedMult, currentFireRateMult: preset.fireRateMult };

    // Collision
    this._collision = new CollisionManager(this, {
      player:       this._player,
      playerBullets: this._playerBullets,
      enemyGroup:   this._enemyGroup,
      enemyBullets: this._enemyBullets,
      powerupGroup: this._powerupGroup
    });

    // Powerup effects
    this._powerupMgr = new PowerupManager(this, this._player);

    // Combo system
    this._comboMgr = new ComboManager(this);
    this.events.on('comboChanged', (streak) => {
      if (streak > this._bestCombo) this._bestCombo = streak;
    });
    this.events.on('frenzyStart', () => {
      this._enemyGroup.getChildren().forEach(e => {
        if (e.active) e.speed = (e.speed || 150) * 1.3;
      });
    });
    this.events.on('frenzyEnd', () => {
      this._enemyGroup.getChildren().forEach(e => {
        if (e.active) e.speed = (e.speed || 150) / 1.3;
      });
    });
    this.events.on('playerShoot', () => { this._shotsFired++; });

    // Asteroid hazard group
    this._asteroidGroup = this.physics.add.group({ maxSize: 20, runChildUpdate: true });
    this._collision.addAsteroidCollision(this._asteroidGroup);

    // Spawn asteroids periodically starting at 10s
    this.time.addEvent({
      delay: 10000, startAt: 10000, loop: true,
      callback: () => {
        if (this._player.dead) return;
        const ASTEROID_KEYS = ['asteroid-01', 'asteroid-02', 'asteroid-03', 'asteroid-04', 'asteroid-05'];
        const key = ASTEROID_KEYS[Math.floor(Math.random() * ASTEROID_KEYS.length)];
        const x = 40 + Math.random() * (GAME_WIDTH - 80);
        let asteroid = this._asteroidGroup.getChildren().find(a => !a.active);
        if (!asteroid) {
          asteroid = new Asteroid(this, x, -40, key);
          this._asteroidGroup.add(asteroid, true);
        } else {
          asteroid.enableBody(true, x, -40, true, true);
          asteroid.setTexture(key);
        }
        asteroid.init();
      }
    });

    // Bomb key
    this._player.bombKey.on('down', () => this.dropBomb());

    // Wave manager
    this._waveMgr = new WaveManager(
      this, this.level, this._enemyGroup,
      (x, y, cfg) => this._spawnEnemy(x, y, cfg),
      {
        speedMult:    this._diff.currentSpeedMult,
        fireRateMult: this._diff.currentFireRateMult,
        delayMult:    this._diff.delayMult,
        minBossTime:  LEVELS[this.level]?.minBossTime || 240000
      }
    );

    // Event wiring
    this.events.once('allWavesCleared', this._onAllWavesCleared, this);
    this.events.once('bossIntroComplete', this._spawnBoss, this);
    this.events.on('tryDropPowerup', (x, y) => this._dropPowerup(x, y));
    this.events.on('spawnEnemy',     (x, y, cfg) => this._spawnEnemy(x, y, cfg));

    // Gradual difficulty ramp (speed/fire rate only; WaveManager controls spawn timing)
    this.time.addEvent({
      delay: this._diff.rampInterval, loop: true,
      callback: this._rampDifficulty, callbackScope: this
    });

    // HUD
    this.scene.launch('HUDScene');

    this.events.emit('scoreChanged',    this.registry.get('score'));
    this.events.emit('livesChanged',    this.registry.get('lives'));
    this.events.emit('bombsChanged',    this.registry.get('bombs'));
    this.events.emit('levelChanged',    this.level);
    this.events.emit('difficultyLabel', this.difficulty.toUpperCase());

    // Subtle vignette to frame the play area
    try {
      this.cameras.main.postFX.addVignette(0.5, 0.5, 0.8, 0.4);
    } catch (_) {}

    // Pause on P
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    // DEV: backtick = instant level clear
    this.input.keyboard.on('keydown-BACKTICK', () => {
      if (this._boss?.active) {
        this._collision._bossKilled = false;
        this._boss.hp = 1;
        this._boss.takeDamage(1);
      } else {
        ['HUDScene', 'PauseScene'].forEach(k => { try { this.scene.stop(k); } catch (_) {} });
        this.scene.start('LevelClearScene', {
          kills: this._killCount || 0, shotsFired: this._shotsFired || 0,
          bestCombo: this._bestCombo || 0, score: this.registry.get('score'),
          level: this.level, lives: this.registry.get('lives'),
          bombs: this.registry.get('bombs'), difficulty: this.difficulty,
          shipConfig: this._player?.shipConfig
        });
      }
    });

    console.log('[GameScene] create() try-block complete, level=', this.level);
    } catch (err) {
      console.error('[GameScene] create() THREW:', err);
    }
    // TouchControls lives OUTSIDE the try/catch — touch must always work even
    // if earlier setup throws.  Guard on _player in case Player itself failed.
    if (this._player && !this._touchControls) {
      this._touchControls = new TouchControls(this, this._player);
      console.log('[GameScene] TouchControls created, level=', this.level);
    } else if (!this._player) {
      console.error('[GameScene] _player is null — TouchControls skipped');
    }
  }

  // ── Wave → Boss ───────────────────────────────────────────────────────────

  _onAllWavesCleared() {
    this._waveMgr.stop();
    const levelCfg = LEVELS[this.level];
    this.scene.launch('BossIntroScene', { bossName: levelCfg?.bossName || 'BOSS' });
  }

  _spawnBoss() {
    const levelCfg = LEVELS[this.level];
    const hp = levelCfg?.bossHp || 150;
    this._boss = new Boss(this, GAME_WIDTH / 2, -120, hp, this.level);
    this._collision.addBossCollision(this._boss);
    this.events.emit('bossHealthChanged', 1.0);
  }

  // ── Enemy spawning ────────────────────────────────────────────────────────

  _spawnEnemy(x, y, cfg) {
    let enemy = this._enemyGroup.getChildren().find(e => !e.active && e.texture.key === cfg.texture);
    if (!enemy) {
      enemy = new Enemy(this, x, y, cfg.texture, cfg.type);
      this._enemyGroup.add(enemy, true);
    } else {
      enemy.enableBody(true, x, y, true, true);
    }
    enemy.type  = cfg.type;
    enemy.hp    = cfg.hp;
    enemy.maxHp = cfg.hp;
    enemy.init(cfg);
    if (this.anims.exists(cfg.animKey)) enemy.play(cfg.animKey);
    return enemy;
  }

  // ── Powerup drop ──────────────────────────────────────────────────────────

  _dropPowerup(x, y) {
    const types = ['double', 'spread', 'burst', 'wide', 'shield', 'shield', 'health', 'health', 'speed', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];
    const tex = this.textures.exists(`powerup-${type}`) ? `powerup-${type}` : 'powerup-double';

    const p = this.physics.add.sprite(x, y, tex);
    p.powerupType = type;
    p.setScale(1.5).setDepth(7);
    p.body.allowGravity = false;
    p.body.setVelocity(0, 55);
    p.body.setSize(44, 44, true);

    this.tweens.add({ targets: p, alpha: 0.55, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.physics.add.overlap(this._player, p, () => {
      if (!p.active) return;
      p.destroy();
      const score = this.registry.get('score') + 10;
      this.registry.set('score', score);
      this.events.emit('scoreChanged', score);
      this.events.emit('powerupCollected', type);
    });

    this.time.delayedCall(8000, () => { if (p && p.active) p.destroy(); });
  }

  // ── Difficulty ramp ───────────────────────────────────────────────────────

  _rampDifficulty() {
    if (this._player.dead || this._boss) return;
    const d = this._diff;
    d.currentSpeedMult    = Math.min(d.currentSpeedMult    + d.rampAmount, 2.0);
    d.currentFireRateMult = Math.max(d.currentFireRateMult - d.rampAmount * 0.5, 0.5);
  }

  // ── Death overlay ─────────────────────────────────────────────────────────

  showDeathOverlay() {
    this._enemyBullets.getChildren().forEach(b => { if (b.active) b.disableBody(true, true); });
    if (this._boss?.active) { this._boss.setVelocity(0, 0); }

    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setDepth(40);

    this.add.text(cx, cy - 80, 'YOU DIED', {
      font: 'bold 52px monospace', fill: '#ff2222', stroke: '#660000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(41);

    const score = this.registry.get('score');
    this.add.text(cx, cy - 10, `SCORE: ${score}`, {
      font: 'bold 24px monospace', fill: '#ffffff', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(41);

    const prev = parseInt(localStorage.getItem('highScore') || '0');
    if (score > prev) {
      localStorage.setItem('highScore', score);
      this.add.text(cx, cy + 30, 'NEW BEST!', { font: 'bold 18px monospace', fill: '#ffcc00' }).setOrigin(0.5).setDepth(41);
    } else {
      this.add.text(cx, cy + 30, `BEST: ${prev}`, { font: '16px monospace', fill: '#888888' }).setOrigin(0.5).setDepth(41);
    }

    const retry = this.add.text(cx, cy + 100, '[ ENTER — TRY AGAIN ]', {
      font: 'bold 18px monospace', fill: '#44aaff', stroke: '#001133', strokeThickness: 3
    }).setOrigin(0.5).setDepth(41).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: retry, alpha: 0.4, duration: 550, yoyo: true, repeat: -1 });

    const menu = this.add.text(cx, cy + 140, '[ M — MAIN MENU ]', {
      font: '15px monospace', fill: '#aaaaaa', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(41).setInteractive({ useHandCursor: true });

    const goRetry = () => { this.scene.stop('HUDScene'); this.scene.start('ShipSelectScene'); };
    const goMenu  = () => { this.scene.stop('HUDScene'); this.scene.start('MainMenuScene'); };

    retry.on('pointerdown', goRetry);
    menu.on('pointerdown',  goMenu);
    this.input.keyboard.once('keydown-ENTER', goRetry);
    this.input.keyboard.once('keydown-SPACE', goRetry);
    this.input.keyboard.once('keydown-M',     goMenu);
  }

  // ── Public methods for touch button wiring ────────────────────────────────

  dropBomb() {
    this._triggerBomb();
  }

  togglePause() {
    if (this.scene.isActive('PauseScene')) return;
    this.scene.pause('HUDScene');
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  // ── Bomb ──────────────────────────────────────────────────────────────────

  _triggerBomb() {
    if (this._player.dead) return;
    const bombs = this.registry.get('bombs');
    if (bombs <= 0) return;

    this.registry.set('bombs', bombs - 1);
    this.events.emit('bombsChanged', bombs - 1);

    this.cameras.main.flash(200, 255, 255, 255);
    this.cameras.main.shake(300, 0.02);

    let scoreAdd = 0;
    this._enemyGroup.getChildren().forEach(enemy => {
      if (enemy.active) {
        spawnExplosion(this, enemy.x, enemy.y, 'small');
        enemy.disableBody(true, true);
        scoreAdd += 50;
      }
    });
    this._enemyBullets.getChildren().forEach(b => { if (b.active) b.disableBody(true, true); });

    if (scoreAdd > 0) {
      const score = this.registry.get('score') + scoreAdd;
      this.registry.set('score', score);
      this.events.emit('scoreChanged', score);
    }
  }

  // ── Shutdown ──────────────────────────────────────────────────────────────

  shutdown() {
    if (this._touchControls) { this._touchControls.destroy(); this._touchControls = null; }
    // Clear all scene-level event listeners so Level N listeners don't accumulate
    // into Level N+1 when the same GameScene instance restarts.
    this.events.removeAllListeners();
  }

  destroy() {
    if (this._touchControls) { this._touchControls.destroy(); this._touchControls = null; }
    super.destroy();
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update(time, delta) {
    this._scroll.update(delta);
    this._player.update(time, delta, this._playerBullets);

    if (this._player.dead) return;

    this._enemyGroup.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      enemy.updateMovement(time, delta, this._player);
      enemy.tryFire(time, this._player, this._enemyBullets);
    });

    this._waveMgr?.update();

    if (this._boss?.active) {
      this._boss.update(time, delta, this._player, this._enemyBullets, this._enemyGroup);
    }
  }
}
