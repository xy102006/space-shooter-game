describe('Score ticker lerp math', () => {
  const lerp = (start, end, t) => Math.round(start + (end - start) * t);
  test('t=0 returns start', () => expect(lerp(0, 200, 0)).toBe(0));
  test('t=1 returns end', () => expect(lerp(0, 200, 1)).toBe(200));
  test('t=0.5 returns midpoint', () => expect(lerp(0, 200, 0.5)).toBe(100));
  test('result is always integer', () => expect(Number.isInteger(lerp(0, 150, 0.33))).toBe(true));
  test('counting up: start < end', () => {
    for (let t = 0; t <= 1; t += 0.1) {
      expect(lerp(0, 100, t)).toBeGreaterThanOrEqual(0);
      expect(lerp(0, 100, t)).toBeLessThanOrEqual(100);
    }
  });
});
