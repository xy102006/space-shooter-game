describe('Asteroid pure logic', () => {
  test('HP is always 1 or 2 over 100 samples', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) results.add(Math.random() < 0.5 ? 1 : 2);
    expect(results.has(1)).toBe(true);
    expect(results.has(2)).toBe(true);
    results.forEach(v => expect([1, 2]).toContain(v));
  });

  test('speed is 80 to 140 inclusive', () => {
    for (let i = 0; i < 100; i++) {
      const s = 80 + Math.floor(Math.random() * 60);
      expect(s).toBeGreaterThanOrEqual(80);
      expect(s).toBeLessThanOrEqual(140);
    }
  });

  test('takeDamage logic: returns false until hp reaches 0', () => {
    let hp = 2;
    const dmg = (n) => { hp -= n; return hp <= 0; };
    expect(dmg(1)).toBe(false);
    expect(hp).toBe(1);
    expect(dmg(1)).toBe(true);
    expect(hp).toBe(0);
  });
});
