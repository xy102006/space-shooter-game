import { particleCountForSize, burstDelayForSize, lifespanForSize } from '../../../src/utils/explosionConfig.js';

describe('particleCountForSize', () => {
  test('small = 10', () => expect(particleCountForSize('small')).toBe(10));
  test('medium = 14', () => expect(particleCountForSize('medium')).toBe(14));
  test('large = 25', () => expect(particleCountForSize('large')).toBe(25));
  test('unknown defaults to small (10)', () => expect(particleCountForSize('xyz')).toBe(10));
});

describe('burstDelayForSize', () => {
  test('small = 0', () => expect(burstDelayForSize('small')).toBe(0));
  test('medium = 0', () => expect(burstDelayForSize('medium')).toBe(0));
  test('large = 200', () => expect(burstDelayForSize('large')).toBe(200));
});

describe('lifespanForSize', () => {
  test('small: min 200, max 400', () => {
    const l = lifespanForSize('small');
    expect(l.min).toBe(200); expect(l.max).toBe(400);
  });
  test('medium: min 200, max 350', () => {
    const l = lifespanForSize('medium');
    expect(l.min).toBe(200); expect(l.max).toBe(350);
  });
  test('large: min 300, max 500', () => {
    const l = lifespanForSize('large');
    expect(l.min).toBe(300); expect(l.max).toBe(500);
  });
  test('min <= max for all sizes', () => {
    ['small', 'medium', 'large'].forEach(s => {
      const l = lifespanForSize(s);
      expect(l.min).toBeLessThanOrEqual(l.max);
    });
  });
});
