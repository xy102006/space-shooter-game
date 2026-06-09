import { computeMultiplier, isFrenzyStreak, applyMultiplier } from '../utils/comboMath.js';

export default class ComboManager {
  constructor(scene) {
    this._scene = scene;
    this._streak = 0;
    this._frenzyActive = false;
  }

  get streak()       { return this._streak; }
  get multiplier()   { return computeMultiplier(this._streak); }
  get frenzyActive() { return this._frenzyActive; }

  recordKill(baseScore) {
    this._streak++;
    const scored = applyMultiplier(baseScore, this._streak);
    this._scene.events.emit('comboChanged', this._streak, computeMultiplier(this._streak));
    if (isFrenzyStreak(this._streak) && !this._frenzyActive) {
      this._frenzyActive = true;
      this._scene.events.emit('frenzyStart');
    }
    return scored;
  }

  onPlayerHit() {
    const wasFrenzy = this._frenzyActive;
    this._streak = 0;
    this._frenzyActive = false;
    this._scene.events.emit('comboReset');
    if (wasFrenzy) this._scene.events.emit('frenzyEnd');
  }

  destroy() {}
}
