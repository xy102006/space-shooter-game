import { computeFormationX, computePincerX, computeDiamondOffset } from '../../../src/utils/formations.js';

const W = 480, M = 50;

describe('line formation', () => {
  test('idx=0 of 3 at left margin', () => expect(computeFormationX(0, 3, 'line', W, M)).toBeCloseTo(M));
  test('idx=2 of 3 at right margin', () => expect(computeFormationX(2, 3, 'line', W, M)).toBeCloseTo(W - M));
  test('idx=1 of 3 at center', () => expect(computeFormationX(1, 3, 'line', W, M)).toBeCloseTo(W / 2));
});

describe('V formation', () => {
  test('first half left of center', () => expect(computeFormationX(0, 4, 'V', W, M)).toBeLessThan(W / 2));
  test('second half right of center', () => expect(computeFormationX(3, 4, 'V', W, M)).toBeGreaterThan(W / 2));
});

describe('arc formation', () => {
  test('5 positions within game bounds', () => {
    for (let i = 0; i < 5; i++) {
      const x = computeFormationX(i, 5, 'arc', W, M);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(W);
    }
  });
});

describe('random formation', () => {
  test('stays within bounds over 20 samples', () => {
    for (let i = 0; i < 20; i++) {
      const x = computeFormationX(0, 1, 'random', W, M);
      expect(x).toBeGreaterThanOrEqual(M - 1);
      expect(x).toBeLessThan(W - M);
    }
  });
});

describe('computePincerX', () => {
  test('idx 0,1 in left half', () => {
    expect(computePincerX(0, 4, W)).toBeLessThan(W / 2);
    expect(computePincerX(1, 4, W)).toBeLessThan(W / 2);
  });
  test('idx 2,3 in right half', () => {
    expect(computePincerX(2, 4, W)).toBeGreaterThan(W / 2);
    expect(computePincerX(3, 4, W)).toBeGreaterThan(W / 2);
  });
  test('left entries in left quarter', () => expect(computePincerX(0, 4, W)).toBeLessThan(W * 0.3));
  test('right entries in right quarter', () => expect(computePincerX(3, 4, W)).toBeGreaterThan(W * 0.7));
});

describe('computeDiamondOffset', () => {
  test('first 4 are at exact radius', () => {
    for (let i = 0; i < 4; i++) {
      const { x, y } = computeDiamondOffset(i, 4, 120);
      expect(Math.sqrt(x * x + y * y)).toBeCloseTo(120, 5);
    }
  });
  test('idx=0 top (y = -120)', () => {
    const { y } = computeDiamondOffset(0, 4, 120);
    expect(y).toBeCloseTo(-120, 1);
  });
  test('idx=1 right (x = +120)', () => {
    const { x } = computeDiamondOffset(1, 4, 120);
    expect(x).toBeCloseTo(120, 1);
  });
  test('5th enemy inner ring (dist < radius)', () => {
    const { x, y } = computeDiamondOffset(4, 8, 120);
    expect(Math.sqrt(x * x + y * y)).toBeLessThan(120);
  });
});
