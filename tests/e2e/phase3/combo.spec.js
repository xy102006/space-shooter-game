import { test, expect } from '@playwright/test';

test('game registry is accessible via window.game', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(2000);
  const hasGame = await page.evaluate(() => typeof window.game !== 'undefined');
  expect(hasGame).toBe(true);
  const fatal = errors.filter(e =>
    !e.includes('loaderror') &&
    !e.includes('Unable to decode audio')
  );
  expect(fatal).toHaveLength(0);
});
