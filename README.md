# Warped Space Shooter

**Play now:** https://space-shooter-game-snowy.vercel.app

A 3-level vertical scrolling space shooter built with Phaser 3 and Vite. Fight through waves of enemies, defeat bosses, and survive across three increasingly difficult levels.

## Tech Stack

- **Phaser 3.87** — game engine
- **Vite 5.4** — dev server and bundler
- **Vitest** — unit tests
- **Playwright** — end-to-end tests

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Move ship |
| Space / Auto-fire | Shoot |
| B | Drop bomb |
| P | Pause |
| ` (backtick) | Dev shortcut — skip to Level Clear |

Touch controls are supported on mobile.

## Ships

| Ship | Style | Trait |
|---|---|---|
| Balanced | Standard speed & fire rate | Best for beginners |
| Tank | Slow, high HP | Starts with double shot + extra life |
| Bomber | Medium speed | Starts with 1 bomb; recharges on every boss kill |
| Speedster | Fastest | Power-ups last 50% longer |

Choose your ship color (yellow or red) and difficulty before each run.

## Difficulty

| Mode | Effect |
|---|---|
| Easy | Waves arrive 25% slower |
| Normal | Standard |
| Hard | Waves arrive 20% faster, enemies ramp quicker |

## Gameplay

- **HP system** — 5 HP per life. Lose a life only when HP reaches 0.
- **3 levels** — each ends with a boss fight. Clear the boss to advance.
- **Wave manager** — enemy waves spawn on a timer across 4–5 minutes per level.
- **Boss phases** — boss enters phase 2 at 50% HP, phase 3 at 25% HP.
- **Combo system** — chain kills for a score multiplier. Multiplier resets on player hit.
- **Bombs** — screen-clear nuke. Limited supply.

## Enemy Types

| Type | Behavior |
|---|---|
| Fighter | Straight dive, shoots at player |
| Swarmer | Fast, no shooting, swarm patterns |
| Turret | Slow, high HP, rapid fire |
| Flanker | Approaches from the sides |

## Power-ups

| Power-up | Effect |
|---|---|
| Double Shot | Two parallel bullets (persists until replaced) |
| Spread Shot | Three-way spread (persists until replaced) |
| Shield | Temporary invincibility |
| Speed Boost | Movement speed increase |
| +1 Bomb | Adds one bomb charge |
| +2 HP | Restores 2 HP |

## Project Structure

```
src/
  scenes/       — Phaser scenes (GameScene, HUDScene, BossIntroScene, etc.)
  objects/      — Player, Enemy, Boss, Bullet, Powerup, Asteroid
  systems/      — WaveManager, CollisionManager, PowerupManager, ComboManager
  data/         — Wave schedules and level configs
  utils/        — Pure utility functions (stats, formations, math)
public/
  assets/       — Sprites, backgrounds
tests/
  unit/         — Vitest unit tests
  e2e/          — Playwright browser tests
```

## Running Tests

```bash
npm run test:unit        # unit tests
npm run test:e2e         # end-to-end tests (requires dev server)
```
