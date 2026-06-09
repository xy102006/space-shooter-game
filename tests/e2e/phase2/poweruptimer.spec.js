import { test, expect } from '@playwright/test';

test('game boots without fatal errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(3000);
  const fatal = errors.filter(e =>
    !e.includes('loaderror') &&
    !e.includes('Unable to decode audio')
  );
  expect(fatal).toHaveLength(0);
});
