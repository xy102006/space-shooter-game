import { deathParticleConfig } from '../../../src/utils/deathParticleConfig.js';

describe('deathParticleConfig', () => {
  test('swarmer: 15 particles, blue tints', () => {
    const cfg = deathParticleConfig('swarmer');
    expect(cfg.quantity).toBe(15);
    expect(cfg.tint).toContain(0x4488ff);
  });
  test('fighter: 15 particles, orange tints', () => {
    const cfg = deathParticleConfig('fighter');
    expect(cfg.quantity).toBe(15);
    expect(cfg.tint).toContain(0xff6600);
  });
  test('turret: 15 particles, yellow tints', () => {
    const cfg = deathParticleConfig('turret');
    expect(cfg.quantity).toBe(15);
    expect(cfg.tint).toContain(0xffcc00);
  });
  test('unknown type: falls back with 15 particles', () => {
    const cfg = deathParticleConfig('unknown');
    expect(cfg.quantity).toBe(15);
  });
});
