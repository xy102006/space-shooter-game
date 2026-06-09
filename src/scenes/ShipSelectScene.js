import { GAME_WIDTH, GAME_HEIGHT, SHIP_CONFIGS } from '../constants.js';

const SHIP_TYPES = ['01', '02', '03', '04'];
const COLORS = ['yellow', 'red'];
const DIFFICULTIES = ['easy', 'normal', 'hard'];
const DIFF_LABELS  = ['EASY', 'NORMAL', 'HARD'];
const DIFF_COLORS  = ['#55ee55', '#ffcc00', '#ff4444'];
const DIFF_DESCS   = [
  'Fewer, slower enemies. Difficulty ramps gradually.',
  'Balanced challenge. Recommend for first run.',
  'Faster, more aggressive enemies from the start.'
];

export default class ShipSelectScene extends Phaser.Scene {
  constructor() { super('ShipSelectScene'); }

  create() {
    this._selectedType       = 0;
    this._selectedColor      = 0;
    this._selectedDifficulty = 1; // default: normal

    if (this.textures.exists('bg-level1')) {
      this._bg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-level1').setOrigin(0);
    } else {
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000011).setOrigin(0);
    }

    const cx = GAME_WIDTH / 2;

    // ── Title ─────────────────────────────────────────────────────────────
    this.add.text(cx, 22, 'SELECT YOUR SHIP', {
      font: 'bold 22px monospace', fill: '#44aaff'
    }).setOrigin(0.5);

