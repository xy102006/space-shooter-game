export function computeKnockback(fromX, fromY, playerX, playerY, distance = 30, duration = 0.2) {
  const dx = playerX - fromX;
  const dy = playerY - fromY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = distance / duration;
  return { vx: (dx / len) * speed, vy: (dy / len) * speed };
}
