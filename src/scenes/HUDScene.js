import { GAME_WIDTH, GAME_HEIGHT, DEPTHS } from '../constants.js';

export default class HUDScene extends Phaser.Scene {
  constructor() { super({ key: 'HUDScene', active: false }); }

  create() {
    const game = this.scene.get('GameScene');

    this._score = 0;
    this._displayScore = 0;
    this._lives = 3;

    // Score
    this._scoreTxt = this.add.text(12, 10, 'SCORE: 0', {
      font: 'bold 16px monospace', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setDepth(DEPTHS.HUD);

    // Level
    this._levelTxt = this.add.text(GAME_WIDTH / 2, 10, 'LEVEL 1', {
      font: 'bold 14px monospace', fill: '#aaddff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(DEPTHS.HUD);

    // Lives icons (top-right)
    this._lifeIcons = [];
    this._buildLives(this.registry.get('lives') || 3);

    // Powerup banner
    this._powerupTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, '', {
      font: 'bold 14px monospace', fill: '#ffcc00', stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(DEPTHS.HUD).setAlpha(0);

    this._powerupBar = null;
    this._hpPips = [];
    this._critVignetteTween = null;

    // Boss HP bar (hidden until boss fight)
    this._bossBar = this.add.graphics().setDepth(DEPTHS.HUD);
    this._bossTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '', {
      font: '13px monospace', fill: '#ff4444', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(DEPTHS.HUD);

    // Bomb counter
    this._bombTxt = this.add.text(12, GAME_HEIGHT - 24, 'BOMB: 0', {
      font: '13px monospace', fill: '#ffaa00', stroke: '#000', strokeThickness: 2
    }).setDepth(DEPTHS.HUD);

    // Listen to game events
    game.events.on('scoreChanged',     (v) => this._setScore(v), this);
    game.events.on('livesChanged',     (v) => this._setLives(v), this);
    game.events.on('powerupActivated', (type, duration) => this._showPowerup(type, duration), this);
    game.events.on('bossHealthChanged', (ratio) => this._updateBossBar(ratio), this);
    game.events.on('bossDefeated',     () => this._hideBossBar(), this);
    game.events.on('bombsChanged',     (v) => this._bombTxt.setText(`BOMB: ${v}`), this);
    game.events.on('levelChanged',     (v) => this._levelTxt.setText(`LEVEL ${v}`), this);
    game.events.on('playerHpChanged', (hp, maxHp) => this._buildHpPips(hp, maxHp), this);

    // Combo badge (top-right below lives)
    this._comboBadge = this.add.text(GAME_WIDTH - 10, 36, '', {
      font: 'bold 14px monospace', fill: '#ffff44', stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 0).setDepth(DEPTHS.HUD);

    game.events.on('comboChanged', (streak, mult) => {
      this._comboBadge.setText(streak >= 5 ? `x${mult.toFixed(1)} (${streak})` : '');
    }, this);
    game.events.on('comboReset', () => {
      if (this._comboBadge) this._comboBadge.setText('');
    }, this);

    game.events.on('frenzyStart', () => {
      const flash = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'FRENZY!', {
        font: 'bold 36px monospace', fill: '#ff4400', stroke: '#000', strokeThickness: 4
      }).setOrigin(0.5).setDepth(40);
      this.tweens.add({ targets: flash, alpha: 0, duration: 1200, onComplete: () => flash.destroy() });
    }, this);

    // Critical vignette (lives ≤ 1)
    game.events.on('livesChanged', (lives) => {
      try {
        const gameCam = this.scene.get('GameScene')?.cameras?.main;
        if (!gameCam?.postFX) return;
        const fx = gameCam.postFX.list?.[0];
        if (!fx) return;
        if (lives <= 1 && !this._critVignetteTween) {
          this._critVignetteTween = this.tweens.add({
            targets: fx, strength: 0.75, duration: 500, yoyo: true, repeat: -1
          });
        } else if (lives > 1 && this._critVignetteTween) {
          this._critVignetteTween.stop();
          this._critVignetteTween = null;
          try { fx.strength = 0.4; } catch (_) {}
        }
      } catch (_) {}
    }, this);

    // Init from registry
    this._setScore(this.registry.get('score') || 0);
    this._setLives(this.registry.get('lives') || 3);
    this._bombTxt.setText(`BOMB: ${this.registry.get('bombs') || 0}`);
    this._levelTxt.setText(`LEVEL ${this.registry.get('level') || 1}`);
    this._buildHpPips(5, 5);

    this._pauseBtn = null;
    this._bombBtn  = null;
    if (this.sys.game.device.input.touch) {
      this._createTouchButtons();
    }
  }

  _createTouchButtons() {
    const game = this.scene.get('GameScene');

    // PAUSE — x=468 sits just right of the rightmost life icon at x=460
    const pauseBtn = this.add.text(468, 10, '⏸', {
      font: 'bold 16px monospace', fill: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    })
      .setOrigin(0.5).setDepth(DEPTHS.HUD + 1).setAlpha(0.8)
      .setInteractive(new Phaser.Geom.Rectangle(-18, -12, 40, 36), Phaser.Geom.Rectangle.Contains);
    pauseBtn.on('pointerdown', () => game.togglePause());

    // BOMB — bottom-right, opposite the bomb count text at bottom-left
    const bombBtn = this.add.text(430, 578, 'BOMB', {
      font: 'bold 13px monospace', fill: '#ffaa00',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000066', padding: { x: 8, y: 5 },
    })
      .setOrigin(0.5).setDepth(DEPTHS.HUD + 1).setAlpha(0.85)
      .setInteractive(new Phaser.Geom.Rectangle(-30, -25, 80, 55), Phaser.Geom.Rectangle.Contains);
    bombBtn.on('pointerdown', () => game.dropBomb());

    // Dim when no bombs available
    const bombs = this.registry.get('bombs') || 0;
    bombBtn.setAlpha(bombs > 0 ? 0.85 : 0.35);
    game.events.on('bombsChanged', (v) => {
      if (this._bombBtn) this._bombBtn.setAlpha(v > 0 ? 0.85 : 0.35);
    }, this);

    this._pauseBtn = pauseBtn;
    this._bombBtn  = bombBtn;
  }

  _buildLives(count) {
    this._lifeIcons.forEach(i => i.destroy());
    this._lifeIcons = [];
    const textureKey = this.scene.get('GameScene')?._player?.texture?.key || 'ship-yellow-01';
    for (let i = 0; i < count; i++) {
      const icon = this.textures.exists(textureKey)
        ? this.add.image(GAME_WIDTH - 20 - i * 28, 18, textureKey, 0).setScale(1.2)
        : this.add.rectangle(GAME_WIDTH - 20 - i * 28, 18, 16, 16, 0x44aaff);
      this._lifeIcons.push(icon);
    }
  }

  _buildHpPips(hp, maxHp) {
    if (this._hpPips) this._hpPips.forEach(p => p.destroy());
    this._hpPips = [];
    const color = hp <= 2 ? 0xff2222 : (hp <= 3 ? 0xffaa00 : 0x44ff88);
    for (let i = 0; i < maxHp; i++) {
      const filled = i < hp;
      const pip = this.add.rectangle(
        14 + i * 18, 32, 13, 7,
        filled ? color : 0x333333
      ).setDepth(DEPTHS.HUD).setOrigin(0, 0.5);
      this._hpPips.push(pip);
    }
  }

  _setScore(v) {
    this._score = v;
    const from = this._displayScore ?? v;
    this._displayScore = v;
    this.tweens.killTweensOf(this._scoreTxt);
    this.tweens.addCounter({
      from, to: v, duration: 300,
      onUpdate: (tween) => {
        this._scoreTxt.setText(`SCORE: ${Math.floor(tween.getValue())}`);
      }
    });
  }

  _setLives(v) {
    this._lives = v;
    this._buildLives(Math.max(0, v));
  }

  _showPowerup(type, duration) {
    const labels = {
      double: 'DOUBLE SHOT',
      spread: 'SPREAD SHOT',
      burst:  'BURST FIRE',
      wide:   'WIDE SHOT',
      shield: 'SHIELD',
      speed:  'SPEED BOOST',
      bomb:   '+1 BOMB',
      health: '+2 HP'
    };
    this._powerupTxt.setText(labels[type] || type.toUpperCase());
    this._powerupTxt.setAlpha(1);
    this.tweens.killTweensOf(this._powerupTxt);
    this.tweens.add({
      targets: this._powerupTxt,
      alpha: 0,
      delay: Math.min(duration || 2000, 3000),
      duration: 500
    });

    // Powerup timer bar
    if (this._powerupBar) { this._powerupBar.destroy(); this._powerupBar = null; }
    if (duration && duration > 0) {
      const barX = GAME_WIDTH / 2 - 60;
      const barY = GAME_HEIGHT - 42;
      const barW = 120;
      const barH = 5;
      const bar = this.add.graphics().setDepth(22);
      bar.fillStyle(0x44ffaa).fillRect(barX, barY, barW, barH);
      this._powerupBar = bar;
      this.tweens.add({
        targets: { v: barW }, v: 0, duration,
        onUpdate: (tw, target) => {
          if (!bar.active) return;
          bar.clear();
          bar.fillStyle(0x44ffaa).fillRect(barX, barY, target.v, barH);
        },
        onComplete: () => {
          if (bar.active) bar.destroy();
          this._powerupBar = null;
        }
      });
    }
  }

  _updateBossBar(ratio) {
    if (!this._bossPhase) this._bossPhase = 0;
    const bw = GAME_WIDTH - 60;
    const bh = 14;
    const bx = 30;
    const by = GAME_HEIGHT - 28;
    this._bossBar.clear();
    this._bossBar.fillStyle(0x330000);
    this._bossBar.fillRect(bx, by, bw, bh);
    this._bossBar.fillStyle(0xff2222);
    this._bossBar.fillRect(bx, by, bw * ratio, bh);
    this._bossBar.lineStyle(1, 0xff6666);
    this._bossBar.strokeRect(bx, by, bw, bh);
    // Phase dividers at 66% and 33%
    this._bossBar.lineStyle(1, 0xffffff, 0.6);
    this._bossBar.beginPath();
    this._bossBar.moveTo(bx + bw * 0.66, by);
    this._bossBar.lineTo(bx + bw * 0.66, by + bh);
    this._bossBar.strokePath();
    this._bossBar.beginPath();
    this._bossBar.moveTo(bx + bw * 0.33, by);
    this._bossBar.lineTo(bx + bw * 0.33, by + bh);
    this._bossBar.strokePath();
    this._bossTxt.setText('BOSS').setAlpha(1);
    // Phase threshold flashes
    const gameCam = this.scene.get('GameScene')?.cameras?.main;
    if (this._bossPhase < 1 && ratio <= 0.66) {
      this._bossPhase = 1;
      if (gameCam) gameCam.flash(150, 255, 100, 100, true);
    }
    if (this._bossPhase < 2 && ratio <= 0.33) {
      this._bossPhase = 2;
      if (gameCam) gameCam.flash(150, 255, 60, 60, true);
    }
  }

  _hideBossBar() {
    this._bossBar.clear();
    this._bossTxt.setText('');
    this._bossPhase = 0;
  }

  shutdown() {
    if (this._pauseBtn) { this._pauseBtn.destroy(); this._pauseBtn = null; }
    if (this._bombBtn)  { this._bombBtn.destroy();  this._bombBtn  = null; }
    const gameScene = this.scene.get('GameScene');
    if (!gameScene?.events) return;
    ['scoreChanged', 'livesChanged', 'powerupActivated', 'bossHealthChanged',
     'bossDefeated', 'bombsChanged', 'levelChanged', 'playerHpChanged',
     'comboChanged', 'comboReset', 'frenzyStart'].forEach(evt => {
      gameScene.events.removeAllListeners(evt);
    });
  }
}
