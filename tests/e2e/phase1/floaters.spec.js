import { test, expect } from '@playwright/test';

test('no JS errors during 6 seconds of game boot', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible' });
  await page.waitForTimeout(6000);
  const fatal = errors.filter(e => !e.includes('loaderror') && !e.includes('Unable to decode audio'));
  expect(fatal).toHaveLength(0);
});
