import { thumbOffset } from '../../../src/utils/joystickCalc.js';

describe('thumbOffset', () => {
  // Happy paths
  test('full right velocity maps to maxRadius', () => {
    const { dx, dy } = thumbOffset(220, 0, 220, 60);
    expect(dx).toBe(60);
    expect(dy).toBe(0);
  });

  test('full down velocity maps to maxRadius', () => {
    const { dx, dy } = thumbOffset(0, 220, 220, 60);
    expect(dx).toBe(0);
    expect(dy).toBe(60);
  });

  test('zero velocity stays at origin', () => {
    const { dx, dy } = thumbOffset(0, 0, 220, 60);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  test('half velocity maps to half radius', () => {
    const { dx, dy } = thumbOffset(110, 0, 220, 60);
    expect(dx).toBeCloseTo(30);
    expect(dy).toBe(0);
  });

  // Outliers
  test('negative velocity maps to negative offset (left movement)', () => {
    const { dx } = thumbOffset(-220, 0, 220, 60);
    expect(dx).toBe(-60);
  });

  test('diagonal half-speed maps correctly', () => {
    const { dx, dy } = thumbOffset(110, 110, 220, 60);
    expect(dx).toBeCloseTo(30);
    expect(dy).toBeCloseTo(30);
  });

  test('different maxRadius scales correctly', () => {
    const { dx } = thumbOffset(220, 0, 220, 80);
    expect(dx).toBe(80);
  });
});
