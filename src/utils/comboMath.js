export function computeMultiplier(streak) {
  if (streak >= 15) return 3.0;
  if (streak >= 10) return 2.0;
  if (streak >= 5)  return 1.5;
  return 1.0;
}

export function isFrenzyStreak(streak, frenzyThreshold = 20) {
  return streak >= frenzyThreshold;
}

export function applyMultiplier(baseScore, streak) {
  return Math.floor(baseScore * computeMultiplier(streak));
}
