export function hpBarWidth(hp, maxHp, barMaxWidth = 24) {
  if (maxHp <= 0) return 0;
  return Math.max(0, Math.floor((hp / maxHp) * barMaxWidth));
}
