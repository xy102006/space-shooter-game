import { GAME_WIDTH } from '../constants.js';
import { thumbOffset } from '../utils/joystickCalc.js';

export default class TouchControls {
  constructor(scene, player) {
    this.scene  = scene;
    this.player = player;

    this._leftId  = null;
    this._rightId = null;
    this._originX = 0;
    this._originY = 0;
    this._velX = 0;
    this._velY = 0;
    this._firing = false;

    player._touchVelX = 0;
    player._touchVelY = 0;
    player._touchFire = false;

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
    if (pointer.x < GAME_WIDTH / 2) {
      if (this._leftId !== null) return;
      this._leftId  = pointer.id;
      this._originX = pointer.x;
      this._originY = pointer.y;
      this._velX = 0;
      this._velY = 0;
    } else {
      if (this._rightId !== null) return;
      this._rightId = pointer.id;
      this._firing  = true;
    }
    this._sync();
  }

  _onMove(pointer) {
    if (pointer.id !== this._leftId) return;
    const dx = pointer.x - this._originX;
    const dy = pointer.y - this._originY;
    const deadzone = 12;
    const speed = this.player.speed;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < deadzone) {
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
    if (pointer.id === this._rightId) {
      this._rightId = null;
      this._firing  = false;
    }
    this._sync();
  }

  _sync() {
    this.player._touchVelX = this._velX;
    this.player._touchVelY = this._velY;
    this.player._touchFire = this._firing;
    this._renderJoystick();
  }

  _renderJoystick() {
    if (!this._drawJoystick) return;
    const g = this._joyGfx;
    g.clear();
    if (this._leftId === null) { g.setAlpha(0); return; }
    g.setAlpha(1);
    // base ring
    g.lineStyle(3, 0xffffff, 0.35);
    g.strokeCircle(this._originX, this._originY, 60);
    // thumb dot
    const { dx, dy } = thumbOffset(this._velX, this._velY, this.player?.speed || 220, 60);
    g.fillStyle(0xffffff, 0.55);
    g.fillCircle(this._originX + dx, this._originY + dy, 25);
  }

  destroy() {
    this.scene.input.off('pointerdown',   this._onDown, this);
    this.scene.input.off('pointermove',   this._onMove, this);
    this.scene.input.off('pointerup',     this._onUp,   this);
    this.scene.input.off('pointercancel', this._onUp,   this);
    if (this._joyGfx) { this._joyGfx.destroy(); this._joyGfx = null; }
  }
}
