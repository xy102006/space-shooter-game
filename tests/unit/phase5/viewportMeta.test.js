import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve('./index.html'), 'utf-8');

describe('index.html iOS Safari fixes', () => {
  // Happy paths
  test('viewport meta contains user-scalable=no', () => {
    expect(html).toContain('user-scalable=no');
  });

  test('viewport meta contains maximum-scale=1.0', () => {
    expect(html).toContain('maximum-scale=1.0');
  });

  test('canvas CSS contains touch-action: none', () => {
    expect(html).toContain('touch-action: none');
  });

  // Outlier: exactly one viewport meta tag
  test('viewport meta is not duplicated', () => {
    const matches = html.match(/<meta name="viewport"/g) || [];
    expect(matches).toHaveLength(1);
  });
});
