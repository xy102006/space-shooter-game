import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { scrollSpeedForLayer, bgTextureKey } from '../utils/parallaxConfig.js';

export default class ScrollManager {
  constructor(scene, levelConfig) {
    this.scene = scene;
    this._layers = [];
    this._speeds = [];

    const { level } = levelConfig;

    if (level === 1) {
      this._addLayer(bgTextureKey(1, 0), 0, scrollSpeedForLayer(0)); // bg-level1-back, 0.2x
      this._addLayer(bgTextureKey(1, 1), 1, scrollSpeedForLayer(1)); // bg-level1-mid,  0.5x
      this._addLayer(bgTextureKey(1, 2), 2, scrollSpeedForLayer(2)); // bg-level1,      0.9x
    } else if (level === 2) {
      this._addLayer(bgTextureKey(2, 0), 0, scrollSpeedForLayer(0)); // bg-level2-back, 0.2x
      this._addLayer(bgTextureKey(2, 1), 2, scrollSpeedForLayer(2)); // bg-level2,      0.9x
    } else {
      // Level 3: full 4-layer parallax
      this._addLayer('bg-level3-0', 0, 0.3);
      this._addLayer('bg-level3-1', 1, 0.6);
      this._addLayer('bg-level3-2', 2, 0.9);
      this._addLayer('bg-level3-3', 3, 1.3);
    }
  }

  _addLayer(key, depth, speed) {
    if (!this.scene.textures.exists(key)) {
      const rect = this.scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000011).setOrigin(0).setDepth(depth);
      this._layers.push(rect);
      this._speeds.push(0);
      return;
    }
    const tile = this.scene.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, key)
      .setOrigin(0)
      .setDepth(depth);
    this._layers.push(tile);
    this._speeds.push(speed);
  }

  update(delta) {
    this._layers.forEach((layer, i) => {
      if (layer.tilePositionY !== undefined) {
        layer.tilePositionY += this._speeds[i] * (delta / 16);
      }
    });
  }

  destroy() {
    this._layers.forEach(l => l.destroy());
    this._layers = [];
  }
}
