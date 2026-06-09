export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;
export const PLAYER_MAX_HP = 5;

export const DEPTHS = {
  BG_0: 0,
  BG_1: 1,
  BG_2: 2,
  BG_3: 3,
  ASTEROIDS: 4,
  ENEMY_BULLETS: 5,
  ENEMIES: 6,
  POWERUPS: 7,
  PLAYER: 8,
  PLAYER_BULLETS: 9,
  EXPLOSIONS: 10,
  HUD: 20
};

export const SHIP_CONFIGS = {
  'ship-01': {
    label: 'Balanced',
    description: 'Standard speed & fire rate. Best for beginners.',
    speed: 220,
    fireRate: 280,
    startingWeapon: 'single',
    startingLives: 3,
    startingBombs: 0,
    bulletSpeed: 500,
    hitboxRadius: 10,
    powerupDurationMult: 1.0
  },
  'ship-02': {
    label: 'Tank',
    description: 'Slow but starts with double shot and an extra life.',
    speed: 150,
    fireRate: 400,
    startingWeapon: 'double',
    startingLives: 4,
    startingBombs: 0,
    bulletSpeed: 480,
    hitboxRadius: 13,
    powerupDurationMult: 1.0
  },
  'ship-03': {
    label: 'Bomber',
    description: 'Starts with a bomb. Recharges 1 bomb on every boss kill.',
    speed: 185,
    fireRate: 300,
    startingWeapon: 'single',
    startingLives: 3,
    startingBombs: 1,
    bulletSpeed: 500,
    hitboxRadius: 11,
    powerupDurationMult: 1.0
  },
  'ship-04': {
    label: 'Speedster',
    description: 'Fastest ship. Power-ups last 50% longer.',
    speed: 290,
    fireRate: 200,
    startingWeapon: 'single',
    startingLives: 3,
    startingBombs: 0,
    bulletSpeed: 560,
    hitboxRadius: 8,
    powerupDurationMult: 1.5
  }
};

export const MAX_BOMBS = 3;

export const POWERUP_DURATIONS = {
  double: 10000,
  spread: 10000,
  burst:  null,
  wide:   null,
  shield: 8000,
  speed: 6000,
  bomb: null,
  health: null
};

export const SCORE_VALUES = {
  fighter: 100,
  swarmer: 50,
  turret: 75,
  boss: 2000,
  powerup: 10
};
