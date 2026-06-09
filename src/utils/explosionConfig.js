export function particleCountForSize(size) {
  if (size === 'large')  return 25;
  if (size === 'medium') return 14;
  return 10;
}

export function burstDelayForSize(size) {
  return size === 'large' ? 200 : 0;
}

export function lifespanForSize(size) {
  if (size === 'large')  return { min: 300, max: 500 };
  if (size === 'medium') return { min: 200, max: 350 };
  return { min: 200, max: 400 };
}
