import { test, expect } from '@playwright/test';
import { startGameAtLevel } from '../../helpers/gameHelpers.js';

async function getCanvasScale(page) {
  const box = await page.locator('canvas').boundingBox();
  return { box, scaleX: box.width / 480, scaleY: box.height / 640 };
}

// ─── MOBILE CONTEXT ───────────────────────────────────────────────────────────
test.describe('touch controls — mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  // HAPPY PATH 1: BOMB button exists in HUDScene
  test('BOMB button is active in HUDScene on touch device', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const hasBombBtn = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      return hud?._bombBtn?.active === true;
    });
    expect(hasBombBtn).toBe(true);

    const fatal = errors.filter(e => !e.includes('loaderror') && !e.includes('Unable to decode audio'));
    expect(fatal).toHaveLength(0);
  });

  // HAPPY PATH 2: PAUSE button exists in HUDScene
  test('PAUSE button is active in HUDScene on touch device', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const hasPauseBtn = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      return hud?._pauseBtn?.active === true;
    });
    expect(hasPauseBtn).toBe(true);
  });

  // HAPPY PATH 3: Joystick graphics object starts hidden
  test('joystick graphics object created and initially hidden', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const joyAlpha = await page.evaluate(() => {
      const gs = window.game?.scene?.getScene('GameScene');
      return gs?._touchControls?._joyGfx?.alpha ?? -1;
    });
    expect(joyAlpha).toBe(0);
  });

  // HAPPY PATH 4: Joystick appears on left-half touch
  test('joystick appears when left half of canvas is touched', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);

    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + 100 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 1, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);

    const joyAlpha = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._joyGfx?.alpha ?? -1;
    });
    expect(joyAlpha).toBe(1);

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 100 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 1, pointerType: 'touch', bubbles: true,
    });
  });

  // HAPPY PATH 5: Joystick hides when finger lifts
  test('joystick hides when finger is lifted', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);
    const cx = box.x + 100 * scaleX;
    const cy = box.y + 400 * scaleY;

    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: cx, clientY: cy, pointerId: 1, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: cx, clientY: cy, pointerId: 1, pointerType: 'touch', bubbles: true,
    });
    await page.waitForTimeout(100);

    const joyAlpha = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._joyGfx?.alpha ?? -1;
    });
    expect(joyAlpha).toBe(0);
  });

  // HAPPY PATH 6: Tap PAUSE button launches PauseScene
  test('tapping PAUSE button launches PauseScene', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);
    await page.touchscreen.tap(box.x + 468 * scaleX, box.y + 10 * scaleY);
    await page.waitForTimeout(400);

    const isPaused = await page.evaluate(() => {
      return window.game?.scene?.isActive('PauseScene') === true;
    });
    expect(isPaused).toBe(true);
  });

  // OUTLIER 1: BOMB button dimmed when bomb count is 0
  test('BOMB button is dimmed when bomb count is 0', async ({ page }) => {
    await startGameAtLevel(page); // default ship = Balanced (0 bombs)
    await page.waitForTimeout(800);

    const result = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      const bombs = window.game?.registry?.get('bombs');
      return { alpha: hud?._bombBtn?.alpha, bombs };
    });

    expect(result.bombs).toBe(0);
    expect(result.alpha).toBeCloseTo(0.35, 1);
  });

  // OUTLIER 2: Right-half touch does NOT show joystick
  test('joystick does not appear when right half is touched', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);

    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + 350 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 2, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);

    const joyAlpha = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._joyGfx?.alpha ?? -1;
    });
    expect(joyAlpha).toBe(0);

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 350 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 2, pointerType: 'touch', bubbles: true,
    });
  });
});

// ─── DESKTOP CONTEXT ──────────────────────────────────────────────────────────
test.describe('touch controls — desktop viewport (no touch)', () => {
  test.use({ viewport: { width: 1280, height: 720 }, hasTouch: false });

  // OUTLIER 3: No touch buttons on desktop
  test('BOMB and PAUSE touch buttons are absent on desktop', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const result = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      return {
        hasBombBtn:  hud?._bombBtn  != null,
        hasPauseBtn: hud?._pauseBtn != null,
      };
    });

    expect(result.hasBombBtn).toBe(false);
    expect(result.hasPauseBtn).toBe(false);
  });

  // OUTLIER 4: Joystick graphics object absent on desktop
  test('joystick graphics object is not created on desktop', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const hasJoyGfx = await page.evaluate(() => {
      const gs = window.game?.scene?.getScene('GameScene');
      return gs?._touchControls?._joyGfx != null;
    });
    expect(hasJoyGfx).toBe(false);
  });
});
