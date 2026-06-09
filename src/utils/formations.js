export function computeFormationX(idx, total, formation, gameWidth = 480, margin = 50) {
  const range = gameWidth - margin * 2;
  switch (formation) {
    case 'line':
      return margin + (total === 1 ? range / 2 : (idx / (total - 1)) * range);
    case 'V': {
      const half = Math.ceil(total / 2);
      if (idx < half) return gameWidth / 2 - 20 - (half - idx - 1) * 38;
      return gameWidth / 2 + 20 + (idx - half) * 38;
    }
    case 'arc': {
      const angle = (20 + (total > 1 ? (140 / (total - 1)) * idx : 70)) * (Math.PI / 180);
      return gameWidth / 2 + Math.cos(angle - Math.PI / 2) * 190;
    }
    case 'pincer':
      return computePincerX(idx, total, gameWidth);
    case 'diamond': {
      const { x } = computeDiamondOffset(idx, total, 120);
      return gameWidth / 2 + x;
    }
    default:
      return margin + Math.floor(Math.random() * range);
  }
}

export function computePincerX(idx, total, gameWidth = 480) {
  const half = Math.ceil(total / 2);
  const isLeft = idx < half;
  const localIdx = isLeft ? idx : idx - half;
  const localTotal = isLeft ? half : total - half;
  const quarterWidth = gameWidth * 0.25;
  const spread = quarterWidth / (localTotal + 1);
  return isLeft
    ? quarterWidth - spread * (localIdx + 1)
    : gameWidth - quarterWidth + spread * (localIdx + 1);
}

export function computeDiamondOffset(idx, total, radius = 120) {
  if (idx < 4) {
    const angle = (Math.PI / 2) * idx - Math.PI / 2;
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  }
  const innerIdx = idx - 4;
  const innerTotal = (total - 4) || 1;
  const angle = (2 * Math.PI / innerTotal) * innerIdx;
  return { x: Math.cos(angle) * (radius / 2), y: Math.sin(angle) * (radius / 2) };
}
