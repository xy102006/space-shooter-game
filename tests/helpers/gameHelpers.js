export async function startGameAtLevel(page, level = 1) {
  await page.goto('/');
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1500);
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(500);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(1000);
}

export async function getRegistryValue(page, key) {
  return page.evaluate((k) => window.game?.registry?.get(k), key);
}
