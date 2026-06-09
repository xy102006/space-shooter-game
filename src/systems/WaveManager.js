import { GAME_WIDTH } from '../constants.js';
import { WAVES } from '../data/waves.js';
import { computeFormationX } from '../utils/formations.js';

const ENEMY_CONFIGS = {
  fighter: { texture: 'enemy-01', type: 'fighter', hp: 2, speed: 110, fireRate: 2800,
    shootsAt: true,  movePattern: 'straight', animKey: 'enemy-01-fly' },
  swarmer: { texture: 'enemy-02', type: 'swarmer', hp: 1, speed: 130, fireRate: 9999,
    shootsAt: false, movePattern: 'sine', amplitude: 60, frequency: 0.003, animKey: 'enemy-02-fly' },
  turret:  { texture: 'enemy-03', type: 'turret',  hp: 3, speed: 70,  fireRate: 2000,
    shootsAt: true,  movePattern: 'straight', animKey: 'enemy-03-fly' },
  flanker: { texture: 'enemy-01', type: 'flanker', hp: 1, speed: 180, fireRate: 3000,
    shootsAt: true,  movePattern: 'flank', animKey: 'enemy-01-fly' }
};

export default class WaveManager {
  constructor(scene, level, enemyGroup, spawnFn, diff) {
    this.scene      = scene;
    this.enemyGroup = enemyGroup;
    this.spawnFn    = spawnFn;
    this.diff       = diff;

    this._active        = true;
    this._allDispatched = false;
    this._bossTriggered = false;
    this._minBossTime   = scene.time.now + (diff.minBossTime || 240000);

    const waves = WAVES[level] || WAVES[1];
    let dispatched = 0;

    waves.forEach(wave => {
      const delay = wave.delay * (diff.delayMult || 1.0);
      scene.time.delayedCall(delay, () => {
        if (!this._active) return;
        this._spawnWave(wave);
        dispatched++;
        if (dispatched >= waves.length) this._allDispatched = true;
      });
    });
  }

  stop() { this._active = false; }

  update() {
    if (!this._allDispatched || this._bossTriggered || !this._active) return;
    const alive = this.enemyGroup.getChildren().filter(e => e.active).length;
    if (alive === 0 && this.scene.time.now >= this._minBossTime) {
      this._bossTriggered = true;
      this.scene.events.emit('allWavesCleared');
    }
  }

  _spawnWave(wave) {
    let entries = [];

    if (Array.isArray(wave.enemies)) {
      let idx = 0;
      const total = wave.enemies.reduce((s, g) => s + g.count, 0);
      wave.enemies.forEach(group => {
        for (let i = 0; i < group.count; i++) {
          entries.push({ type: group.type, x: this._formationX(idx, total, wave.formation), y: -30 - idx * 28, isFlank: false });
          idx++;
        }
      });
    } else {
      const isFlanker = wave.formation === 'flanker';
      for (let i = 0; i < wave.count; i++) {
        const halfCount = Math.ceil(wave.count / 2);
        const x = isFlanker
          ? (i < halfCount ? -40 : GAME_WIDTH + 40)
          : this._formationX(i, wave.count, wave.formation);
        const y = isFlanker
          ? 80 + (i % halfCount) * 70
          : -30 - i * 28;
        entries.push({ type: wave.enemyType, x, y, isFlank: isFlanker });
      }
    }

    entries.forEach((e, i) => {
      this.scene.time.delayedCall(i * 120, () => {
        if (!this._active) return;
        const base = ENEMY_CONFIGS[e.type];
        const cfg = {
          ...base,
          speed:    base.speed    * this.diff.speedMult,
          fireRate: base.fireRate * this.diff.fireRateMult
        };
        const enemy = this.spawnFn(e.x, e.y, cfg);
        if (enemy && !e.isFlank) {
          enemy._entering = true;
          const targetY = 60 + (i % 5) * 40;
          enemy.setPosition(enemy.x, -120);
          if (enemy.body) enemy.body.reset(enemy.x, -120);
          this.scene.tweens.add({
            targets: enemy, y: targetY, duration: 600, ease: 'Power2.easeOut',
            onComplete: () => { if (enemy.active) enemy._entering = false; }
          });
        }
      });
    });
  }

  _formationX(idx, total, formation) {
    return computeFormationX(idx, total, formation, GAME_WIDTH);
  }
}
