import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import ShipSelectScene from './scenes/ShipSelectScene.js';
import GameScene from './scenes/GameScene.js';
import HUDScene from './scenes/HUDScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import BossIntroScene from './scenes/BossIntroScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import LevelClearScene from './scenes/LevelClearScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000011',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    ShipSelectScene,
    GameScene,
    HUDScene,
    PauseScene,
    GameOverScene,
    BossIntroScene,
    VictoryScene,
    LevelClearScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

window.game = new Phaser.Game(config);
