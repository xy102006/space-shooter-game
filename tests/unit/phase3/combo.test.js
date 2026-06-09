import { computeMultiplier, isFrenzyStreak, applyMultiplier } from '../../../src/utils/comboMath.js';

describe('computeMultiplier', () => {
  test('streak 0 = 1.0', () => expect(computeMultiplier(0)).toBe(1.0));
  test('streak 4 = 1.0', () => expect(computeMultiplier(4)).toBe(1.0));
  test('streak 5 = 1.5', () => expect(computeMultiplier(5)).toBe(1.5));
  test('streak 9 = 1.5', () => expect(computeMultiplier(9)).toBe(1.5));
  test('streak 10 = 2.0', () => expect(computeMultiplier(10)).toBe(2.0));
  test('streak 14 = 2.0', () => expect(computeMultiplier(14)).toBe(2.0));
  test('streak 15 = 3.0', () => expect(computeMultiplier(15)).toBe(3.0));
  test('streak 50 = 3.0 (capped)', () => expect(computeMultiplier(50)).toBe(3.0));
});

describe('isFrenzyStreak', () => {
  test('19 is not frenzy', () => expect(isFrenzyStreak(19)).toBe(false));
  test('20 is frenzy', () => expect(isFrenzyStreak(20)).toBe(true));
  test('custom threshold 10: 10 is frenzy', () => expect(isFrenzyStreak(10, 10)).toBe(true));
  test('custom threshold 10: 9 is not', () => expect(isFrenzyStreak(9, 10)).toBe(false));
});

describe('applyMultiplier', () => {
  test('100 at streak 0 = 100', () => expect(applyMultiplier(100, 0)).toBe(100));
  test('100 at streak 5 = 150', () => expect(applyMultiplier(100, 5)).toBe(150));
  test('100 at streak 10 = 200', () => expect(applyMultiplier(100, 10)).toBe(200));
  test('100 at streak 15 = 300', () => expect(applyMultiplier(100, 15)).toBe(300));
  test('75 at streak 5 = 112 (floor)', () => expect(applyMultiplier(75, 5)).toBe(112));
  test('result is always integer', () => expect(Number.isInteger(applyMultiplier(50, 5))).toBe(true));
});
