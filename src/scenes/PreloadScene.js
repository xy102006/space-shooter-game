export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  preload() {
    this._createLoadingBar();

    // Backgrounds
    this.load.image('bg-level1', 'assets/backgrounds/bg-level1.png');
    this.load.image('bg-level2', 'assets/backgrounds/bg-level2.png');
    this.load.image('bg-level1-back', 'assets/backgrounds/bg-level1-back.png');
    this.load.image('bg-level1-mid',  'assets/backgrounds/bg-level1-mid.png');
    this.load.image('bg-level2-back', 'assets/backgrounds/bg-level2-back.png');
    this.load.image('bg-level3-0', 'assets/backgrounds/bg-level3-0.png');
    this.load.image('bg-level3-1', 'assets/backgrounds/bg-level3-1.png');
    this.load.image('bg-level3-2', 'assets/backgrounds/bg-level3-2.png');
    this.load.image('bg-level3-3', 'assets/backgrounds/bg-level3-3.png');

    // Player ships — all 4 types, both colors
    // ship-01/03/04: 240x48 (5 frames of 48x48)
    // ship-02: 320x64 (5 frames of 64x64)
    ['01', '03', '04'].forEach(n => {
      this.load.spritesheet(`ship-yellow-${n}`, `assets/sprites/ships/yellow/ship-${n}.png`, { frameWidth: 48, frameHeight: 48 });
      this.load.spritesheet(`ship-red-${n}`, `assets/sprites/ships/red/ship-${n}.png`, { frameWidth: 48, frameHeight: 48 });
    });
    this.load.spritesheet('ship-yellow-02', 'assets/sprites/ships/yellow/ship-02.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('ship-red-02', 'assets/sprites/ships/red/ship-02.png', { frameWidth: 64, frameHeight: 64 });

    // Thrust frames — tiny sprites, load as plain images (too small to animate usefully)
    this.load.image('thrust-01', 'assets/sprites/ships/thrust/ship-01.png');
    this.load.image('thrust-03', 'assets/sprites/ships/thrust/ship-03.png');
    this.load.image('thrust-04', 'assets/sprites/ships/thrust/ship-04.png');

    // Enemies
    // enemy-01: 240x48 → 5 frames of 48x48
    // enemy-02/03: 192x48 → 4 frames of 48x48
    // enemy-explosion: 560x80 → 7 frames of 80x80
    this.load.spritesheet('enemy-01', 'assets/sprites/enemies/enemy-01.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('enemy-02', 'assets/sprites/enemies/enemy-02.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('enemy-03', 'assets/sprites/enemies/enemy-03.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('enemy-explosion', 'assets/sprites/enemies/enemy-explosion.png', { frameWidth: 80, frameHeight: 80 });

    // Boss
    // boss.png: 960x144 → 5 frames of 192x144
    // cannon-left/right: 48x48 → single frame, load as image
    // rays.png: 704x224 → 11 frames of 64x224 (single row)
    this.load.spritesheet('boss-body', 'assets/sprites/boss/boss.png', { frameWidth: 192, frameHeight: 144 });
    this.load.image('boss-cannon-left', 'assets/sprites/boss/cannon-left.png');
    this.load.image('boss-cannon-right', 'assets/sprites/boss/cannon-right.png');
    this.load.spritesheet('boss-rays', 'assets/sprites/boss/rays.png', { frameWidth: 64, frameHeight: 224 });

    // Projectiles & FX
    // bolt.png: 192x32 → 4 frames of 48x32
    // charged.png: 378x48 → 6 frames of 63x48
    // hit.png: 160x32 → 4 frames of 40x32
    // explosion-small.png: 256x32 → 8 frames of 32x32
    // explosion-large.png: 1536x128 → 12 frames of 128x128
    this.load.spritesheet('bullet-bolt', 'assets/sprites/fx/bolt.png', { frameWidth: 48, frameHeight: 32 });
    this.load.spritesheet('bullet-charged', 'assets/sprites/fx/charged.png', { frameWidth: 63, frameHeight: 48 });
    this.load.spritesheet('hit-fx', 'assets/sprites/fx/hit.png', { frameWidth: 40, frameHeight: 32 });
    this.load.spritesheet('explosion-small', 'assets/sprites/fx/explosion-small.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('explosion-large', 'assets/sprites/fx/explosion-large.png', { frameWidth: 128, frameHeight: 128 });

    // Asteroids
    for (let i = 1; i <= 5; i++) {
      this.load.image(`asteroid-0${i}`, `assets/sprites/asteroids/asteroid-0${i}.png`);
    }

    // Audio (null-safe — won't crash if files absent)
    const audioFiles = [
      ['bgm-level1', 'assets/audio/bgm-level1.ogg'],
      ['bgm-level2', 'assets/audio/bgm-level2.ogg'],
      ['bgm-level3', 'assets/audio/bgm-level3.ogg'],
      ['bgm-boss',   'assets/audio/bgm-boss.ogg'],
      ['sfx-shoot',        'assets/audio/sfx-shoot.ogg'],
      ['sfx-explosion',    'assets/audio/sfx-explosion.ogg'],
      ['sfx-explosion-big','assets/audio/sfx-explosion-big.ogg'],
      ['sfx-powerup',      'assets/audio/sfx-powerup.ogg'],
      ['sfx-player-hit',   'assets/audio/sfx-player-hit.ogg'],
      ['sfx-bomb',         'assets/audio/sfx-bomb.ogg']
    ];
    audioFiles.forEach(([key, path]) => {
      this.load.audio(key, path);
    });

    this.load.on('loaderror', (file) => {
      // silently ignore missing audio; other assets will surface real errors
    });
  }

  create() {
    this._registerAnimations();
    this._createPowerupTextures();
    this.scene.start('MainMenuScene');
  }

  _createPowerupTextures() {
    const DEFS = [
      { key: 'powerup-double', fill: 0x4488ff, inner: 0x88bbff },
      { key: 'powerup-spread', fill: 0xff8800, inner: 0xffcc44 },
      { key: 'powerup-shield', fill: 0x00ccff, inner: 0x88eeff },
      { key: 'powerup-speed',  fill: 0x44ff66, inner: 0xaaffcc },
      { key: 'powerup-bomb',   fill: 0xff2244, inner: 0xff8888 },
      { key: 'powerup-health', fill: 0x22cc44, inner: 0x88ffaa },
      { key: 'powerup-burst',  fill: 0xddcc00, inner: 0xffffaa },
      { key: 'powerup-wide',   fill: 0x22aa66, inner: 0x88ffcc }
    ];
    DEFS.forEach(({ key, fill, inner }) => {
      const g = this.add.graphics();
      g.fillStyle(fill, 1.0);
      g.fillCircle(12, 12, 12);
      g.fillStyle(inner, 0.5);
      g.fillCircle(9, 9, 6);
      g.lineStyle(2, 0xffffff, 0.7);
      g.strokeCircle(12, 12, 11);
      g.generateTexture(key, 24, 24);
      g.destroy();
    });
  }

  _createLoadingBar() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    this.add.rectangle(cx, cy - 20, width * 0.7, 24, 0x222244);
    const bar = this.add.rectangle(cx - width * 0.35, cy - 20, 0, 20, 0x44aaff).setOrigin(0, 0.5);
    const label = this.add.text(cx, cy + 16, 'LOADING...', {
      font: '14px monospace', fill: '#aaaacc'
    }).setOrigin(0.5);

    this.load.on('progress', (v) => {
      bar.width = width * 0.7 * v;
      label.setText(`LOADING... ${Math.floor(v * 100)}%`);
    });
  }

  _registerAnimations() {
    const scene = this;

    // Ship idles
    ['01', '02', '03', '04'].forEach(n => {
      ['yellow', 'red'].forEach(color => {
        const key = `ship-${color}-${n}`;
        if (scene.textures.exists(key)) {
          const fc = scene.textures.get(key).frameTotal - 1;
          scene.anims.create({
            key: `${key}-idle`,
            frames: scene.anims.generateFrameNumbers(key, { start: 0, end: fc }),
            frameRate: 8,
            repeat: -1
          });
        }
      });
    });

    // Thrust sprites are plain images (too small for animation frames)

    // Enemies
    ['01', '02', '03'].forEach(n => {
      const key = `enemy-${n}`;
      if (scene.textures.exists(key)) {
        const fc = scene.textures.get(key).frameTotal - 1;
        scene.anims.create({
          key: `enemy-${n}-fly`,
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: fc }),
          frameRate: 8,
          repeat: -1
        });
      }
    });

    if (scene.textures.exists('enemy-explosion')) {
      const fc = scene.textures.get('enemy-explosion').frameTotal - 1;
      scene.anims.create({
        key: 'enemy-explode',
        frames: scene.anims.generateFrameNumbers('enemy-explosion', { start: 0, end: fc }),
        frameRate: 12,
        repeat: 0
      });
    }

    // Boss
    if (scene.textures.exists('boss-body')) {
      const fc = scene.textures.get('boss-body').frameTotal - 1;
      scene.anims.create({ key: 'boss-idle', frames: scene.anims.generateFrameNumbers('boss-body', { start: 0, end: fc }), frameRate: 6, repeat: -1 });
    }
    if (scene.textures.exists('boss-rays')) {
      const fc = scene.textures.get('boss-rays').frameTotal - 1;
      scene.anims.create({ key: 'boss-rays-anim', frames: scene.anims.generateFrameNumbers('boss-rays', { start: 0, end: fc }), frameRate: 12, repeat: -1 });
    }

    // FX
    const fxAnims = [
      { key: 'bullet-bolt', animKey: 'bolt-anim', rate: 12 },
      { key: 'bullet-charged', animKey: 'charged-anim', rate: 10 },
      { key: 'hit-fx', animKey: 'hit-anim', rate: 14, repeat: 0 },
      { key: 'explosion-small', animKey: 'explode-small', rate: 14, repeat: 0 },
      { key: 'explosion-large', animKey: 'explode-large', rate: 10, repeat: 0 }
    ];
    fxAnims.forEach(({ key, animKey, rate, repeat = -1 }) => {
      if (scene.textures.exists(key)) {
        const fc = scene.textures.get(key).frameTotal - 1;
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: fc }),
          frameRate: rate,
          repeat
        });
      }
    });
  }
}
