import { GAME_WIDTH } from '../constants.js';
import { thumbOffset } from '../utils/joystickCalc.js';

// Bottom-right exclusion zone — taps here go to the BOMB button, not the joystick
const BOMB_ZONE_X = 360;
const BOMB_ZONE_Y = 520;

function inBombZone(x, y) {
  return x >= BOMB_ZONE_X && y >= BOMB_ZONE_Y;
}

export default class TouchControls {
  constructor(scene, player) {
    this.scene  = scene;
    this.player = player;

    this._leftId  = null;
    this._originX = 0;
    this._originY = 0;
    this._velX = 0;
    this._velY = 0;

    player._touchVelX = 0;
    player._touchVelY = 0;
    player._autoFire  = false;

    scene.input.on('pointerdown',   this._onDown,  this);
    scene.input.on('pointermove',   this._onMove,  this);
    scene.input.on('pointerup',     this._onUp,    this);
    scene.input.on('pointercancel', this._onUp,    this);

    this._drawJoystick = scene.sys.game.device.input.touch;
    if (this._drawJoystick) {
      this._joyGfx = scene.add.graphics().setDepth(50).setAlpha(0);
    }
  }

  _onDown(pointer) {
    if (inBombZone(pointer.x, pointer.y)) return;
    if (this._leftId !== null) return;
    this._leftId  = pointer.id;
    this._originX = pointer.x;
    this._originY = pointer.y;
    this._velX = 0;
    this._velY = 0;
    this._sync();
  }

  _onMove(pointer) {
    if (pointer.id !== this._leftId) return;
    const dx = pointer.x - this._originX;
    const dy = pointer.y - this._originY;
    const speed = this.player.speed;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 12) {
      this._velX = 0;
      this._velY = 0;
    } else {
      const clamped = Math.min(len, 60);
      this._velX = (dx / len) * speed * (clamped / 60);
      this._velY = (dy / len) * speed * (clamped / 60);
    }
    this._sync();
  }

  _onUp(pointer) {
    if (pointer.id === this._leftId) {
      this._leftId = null;
      this._velX   = 0;
      this._velY   = 0;
    }
    this._sync();
  }

  _sync() {
    this.player._touchVelX = this._velX;
    this.player._touchVelY = this._velY;
    this.player._autoFire  = (this._leftId !== null);
    this._renderJoystick();
  }

  _renderJoystick() {
    if (!this._drawJoystick) return;
    const g = this._joyGfx;
    g.clear();
    if (this._leftId === null) { g.setAlpha(0); return; }
    g.setAlpha(1);
    g.lineStyle(4, 0xffffff, 0.4);
    g.strokeCircle(this._originX, this._originY, 70);
    const { dx, dy } = thumbOffset(this._velX, this._velY, this.player?.speed || 220, 70);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(this._originX + dx, this._originY + dy, 30);
  }

  destroy() {
    this.scene.input.off('pointerdown',   this._onDown, this);
    this.scene.input.off('pointermove',   this._onMove, this);
    this.scene.input.off('pointerup',     this._onUp,   this);
    this.scene.input.off('pointercancel', this._onUp,   this);
    if (this._joyGfx) { this._joyGfx.destroy(); this._joyGfx = null; }
  }
}
