import { test, expect } from '@playwright/test';

test('12 seconds of gameplay with no fatal JS errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(12000);
  const fatal = errors.filter(e =>
    !e.includes('loaderror') &&
    !e.includes('Unable to decode audio')
  );
  expect(fatal).toHaveLength(0);
});
