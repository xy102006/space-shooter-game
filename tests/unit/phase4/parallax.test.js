import { scrollSpeedForLayer, bgTextureKey } from '../../../src/utils/parallaxConfig.js';

describe('scrollSpeedForLayer', () => {
  test('layer 0 = 0.2', () => expect(scrollSpeedForLayer(0)).toBeCloseTo(0.2));
  test('layer 1 = 0.5', () => expect(scrollSpeedForLayer(1)).toBeCloseTo(0.5));
  test('layer 2 = 0.9', () => expect(scrollSpeedForLayer(2)).toBeCloseTo(0.9));
  test('out-of-bounds = 0.5 fallback', () => expect(scrollSpeedForLayer(99)).toBeCloseTo(0.5));
});

describe('bgTextureKey', () => {
  test('L1 layer 0 = bg-level1-back', () => expect(bgTextureKey(1, 0)).toBe('bg-level1-back'));
  test('L1 layer 1 = bg-level1-mid',  () => expect(bgTextureKey(1, 1)).toBe('bg-level1-mid'));
  test('L1 layer 2 = bg-level1',      () => expect(bgTextureKey(1, 2)).toBe('bg-level1'));
  test('L2 layer 0 = bg-level2-back', () => expect(bgTextureKey(2, 0)).toBe('bg-level2-back'));
  test('L2 layer 1 = bg-level2',      () => expect(bgTextureKey(2, 1)).toBe('bg-level2'));
  test('L3 layer 0 = bg-level3-0',    () => expect(bgTextureKey(3, 0)).toBe('bg-level3-0'));
  test('invalid level uses L1 keys',  () => expect(bgTextureKey(99, 0)).toBe('bg-level1-back'));
  test('out-of-bounds layer = bg-level1 fallback', () => expect(bgTextureKey(1, 99)).toBe('bg-level1'));
});
