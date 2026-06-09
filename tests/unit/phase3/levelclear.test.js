import { computeAccuracy } from '../../../src/utils/statsCalc.js';

describe('computeAccuracy', () => {
  test('50 shots, 15 kills = 30%', () => expect(computeAccuracy(50, 15)).toBe(30));
  test('0 shots = 0', () => expect(computeAccuracy(0, 0)).toBe(0));
  test('10 shots, 10 kills = 100%', () => expect(computeAccuracy(10, 10)).toBe(100));
  test('10 shots, 11 kills clamps to 100%', () => expect(computeAccuracy(10, 11)).toBe(100));
  test('100 shots, 1 kill = 1%', () => expect(computeAccuracy(100, 1)).toBe(1));
  test('3 shots, 1 kill = 33%', () => expect(computeAccuracy(3, 1)).toBe(33));
  test('0 kills = 0%', () => expect(computeAccuracy(100, 0)).toBe(0));
});
