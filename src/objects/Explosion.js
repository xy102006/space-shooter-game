import { particleCountForSize, burstDelayForSize, lifespanForSize } from '../utils/explosionConfig.js';

export function spawnExplosion(scene, x, y, size = 'small') {
  // Sprite animation (existing)
  const animKey    = size === 'large' ? 'explode-large' : 'explode-small';
  const textureKey = size === 'large' ? 'explosion-large' : 'explosion-small';

  if (scene.textures.exists(textureKey)) {
    const sprite = scene.add.sprite(x, y, textureKey).setDepth(10);
    if (size === 'large')  sprite.setScale(1.5);
    if (size === 'medium') sprite.setScale(1.2);
    if (scene.anims.exists(animKey)) {
      sprite.play(animKey);
      sprite.once('animationcomplete', () => sprite.destroy());
    } else {
      scene.time.delayedCall(300, () => sprite.destroy());
    }
  } else {
    const radius = size === 'large' ? 40 : (size === 'medium' ? 22 : 16);
    const g = scene.add.graphics().setDepth(10);
    g.fillStyle(0xff8800, 0.9).fillCircle(x, y, radius);
    scene.time.delayedCall(200, () => g.destroy());
  }

  // Particle burst (new)
  const count    = particleCountForSize(size);
  const lifespan = lifespanForSize(size);
  const delay    = burstDelayForSize(size);

  const emit = (px, py, qty) => {
    const em = scene.add.particles(px, py, 'particle-dot', {
      speed:    { min: 60, max: 140 },
      scale:    { start: 1.2, end: 0 },
      alpha:    { start: 0.9, end: 0 },
      tint:     [0xff6600, 0xff2200, 0xffaa00, 0xffffff],
      lifespan, quantity: qty, frequency: -1, depth: 20
    });
    em.explode(qty, px, py);
    scene.time.delayedCall(lifespan.max + 100, () => { if (em.active) em.destroy(); });
  };

  emit(x, y, count);
  if (delay > 0) {
    scene.time.delayedCall(delay, () => emit(x, y, Math.floor(count * 0.6)));
  }
}
