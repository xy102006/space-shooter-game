import { POWERUP_DURATIONS, MAX_BOMBS } from '../constants.js';

export default class PowerupManager {
  constructor(scene, player) {
    this.scene  = scene;
    this.player = player;
    this._timers = {};

    scene.events.on('powerupCollected', (type) => this._apply(type), this);
  }

  _apply(type) {
    const { scene, player } = this;
    const cfg  = player.shipConfig;
    const mult = cfg?.powerupDurationMult || 1.0;

    // Weapon modes are mutually exclusive — cancel all weapon timers
    if (type === 'double' || type === 'spread' || type === 'burst' || type === 'wide') {
      ['double', 'spread', 'burst', 'wide'].forEach(t => this._cancelTimer(t));
    } else {
      this._cancelTimer(type);
    }

    const duration = (POWERUP_DURATIONS[type] || 8000) * mult;

    switch (type) {
      case 'double':
        ['double', 'spread', 'burst', 'wide'].forEach(t => this._cancelTimer(t));
        player.setWeaponMode('double');
        break;

      case 'spread':
        ['double', 'spread', 'burst', 'wide'].forEach(t => this._cancelTimer(t));
        player.setWeaponMode('spread');
        break;

      case 'burst':
        ['double', 'spread', 'burst', 'wide'].forEach(t => this._cancelTimer(t));
        player.setWeaponMode('burst');
        break;

      case 'wide':
        ['double', 'spread', 'burst', 'wide'].forEach(t => this._cancelTimer(t));
        player.setWeaponMode('wide');
        break;

      case 'shield':
        player.activateShield();
        this._setTimer(type, duration, () => player.deactivateShield());
        break;

      case 'speed': {
        const base = cfg?.speed || 220;
        player.speed = Math.round(base * 1.5);
        this._setTimer(type, duration, () => { player.speed = base; });
        break;
      }

      case 'bomb': {
        const bombs = Math.min(scene.registry.get('bombs') + 1, MAX_BOMBS);
        scene.registry.set('bombs', bombs);
        scene.events.emit('bombsChanged', bombs);
        break;
      }

      case 'health': {
        player.hp = Math.min(player.maxHp, player.hp + 2);
        this.scene.events.emit('playerHpChanged', player.hp, player.maxHp);
        break;
      }
    }

    const emittedDuration = (type === 'double' || type === 'spread' || type === 'burst' || type === 'wide' || type === 'health' || type === 'bomb') ? null : duration;
    scene.events.emit('powerupActivated', type, emittedDuration);

    try {
      if (scene.sound.get && scene.sound.get('sfx-powerup')) {
        scene.sound.play('sfx-powerup', { volume: 0.6 });
      }
    } catch (_) {}
  }

  _setTimer(type, duration, fn) {
    this._timers[type] = this.scene.time.delayedCall(duration, () => {
      fn();
      delete this._timers[type];
    });
  }

  _cancelTimer(type) {
    if (this._timers[type]) { this._timers[type].remove(); delete this._timers[type]; }
  }
}