    // ── Ship previews ──────────────────────────────────────────────────────
    this._shipPreviews = SHIP_TYPES.map((n, i) => {
      const x = 60 + i * 100;
      const key = `ship-yellow-${n}`;
      const sprite = this.textures.exists(key)
        ? this.add.sprite(x, 175, key, 0).setScale(1.2)
        : this.add.rectangle(x, 175, 24, 24, 0x448888);

      const cfg = SHIP_CONFIGS[`ship-${n}`];
      this.add.text(x, 210, cfg.label, {
        font: '11px monospace', fill: '#aaaacc'
      }).setOrigin(0.5);

      const zone = this.add.zone(x, 175, 80, 80).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => { this._selectedType = i; this._refresh(); });
      return sprite;
    });

    // Selection highlight
    this._highlight = this.add.rectangle(60, 175, 70, 70, 0x44aaff, 0).setStrokeStyle(2, 0x44aaff);

    // ── Color toggle ───────────────────────────────────────────────────────
    this.add.text(cx, 246, 'COLOR:', {
      font: '13px monospace', fill: '#666688'
    }).setOrigin(0.5);

    this._colorBtns = COLORS.map((c, i) => {
      const btn = this.add.text(cx - 50 + i * 100, 268, c.toUpperCase(), {
        font: 'bold 15px monospace',
        fill: i === 0 ? '#ffcc00' : '#ff4444',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => { this._selectedColor = i; this._refresh(); });
      return btn;
    });

    // ── Difficulty selector ────────────────────────────────────────────────
    this.add.text(cx, 300, 'DIFFICULTY:', {
      font: '13px monospace', fill: '#666688'
    }).setOrigin(0.5);

    this._diffBtns = DIFFICULTIES.map((d, i) => {
      const xd = 80 + i * 160;
      const btn = this.add.text(xd, 323, DIFF_LABELS[i], {
        font: 'bold 15px monospace',
        fill: DIFF_COLORS[i],
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => { this._selectedDifficulty = i; this._refresh(); });
      return btn;
    });

    // Difficulty description (changes with selection)
    this._diffDescText = this.add.text(cx, 345, '', {
      font: '11px monospace', fill: '#889aaa', align: 'center', wordWrap: { width: 360 }
    }).setOrigin(0.5);

    // ── Ship stats ─────────────────────────────────────────────────────────
    this._statsText = this.add.text(cx, 378, '', {
      font: '12px monospace', fill: '#ccddff', align: 'center'
    }).setOrigin(0.5);

    this._descText = this.add.text(cx, 408, '', {
      font: '11px monospace', fill: '#889aaa', align: 'center', wordWrap: { width: 360 }
    }).setOrigin(0.5);

    // ── Launch button ──────────────────────────────────────────────────────
    const startBtn = this.add.text(cx, 470, '[ LAUNCH ]', {
      font: 'bold 22px monospace', fill: '#ffffff', stroke: '#004488', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: startBtn, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    startBtn.on('pointerdown', () => this._launch());

    // ── Key bindings ───────────────────────────────────────────────────────
    this.input.keyboard.on('keydown-ENTER', () => this._launch());
    this.input.keyboard.on('keydown-LEFT',  () => { this._selectedType = Math.max(0, this._selectedType - 1); this._refresh(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this._selectedType = Math.min(3, this._selectedType + 1); this._refresh(); });
    this.input.keyboard.on('keydown-C',     () => { this._selectedColor = (this._selectedColor + 1) % 2; this._refresh(); });
    this.input.keyboard.on('keydown-ONE',   () => { this._selectedDifficulty = 0; this._refresh(); });
    this.input.keyboard.on('keydown-TWO',   () => { this._selectedDifficulty = 1; this._refresh(); });
    this.input.keyboard.on('keydown-THREE', () => { this._selectedDifficulty = 2; this._refresh(); });

    this.add.text(cx, GAME_HEIGHT - 14, 'ARROWS — ship   |   C — color   |   1/2/3 — difficulty   |   ENTER — launch', {
      font: '10px monospace', fill: '#445566'
    }).setOrigin(0.5);

    this._refresh();
  }

  _refresh() {
    const n     = SHIP_TYPES[this._selectedType];
    const color = COLORS[this._selectedColor];
    const cfg   = SHIP_CONFIGS[`ship-${n}`];

    // Update previews to current color
    SHIP_TYPES.forEach((type, i) => {
      const k = `ship-${color}-${type}`;
      const sp = this._shipPreviews[i];
      if (this.textures.exists(k) && sp.setTexture) sp.setTexture(k, 0);
    });

    // Highlight selected ship
    this._highlight.setPosition(60 + this._selectedType * 100, 175);

    // Color button opacity
    this._colorBtns.forEach((btn, i) => btn.setAlpha(i === this._selectedColor ? 1.0 : 0.35));

    // Difficulty button opacity + underline effect
    this._diffBtns.forEach((btn, i) => {
      btn.setAlpha(i === this._selectedDifficulty ? 1.0 : 0.35);
      btn.setStyle({ strokeThickness: i === this._selectedDifficulty ? 3 : 1 });
    });
    this._diffDescText.setText(DIFF_DESCS[this._selectedDifficulty]);

    // Ship stats
    this._statsText.setText(
      `Speed: ${cfg.speed}  |  Fire: ${Math.round(1000 / cfg.fireRate)}/s  |  Lives: ${cfg.startingLives}  |  Bombs: ${cfg.startingBombs}`
    );
    this._descText.setText(cfg.description);
  }

  _launch() {
    const n     = SHIP_TYPES[this._selectedType];
    const color = COLORS[this._selectedColor];
    const diff  = DIFFICULTIES[this._selectedDifficulty];

    const shipConfig = {
      type: `ship-${n}`,
      color,
      textureKey: `ship-${color}-${n}`,
      thrustKey: ['01', '03', '04'].includes(n) ? `thrust-${n}` : null,
      ...SHIP_CONFIGS[`ship-${n}`]
    };

    this.scene.start('GameScene', {
      level: 1,
      score: 0,
      lives: shipConfig.startingLives,
      bombs: shipConfig.startingBombs,
      difficulty: diff,
      shipConfig
    });
  }

  update() {
    if (this._bg) this._bg.tilePositionY -= 0.4;
  }
}
