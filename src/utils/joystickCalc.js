export function thumbOffset(velX, velY, speed, maxRadius) {
  return {
    dx: (velX / speed) * maxRadius,
    dy: (velY / speed) * maxRadius,
  };
}
