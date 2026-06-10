import { test, expect } from '@playwright/test';
import { startGameAtLevel } from '../../helpers/gameHelpers.js';

async function getCanvasScale(page) {
  const box = await page.locator('canvas').boundingBox();
  return { box, scaleX: box.width / 480, scaleY: box.height / 640 };
}

// ─── MOBILE CONTEXT ───────────────────────────────────────────────────────────
test.describe('touch controls — mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  // HAPPY PATH 1: BOMB button exists
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

  // HAPPY PATH 2: PAUSE button exists
  test('PAUSE button is active in HUDScene on touch device', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const hasPauseBtn = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      return hud?._pauseBtn?.active === true;
    });
    expect(hasPauseBtn).toBe(true);
  });

  // HAPPY PATH 3: Joystick graphic absent before first touch (lazy creation)
  test('joystick graphics object is null before first touch', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const hasJoyGfx = await page.evaluate(() => {
      const gs = window.game?.scene?.getScene('GameScene');
      return gs?._touchControls?._joyGfx != null;
    });
    // Lazy: graphics object created only on first touch event, not at construction
    expect(hasJoyGfx).toBe(false);
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

  // HAPPY PATH 5: Right half ALSO activates joystick (full-screen)
  test('right half of screen also activates joystick', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);

    // Touch at game coord ~(350, 300) — right side, not bomb zone
    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + 350 * scaleX,
      clientY: box.y + 300 * scaleY,
      pointerId: 1, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);

    const joyAlpha = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._joyGfx?.alpha ?? -1;
    });
    expect(joyAlpha).toBe(1); // full-screen joystick — right side activates too

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 350 * scaleX,
      clientY: box.y + 300 * scaleY,
      pointerId: 1, pointerType: 'touch', bubbles: true,
    });
  });

  // HAPPY PATH 6: Auto-fire activates when joystick is held
  test('_autoFire is true while joystick is held', async ({ page }) => {
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

    const autoFireOn = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._player?._autoFire === true;
    });
    expect(autoFireOn).toBe(true);

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 100 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 1, pointerType: 'touch', bubbles: true,
    });
  });

  // HAPPY PATH 7: Auto-fire stops when finger lifts
  test('_autoFire is false after joystick is released', async ({ page }) => {
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

    const autoFireOff = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._player?._autoFire === false;
    });
    expect(autoFireOff).toBe(true);
  });

  // HAPPY PATH 8: Joystick hides when finger lifts
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

  // HAPPY PATH 9: Tap PAUSE button launches PauseScene
  test('tapping PAUSE button launches PauseScene', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);
    await page.touchscreen.tap(box.x + 460 * scaleX, box.y + 14 * scaleY);
    await page.waitForTimeout(400);

    const isPaused = await page.evaluate(() => {
      return window.game?.scene?.isActive('PauseScene') === true;
    });
    expect(isPaused).toBe(true);
  });

  // OUTLIER 1: BOMB zone does NOT activate joystick
  test('touching bomb zone does not activate joystick', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const { box, scaleX, scaleY } = await getCanvasScale(page);

    // Touch inside bomb zone: game coord (420, 570)
    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + 420 * scaleX,
      clientY: box.y + 570 * scaleY,
      pointerId: 1, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);

    const leftId = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._leftId;
    });
    expect(leftId).toBeNull(); // joystick did NOT activate

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 420 * scaleX,
      clientY: box.y + 570 * scaleY,
      pointerId: 1, pointerType: 'touch', bubbles: true,
    });
  });

  // HAPPY PATH 10: Joystick and BOMB both work after Level 2 transition
  test('joystick and BOMB button work in Level 2 after scene restart', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    // Simulate LevelClearScene → Level 2 transition programmatically
    await page.evaluate(() => {
      const gs = window.game?.scene?.getScene('GameScene');
      const sc = gs?._player?.shipConfig;
      window.game.scene.stop('HUDScene');
      window.game.scene.start('GameScene', {
        level: 2, score: 0, lives: 3, bombs: 2,
        difficulty: 'normal', shipConfig: sc,
      });
    });
    await page.waitForTimeout(1200); // wait for Level 2 create() and HUDScene relaunch

    // Verify _touchControls exists in Level 2
    const hasTouchControls = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls != null;
    });
    expect(hasTouchControls).toBe(true);

    // Verify joystick activates on touch
    const { box, scaleX, scaleY } = await getCanvasScale(page);
    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + 100 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 1, pointerType: 'touch',
      isPrimary: true, pressure: 1, bubbles: true, cancelable: true,
    });
    await page.waitForTimeout(100);

    const leftIdSet = await page.evaluate(() => {
      return window.game?.scene?.getScene('GameScene')?._touchControls?._leftId != null;
    });
    expect(leftIdSet).toBe(true);

    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + 100 * scaleX,
      clientY: box.y + 400 * scaleY,
      pointerId: 1, pointerType: 'touch', bubbles: true,
    });

    // Verify BOMB button exists in Level 2 HUD
    const hasBombBtn = await page.evaluate(() => {
      return window.game?.scene?.getScene('HUDScene')?._bombBtn?.active === true;
    });
    expect(hasBombBtn).toBe(true);
  });

  // OUTLIER 2: BOMB button dimmed when bomb count is 0
  test('BOMB button is dimmed when bomb count is 0', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const result = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      const bombs = window.game?.registry?.get('bombs');
      return { alpha: hud?._bombBtn?.alpha, bombs };
    });

    expect(result.bombs).toBe(0);
    expect(result.alpha).toBeCloseTo(0.3, 1);
  });
});

// ─── DESKTOP CONTEXT ──────────────────────────────────────────────────────────
test.describe('touch controls — desktop viewport (no touch)', () => {
  test.use({ viewport: { width: 1280, height: 720 }, hasTouch: false });

  // OUTLIER 3: Buttons exist on desktop too (always created, keyboard users can ignore them)
  test('BOMB and PAUSE buttons exist on desktop', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    const result = await page.evaluate(() => {
      const hud = window.game?.scene?.getScene('HUDScene');
      return {
        hasBombBtn:  hud?._bombBtn  != null,
        hasPauseBtn: hud?._pauseBtn != null,
      };
    });

    expect(result.hasBombBtn).toBe(true);
    expect(result.hasPauseBtn).toBe(true);
  });

  // OUTLIER 4: Joystick graphics absent on desktop (mouse pointer filtered, lazy never triggers)
  test('joystick graphics object is not created on desktop after mouse click', async ({ page }) => {
    await startGameAtLevel(page);
    await page.waitForTimeout(800);

    // Simulate a desktop mouse click — should NOT activate the joystick
    const box = await page.locator('canvas').boundingBox();
    await page.locator('canvas').dispatchEvent('pointerdown', {
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
      pointerId: 1, pointerType: 'mouse',
      isPrimary: true, pressure: 0.5, bubbles: true,
    });
    await page.waitForTimeout(100);
    await page.locator('canvas').dispatchEvent('pointerup', {
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
      pointerId: 1, pointerType: 'mouse', bubbles: true,
    });

    const hasJoyGfx = await page.evaluate(() => {
      const gs = window.game?.scene?.getScene('GameScene');
      return gs?._touchControls?._joyGfx != null;
    });
    expect(hasJoyGfx).toBe(false);
  });
});
