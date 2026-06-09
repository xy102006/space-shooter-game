export function scrollSpeedForLayer(layerIndex) {
  return [0.2, 0.5, 0.9][layerIndex] ?? 0.5;
}

export function bgTextureKey(level, layerIndex) {
  const keys = {
    1: ['bg-level1-back', 'bg-level1-mid', 'bg-level1'],
    2: ['bg-level2-back', 'bg-level2'],
    3: ['bg-level3-0', 'bg-level3-1', 'bg-level3-2', 'bg-level3-3']
  };
  return (keys[level] ?? keys[1])[layerIndex] ?? 'bg-level1';
}
