import { hpBarWidth } from '../../../src/utils/hpBarCalc.js';

describe('hpBarWidth', () => {
  test('full hp = full bar', () => expect(hpBarWidth(3, 3, 24)).toBe(24));
  test('zero hp = 0', () => expect(hpBarWidth(0, 3, 24)).toBe(0));
  test('1/3 hp = 8px', () => expect(hpBarWidth(1, 3, 24)).toBe(8));
  test('2/3 hp = 16px', () => expect(hpBarWidth(2, 3, 24)).toBe(16));
  test('negative hp clamps to 0', () => expect(hpBarWidth(-1, 3, 24)).toBe(0));
  test('maxHp=0 returns 0', () => expect(hpBarWidth(1, 0, 24)).toBe(0));
  test('default barMaxWidth is 24', () => expect(hpBarWidth(3, 3)).toBe(24));
});
