import { computeKnockback } from '../../../src/utils/knockbackCalc.js';

describe('computeKnockback', () => {
  test('hit from left pushes player right', () => {
    const r = computeKnockback(0, 240, 100, 240);
    expect(r.vx).toBeGreaterThan(0);
    expect(r.vy).toBeCloseTo(0, 1);
  });
  test('hit from above pushes player down', () => {
    const r = computeKnockback(240, 0, 240, 320);
    expect(r.vy).toBeGreaterThan(0);
    expect(r.vx).toBeCloseTo(0, 1);
  });
  test('magnitude = distance / duration', () => {
    const r = computeKnockback(0, 0, 0, 100, 30, 0.2);
    const mag = Math.sqrt(r.vx * r.vx + r.vy * r.vy);
    expect(mag).toBeCloseTo(150, 1);
  });
  test('same position: no NaN', () => {
    const r = computeKnockback(240, 320, 240, 320);
    expect(isFinite(r.vx)).toBe(true);
    expect(isFinite(r.vy)).toBe(true);
  });
  test('diagonal 45 degrees: vx equals vy', () => {
    const r = computeKnockback(0, 0, 100, 100);
    expect(Math.abs(r.vx - r.vy)).toBeLessThan(0.01);
  });
});
