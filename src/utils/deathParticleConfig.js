const CONFIGS = {
  swarmer: { quantity: 15, tint: [0xffffff, 0x4488ff, 0x88ccff], lifespan: 300 },
  fighter: { quantity: 15, tint: [0xff6600, 0xff2200, 0xffaa00], lifespan: 350 },
  turret:  { quantity: 15, tint: [0xffcc00, 0xff8800, 0xffffff], lifespan: 400 },
};
const FALLBACK = CONFIGS.fighter;

export function deathParticleConfig(enemyType) {
  return CONFIGS[enemyType] ?? FALLBACK;
}
