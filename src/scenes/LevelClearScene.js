import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { computeAccuracy } from '../utils/statsCalc.js';

export default class LevelClearScene extends Phaser.Scene {
  constructor() { super('LevelClearScene'); }
  init(data) { this._data = data; }

  create() {
    this._advancing = false;
    this.scene.bringToTop();
    console.log('[LevelClear] create() called, _data=', JSON.stringify(this._data));
    const { kills, shotsFired, bestCombo, score, level, lives, bombs, difficulty, shipConfig } = this._data;
    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    const accuracy = computeAccuracy(shotsFired || 0, kills || 0);

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000022, 0.92).setDepth(0);
    this.add.text(cx, 80, `LEVEL ${level} CLEARED!`, {
      font: 'bold 32px monospace', fill: '#44ff88', stroke: '#002200', strokeThickness: 4
    }).setOrigin(0.5).setDepth(1);

    [`KILLS:      ${kills || 0}`,
     `ACCURACY:   ${accuracy}%`,
     `BEST COMBO: x${bestCombo || 0}`,
     `SCORE:      ${score || 0}`
    ].forEach((line, i) => {
      this.add.text(cx, 180 + i * 44, line, {
        font: '20px monospace', fill: '#ffffff'
      }).setOrigin(0.5).setDepth(1);
    });

    const prompt = this.add.text(cx, GAME_HEIGHT - 80, 'CONTINUING IN 4...', {
      font: '16px monospace', fill: '#aaaaaa'
    }).setOrigin(0.5).setDepth(1);
    let secs = 4;
    this.time.addEvent({
      delay: 1000, repeat: 3,
      callback: () => {
        secs--;
        if (secs > 0) prompt.setText(`CONTINUING IN ${secs}...`);
      }
    });
    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    let advanced = false;
    const advance = (src) => {
      console.log('[LevelClear] advance() called from', src, '| advanced=', advanced, '| _advancing=', this._advancing);
      if (advanced) return;
      advanced = true;
      this._advance();
    };
    this.time.delayedCall(4000, () => advance('timer'));
    this.input.on('pointerdown', () => advance('click'));
    this.input.keyboard.on('keydown', () => advance('keydown'));
  }

  _advance() {
    console.log('[LevelClear] _advance() called | _advancing=', this._advancing);
    if (this._advancing) return;
    this._advancing = true;
    const d = this._data || {};
    ['HUDScene', 'PauseScene'].forEach(k => {
      try { if (this.scene.isActive(k) || this.scene.isPaused(k)) this.scene.stop(k); } catch (_) {}
    });
    try {
      if ((d.level || 1) >= 3) {
        console.log('[LevelClear] starting VictoryScene');
        this.scene.start('VictoryScene', { score: d.score, lives: d.lives });
      } else {
        const nextLevel = (d.level || 1) + 1;
        console.log('[LevelClear] starting GameScene level', nextLevel);
        this.scene.start('GameScene', {
          level:      nextLevel,
          score:      d.score,
          lives:      d.lives,
          bombs:      d.bombs,
          difficulty: d.difficulty,
          shipConfig: d.shipConfig
        });
        console.log('[LevelClear] scene.start() returned (transition queued)');
      }
    } catch (err) {
      console.error('[LevelClear] _advance() threw:', err);
    }
  }
}
