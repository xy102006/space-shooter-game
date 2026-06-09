export function computeAccuracy(shotsFired, kills) {
  if (shotsFired <= 0) return 0;
  return Math.min(100, Math.round((kills / shotsFired) * 100));
}
