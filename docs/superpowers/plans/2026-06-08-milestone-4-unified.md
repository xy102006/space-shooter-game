# Milestone 4 — Unified Phased Roadmap

**Benchmark:** Galaxy Attack: Alien Shooter (App Store, 4.7★, 647K ratings)
**Goal:** A game that is genuinely fun, progressively challenging, and visually polished enough that a player picking it up blind would keep playing past the first boss.

---

## 1. Plan Comparison Table

| Feature | Plan A (M3, done) | Plan B (new gameplay) | Visual Benchmark (Galaxy Attack) | Merge Decision |
|---|---|---|---|---|
| Bomb cap at 3 | ✅ Done | — | — | DONE |
| Post-FX vignette | ✅ Done | — | Screen-edge glow on low health | KEEP + extend to pulse red on low HP |
| Thrust particle trail | ✅ Done | — | Rich engine exhaust | KEEP |
| Enemy death sparks (10 particles) | ✅ Done | — | 15–20 particles per kill | EXTEND particle count in Phase 1 |
| Bullet impact sparks | ✅ Done | — | — | KEEP |
| Pause system (P key) | ✅ Done | — | — | KEEP |
| Mobile touch controls | ✅ Done | — | — | KEEP |
| Score floaters on kill | — | ✅ Phase 1 | — | KEEP |
| Knockback on player hit | — | ✅ Phase 1 | — | KEEP |
| Turret HP bar | — | ✅ Phase 1 | Boss HP phases | MERGE — apply to all multi-HP enemies |
| Asteroid hazard | — | ✅ Phase 2 | Asteroid field visual theme (L2) | KEEP — also serves as L2 visual identity |
| Flanker enemy | — | ✅ Phase 2 | Enemy variety | KEEP |
| Powerup timer bar on HUD | — | ✅ Phase 2 | — | KEEP |
| Combo multiplier | — | ✅ Phase 3 | — | KEEP |
| Level-clear score summary | — | ✅ Phase 3 | — | KEEP |
| Frenzy Mode (20-kill streak) | — | — | ✅ Benchmark | KEEP — replaces combo at high end |
| 3 new wave formations (pincer, diamond, spiral) | — | — | ✅ Benchmark | KEEP pincer + diamond; DROP spiral (complex, low payoff) |
| Active special ability per ship | — | — | ✅ Benchmark | DEFER — Phase 5 material; requires ship rework |
| Tutorial / onboarding | — | — | ✅ Benchmark | DEFER — not needed until public launch |
| Settings screen (volume, fullscreen) | — | — | ✅ Benchmark | DEFER — nice-to-have, not fun-per-effort |
| Achievement system (10 achievements) | — | — | ✅ Benchmark | DEFER — adds retention, not session fun |
| Pilot rescue mechanic | — | — | ✅ Benchmark | DROP — too much state for marginal fun |
| Parallax multi-layer background (3–4 layers) | — | — | ✅ Benchmark | KEEP — single highest-impact visual upgrade |
| Distinct color themes per level (L1: blue, L2: orange, L3: purple) | — | — | ✅ Benchmark | KEEP — pairs with parallax |
| Enemy entry animations (fly in from off-screen) | — | — | ✅ Benchmark | KEEP — WaveManager already staggers; extend it |
| Boss HP bar with phase segments | — | — | ✅ Benchmark | KEEP — HUDScene._updateBossBar() already exists |
| Explosion variety (small/large/boss) | — | — | ✅ Benchmark | KEEP — Boss.defeat() already has stagger; extend |
| Score ticker animation | — | — | ✅ Benchmark | KEEP — cheap, high perceived polish |
| HUD life icons (already ship silhouettes) | ✅ Done | — | ✅ Benchmark | ALREADY DONE — _buildLives() uses ship texture |
| Critical health red vignette pulse | — | — | ✅ Benchmark | KEEP — extends existing vignette postFX |

---

## 2. What to Drop or Defer and Why

**DROP:**
- **Pilot rescue mechanic** — 5% drop rate, +10% bullet speed, shows up at VictoryScene. Cute concept but adds a persistent-run-state problem (what happens if you skip it? does it stack?), and the fun payoff is invisible until you die. Cut it.
- **Spiral formation** — Three new formation types is one too many to build well. Pincer and diamond both create readable spatial pressure. Spiral requires time-dependent positioning that breaks the current static `_formationX()` model and needs a rewrite. Drop it; add it in a future milestone if formations become a focus.
- **Active special ability per ship** — Requires adding a 15s cooldown to four ships, a new HUD element, distinct VFX per ship, and balancing. That's a feature vertical unto itself. The ships are already differentiated by stats and starting gear. Defer to Phase 5.
- **Tutorial / onboarding** — The game's UX is simple enough that a first-time player can figure it out from the control legend at the bottom of MainMenuScene. Add onboarding when the player count justifies it.
- **Settings screen** — Phaser's WebAudio mutes on tab-switch already. Fullscreen is browser-native (F11). Build this when there's a mobile app wrapper to justify it.
- **Achievement system** — Retention mechanic. Zero session-fun value for a player who's never beaten Level 1. Defer until the core loop is locked and the game needs a "reason to replay" layer.

**MERGE (not duplicate):**
- **Combo multiplier + Frenzy Mode** — These are not the same thing. Combo (×1.5/×2/×3) is a moment-to-moment score multiplier that rewards skill. Frenzy Mode is a 20-kill environmental escalation: enemies speed up, fire faster, screen flashes. They stack and reinforce each other. Keep both. Combo tracks kills; Frenzy triggers at 20-kill streak and resets on player hit (same reset logic as combo).
- **Turret HP bar + Boss HP bar phase segments** — Both use HUD graphics. Implement the enemy mini-HP bar first (Phase 1, `Enemy.js`). Then extend `HUDScene._updateBossBar()` with phase segment markers (Phase 3).
- **Vignette (existing) + Critical health red pulse** — The existing vignette is static (`addVignette(0.5, 0.5, 0.8, 0.4)`). Extend it: when lives <= 1, tween the vignette strength from 0.4 to 0.7 and tint it red, pulsing. This is a one-tween addition to the existing `livesChanged` event handler.

---

## 3. Unified Feature List

### Gameplay Mechanics
| Feature | Description | Source |
|---|---|---|
| Score floaters | "+100" text rises from kill position, fades in 600ms | Plan B Phase 1 |
| Knockback on player hit | Ship pushed 30px away from hit source over 200ms | Plan B Phase 1 |
| Enemy mini-HP bar | Small red bar above multi-HP enemies depletes on hit | Plan B Phase 1 (extended) |
| Asteroid hazard | 2–4 rocks spawn every 8–12s, drift down, 1–2 bullet kills | Plan B Phase 2 |
| Flanker enemy | New `movePattern: 'flank'`, enters from left/right edge sweeping across | Plan B Phase 2 |
| Pincer formation | Two groups enter from opposite sides and converge | Benchmark |
| Diamond formation | 4-point diamond spacing; high density center pressure | Benchmark |
| Combo multiplier | ×1.5/×2/×3 at 5/10/15 kills, resets on hit | Plan B Phase 3 |
| Frenzy Mode | 20-kill streak: enemy speed +30%, fire rate +40%, screen flash warning | Benchmark |

### Challenge Systems
| Feature | Description | Source |
|---|---|---|
| Powerup timer bar | Colored depleting bar on HUD shows active powerup duration | Plan B Phase 2 |
| Level-clear score summary | 4s screen after boss: kills / accuracy / best combo / score | Plan B Phase 3 |
| Boss HP phase segments | Boss bar splits into 3 segments; phase-change flash at each threshold | Benchmark |
| Frenzy Mode enemy ramp | At 20-kill streak, all active enemies get immediate speed/fire boost | Benchmark |

### Visual Polish
| Feature | Description | Source |
|---|---|---|
| Parallax multi-layer backgrounds | 3 layers at different scroll speeds per level | Benchmark |
| Distinct color themes per level | L1: cool blue nebula; L2: warm orange asteroid field; L3: deep purple plasma | Benchmark |
| Enemy entry animations | Enemies fly in from off-screen top (-60px), short easing to spawn position | Benchmark |
| Score ticker animation | Score text counts up rapidly rather than jumping to final value | Benchmark |
| Critical health red vignette | Vignette pulses red when lives <= 1; extends existing postFX vignette | Benchmark |
| Increased death particle density | 15 particles per enemy kill (up from 10); boss death: 25 | Benchmark |
| Explosion size variety | Small enemies: 6-particle pop; turret: 14-particle burst; boss: cinematic chain | Benchmark |
| Boss HP segment phase flash | Camera flash + brief screen shake at each boss phase threshold | Benchmark |

### UI/UX
| Feature | Description | Source |
|---|---|---|
| Powerup timer bar on HUD | Horizontal bar below powerup label, depletes in real time | Plan B Phase 2 |
| Level-clear summary screen | New `LevelClearScene.js` — 4s interstitial between boss kill and next level | Plan B Phase 3 |
| Combo display on HUD | "×2 COMBO" text in HUD corner, pulses on new tier | Plan B Phase 3 |
| Frenzy Mode warning | "FRENZY!" full-width text flash at top of play area | Benchmark |

---

## 4. Unified Phased Roadmap

### Challenge Progression Overview

A **new player in Phase 1** gets clear feedback: every kill has a satisfying pop, every hit knocks them back so they feel impact, multi-HP enemies telegraph how much health remains. The play field is coherent and readable.

By **Phase 2**, hazards overlap: asteroids drift through enemy formations, flankers break the predictable top-entry pattern, the powerup timer makes players plan. A player who survived Phase 1 work needs lateral awareness, not just vertical dodge skill.

By **Phase 3**, the score system rewards mastery: combos multiply points, Frenzy Mode punishes recklessness (more enemies = faster bullets = harder), and the level-clear summary gives players a personal metric to beat. An experienced player now plays to *maximize* — not just survive.

**Phase 4** is the visual upgrade that re-frames everything already built: the same waves feel distinct across three levels because the environment looks and feels different. A player who has beaten all three levels in Phase 3 now has a reason to replay them — they look different, and the Frenzy + combo systems stack into a visible scoreboard narrative.

---

### Phase 1: Every Kill Feels Different — Feedback Layer

*Every action has a clear, satisfying consequence. New players learn the game by seeing it react to them.*

| Feature | What it does | Player feels | Files | Complexity |
|---|---|---|---|---|
| Score floaters | "+100" (or "+50", "+75" per type) rises from kill X/Y, fades over 600ms using a Phaser tween | "I scored that kill" — score becomes spatial, not just a counter | `CollisionManager._killEnemy()` — add tween-animated text after score update | Low |
| Knockback on player hit | On `_hitPlayer()`, push player 30px in the direction away from the hit source for 200ms using physics velocity override, then restore | "That hit me" — hit has weight, not just a blink | `CollisionManager._hitPlayer()`, `Player.js` add `knockback(fromX, fromY)` method | Low |
| Enemy mini-HP bar | Enemy with hp > 1 shows a small 24px wide red bar above sprite; each `takeDamage()` call redraws it | "That enemy isn't dead yet" — players read the field | `Enemy.js` — add `this._hpBar` Graphics in constructor; update in `takeDamage()`; destroy in `disableBody` | Medium |
| Increased death particles | Raise burst count from 10 → 15 for regular enemies; add tint variation (orange/red/yellow weighted by enemy type) | Deaths feel more explosive, less uniform | `CollisionManager._killEnemy()` — change `quantity: 10` to `15`, adjust tint per enemy type | Low |

**Challenge progression note:** No new enemies, no new threats. This phase is purely feedback enrichment. The challenge doesn't increase — the *legibility* increases. Players stop dying to enemies they didn't notice were there.

**Milestone test:**
1. Start a Level 1 run. Shoot any swarmer (50pts) — "+50" text should rise from kill position and fade within 600ms. Verify it does not persist.
2. Get hit by an enemy bullet — ship should visibly lurch away from bullet origin (not just blink). Test with a turret bullet coming from the left: ship should push right.
3. Shoot a turret (hp: 3) once — a red bar above it should show ~33% depleted. Shoot again — ~66%. Third shot kills it. Bar must not appear on swarmers (hp: 1).
4. Kill any enemy — count particles in the burst. Should be 15. Turret kills should have a noticeably more orange tint than swarmer kills.
5. No console errors. HUD score counter still correct after 10 kills.

---

### Phase 2: The Play Field Has Texture — Hazard and Formation Layer

*The arena is no longer just "enemies come from the top." Asteroids drift, flankers attack from the sides, formations create spatial pressure.*

| Feature | What it does | Player feels | Files | Complexity |
|---|---|---|---|---|
| Asteroid hazard | New `Asteroid.js` (extends Arcade.Sprite). Spawned by `GameScene` every 8–12s (randomized timer), 2–4 per batch. Drift straight down at speed 80–140. Take 1–2 bullet hits. Add collision in `CollisionManager.addAsteroidCollision()`. | "The field is alive — I have to dodge things that aren't shooting at me" | New `src/objects/Asteroid.js`; `GameScene.js` — spawn timer + asteroid group; `CollisionManager.js` — `addAsteroidCollision()` | Medium |
| Flanker enemy | New `movePattern: 'flank'` in `Enemy.updateMovement()`. Entry: spawns off left or right edge (x = -40 or GAME_WIDTH+40, y = rand 100–350), moves inward at speed 140, fires once when crossing center-x, then exits opposite side. | "They're coming from the side — I can't just look up" | `Enemy.js` — add flank case to `updateMovement()`; `WaveManager.js` ENEMY_CONFIGS — new 'flanker' type; `waves.js` — add flanker waves to L2 and L3 | Medium |
| Pincer formation | `WaveManager._formationX()` gets new case `'pincer'`: splits wave into two equal groups entering from left-quarter and right-quarter of screen simultaneously. | "Both sides are attacking — I need to pick my ground" | `WaveManager.js` — add 'pincer' case to `_formationX()`; `waves.js` — add 2 pincer waves to L2/L3 | Low |
| Diamond formation | New case `'diamond'`: 4-enemy minimum, positions at top/left/right/bottom of a 120px radius diamond centered on screen. Rest fill inner ring. | Reads as "surrounded" — spatial pressure, not just density | `WaveManager.js` — add 'diamond' case; `waves.js` — add 1 diamond wave per level 2/3 | Low |
| Powerup timer bar | HUD shows a thin horizontal bar (width = 120px, height = 6px) below the powerup label. On `powerupActivated`, bar fills to full; depletes linearly over duration using a Phaser tween. Bar color matches powerup type (blue=double, green=spread, cyan=shield, yellow=speed). | "I know exactly when my powerup runs out — I can plan around it" | `HUDScene.js` — add `_powerupBar` Graphics + tween in `_showPowerup()` | Low |

**Challenge progression note:** Asteroids add a background threat that ignores the player — the field requires divided attention. Flankers break the core "face up and dodge" mechanic. Pincer + diamond formations force positional choice, not just reaction. This is the first phase where rote movement patterns stop working.

**Milestone test:**
1. Start Level 1. Wait 12 seconds — at least 2 asteroids should appear from the top, drifting down. Shoot one — it should require 1–2 hits, then produce an explosion (not the enemy orange burst — distinct smaller pop). A second asteroid not hit by bullets should scroll off the bottom cleanly.
2. Reach Level 2. A flanker wave should appear: enemy enters from the left edge, crosses screen, fires once near center, exits right. Verify it does NOT circle back. Verify it fires at the player's current position (not a fixed point).
3. Trigger a pincer formation wave. Two enemy groups should appear from left-quarter and right-quarter, not all from center. Watch them converge toward the middle of the screen.
4. Pick up a shield powerup. A cyan bar should appear below "SHIELD" text in HUD and visibly deplete over 8 seconds, reaching zero exactly when the shield drops. Test with a speed powerup (6s bar).
5. Asteroid bullets interact correctly: player bullets destroy asteroids, enemy bullets do NOT destroy asteroids (asteroids are terrain, not enemies). Player contact with asteroid kills player (calls `_hitPlayer()`).

---

### Phase 3: Runs Have Shape — Mastery and Meta Layer

*Players who survive long enough get rewarded. Players who play recklessly get punished. There's a score narrative — not just a number.*

| Feature | What it does | Player feels | Files | Complexity |
|---|---|---|---|---|
| Combo multiplier | New `ComboManager.js`. Tracks kill streak. At 5/10/15 kills: ×1.5/×2/×3. Score in `CollisionManager._killEnemy()` is multiplied. Streak resets on player hit (listen to `livesChanged`). HUD shows "×2" badge. | "I'm on a roll — don't get hit" — survival has compounding value | New `src/systems/ComboManager.js`; `CollisionManager._killEnemy()` — pass score through ComboManager; `HUDScene.js` — add combo badge text | Medium |
| Frenzy Mode | Triggered at 20-kill streak in `ComboManager`. Emits `frenzyStart` event. `GameScene` listens: all active enemies get `speed *= 1.3`, `fireRate *= 0.7` for remaining run. HUD shows "FRENZY!" flash (large text, 2s, then smaller persistent indicator). Resets on player hit. | "I built this — and now I have to survive what I built" — maximum tension, earned difficulty | `ComboManager.js` — add `_checkFrenzy()` after kill count increment; `GameScene.update()` — apply speed/fireRate to active enemies on event; `HUDScene.js` — add frenzy indicator | Medium |
| Score ticker animation | `HUDScene._setScore()` instead of setting text immediately, tweens a local `_displayScore` value from current to target over 300ms using `scene.tweens.addCounter`. Text updates each frame during tween. | Score feels earned and dynamic — every kill has weight on the counter | `HUDScene.js` — replace direct `setText` with counter tween in `_setScore()` | Low |
| Level-clear summary screen | New `LevelClearScene.js`. Launched by `CollisionManager._killBoss()` instead of going directly to `VictoryScene` (or next level). Shows: kills, accuracy (bullets fired / kills), best combo, final score. 4s auto-advance or click to skip. | "I can see how I played — I want to do better" — replayability hook | New `src/scenes/LevelClearScene.js`; `GameScene.js` — track shots fired and kills; `CollisionManager._killBoss()` — pass stats to LevelClearScene | Medium |
| Boss HP phase segments | `HUDScene._updateBossBar()` draws 2 segment dividers at 66% and 33% of bar width. When boss ratio crosses a threshold, emit `bossPhaseChange` — camera flash (white, 100ms) + brief shake (0.008). | "The boss just changed — pay attention" — phases feel like events not just depleting HP | `HUDScene.js` — modify `_updateBossBar()` to draw segment lines + track last phase; `CollisionManager.addBossCollision()` — emit event at threshold crossings | Low |

**Challenge progression note:** Combo and Frenzy turn the score into a risk/reward system. A careful player who never combos will score 60–70% of a reckless player who chains kills but dies once. Frenzy Mode is the self-imposed hard mode — it only exists if you're skilled enough to reach 20 kills. The level-clear screen gives players a concrete metric to compete against themselves.

**Milestone test:**
1. Kill 5 enemies without getting hit. HUD should display "×1.5" combo badge. Kill 5 more — "×2". Five more — "×3". Get hit — badge should disappear and streak resets.
2. Kill 20 enemies in one life without taking a hit. "FRENZY!" should flash on screen. All currently active enemies should visibly move faster and fire more frequently. Get hit — frenzy ends.
3. Kill the Level 1 boss. Verify: instead of cutting directly to VictoryScene (or Level 2), `LevelClearScene` appears showing kill count, accuracy percentage, best combo achieved, and score. After 4 seconds it auto-advances. Test the click-to-skip button.
4. Score ticker: after a kill, the score text should count up over ~300ms rather than snapping to the new value. Kill 5 rapid-fire enemies — the counter should "scroll" up through intermediate values.
5. During boss fight: when boss hits 66% HP, camera should flash white briefly. Again at 33%. The boss bar should show dividing lines at those positions.
6. Track `GameScene` stats: fire 50 bullets, kill 15 enemies. LevelClearScene should show accuracy of 30% (15/50).

---

### Phase 4: The World Looks Different — Visual Identity Layer

*The same mechanics from Phases 1–3 now feel like three different games. Level 1 is a cool blue nebula. Level 2 is a warm asteroid field. Level 3 is a deep purple plasma nebula.*

| Feature | What it does | Player feels | Files | Complexity |
|---|---|---|---|---|
| Parallax multi-layer background | `ScrollManager.js` currently handles one BG layer per level. Extend to 3 layers: back (stars, speed 0.2×), mid (nebula clouds, speed 0.5×), front (near-field detail, speed 1.0×). Each layer is a tileSprite. | Sense of depth and speed — the universe feels three-dimensional | `ScrollManager.js` — add `_layers` array with speed multipliers; `PreloadScene.js` — load bg-level*-mid, bg-level*-front assets | High (needs art assets — see Visual Polish Plan §5) |
| Distinct color themes per level | L1: blue palette (star bg, blue nebula clouds); L2: orange/brown (asteroid field dust, warm stars); L3: purple/pink (plasma nebula, magenta star field). Applied via tileSprite texture keys + particle tint overrides per level. | "I'm somewhere new" — level transitions feel meaningful | `ScrollManager.js` — read `LEVELS[level].bgLayers` config; `levels.js` — add bgLayer keys to each level config | Medium |
| Enemy entry animations | When `WaveManager._spawnWave()` places enemies at y=-30 to y=-58 (currently), extend: start at y=-120, tween to y=-30 over 600ms using Phaser tweens. Enemies are visible entering from top edge. | "They're flying in — it's an invasion" — formations feel choreographed | `WaveManager.js` — after `spawnFn()`, add a tween on the returned enemy object from y=-120 to y=entryY | Low |
| Critical health red vignette | On `livesChanged` when lives <= 1: tween existing vignette from strength 0.4 to 0.7, tint red, with a 1.5s pulse loop (yoyo tween on strength 0.5→0.7). On lives > 1: restore to static 0.4, no tint. | "I'm almost dead" — environment reacts to player state | `HUDScene.js` — listen to `livesChanged` event, call `scene.get('GameScene').cameras.main.postFX` to update vignette tween | Medium |
| Explosion size variety | `spawnExplosion()` currently takes a `size` param ('small'). Add 'medium' (boss minions, turrets) and 'large' (boss). Medium: 14 particles, 200–350ms lifespan. Large: 25 particles, 300–500ms lifespan, second delayed burst at +200ms. | Death animations have weight — a turret dying looks different from a swarmer | `Explosion.js` — extend `spawnExplosion()` with size variants; `CollisionManager._killEnemy()` — pass 'medium' for turret kills; `Boss.defeat()` — already has stagger, increase particle counts | Medium |

**Challenge progression note:** Phase 4 adds zero new mechanics but transforms the game's emotional register. Parallax backgrounds make movement feel purposeful. Level color themes let players orient ("I'm in Level 2, the orange one — this is harder"). Entry animations give players a half-second read time before enemies start moving. The vignette communicates urgency without text. This is the phase that makes a player take a screenshot.

**Milestone test:**
1. Start Level 1 — background should have visible depth: far stars scroll very slowly (almost static), mid nebula clouds scroll at half speed, foreground detail scrolls at full speed. Verify three distinct layers.
2. Beat Level 1 boss and enter Level 2 — the background should immediately shift from blue/cool to orange/warm tones. All three parallax layers should use the Level 2 color palette.
3. Watch the first wave of Level 1 spawn — enemies should fly in from y=-120, visibly crossing the top edge of the screen before settling into formation position. Timing: ~600ms for entry tween.
4. Lose 2 lives (leaving 1 life). The vignette around the play area should noticeably deepen and shift toward red. It should pulse (strengthen and weaken) on a ~1.5s cycle. Gain a life back (not currently possible without cheating — spawn directly in a low-life state for testing) — vignette returns to neutral blue.
5. Kill a turret — explosion should be visibly larger than a swarmer kill. Kill the boss — the death sequence should use the 'large' explosion with a secondary burst ~200ms after the first.
6. Verify all three parallax layers render in front of game objects in the correct Z-order: backgrounds behind enemies, enemies behind player, player behind HUD. Use `DEPTHS` constants as reference — BG_0/BG_1/BG_2 at 0/1/2, enemies at 6, player at 8.

---

## 5. Visual Polish Plan

Ordered by player-visible impact per implementation hour.

| Visual feature | Description | File | Complexity |
|---|---|---|---|
| Score ticker animation | `_displayScore` counter tweens from old value to new value over 300ms. Text updates each frame. No art needed. | `HUDScene.js` — `_setScore()` | Low |
| Enemy entry animations | Tween `y` from -120 to spawn position over 600ms after WaveManager places enemy. No art needed. | `WaveManager.js` — after `spawnFn()` call | Low |
| Critical health red vignette pulse | When lives <= 1: tween existing postFX vignette strength + tint to red, add yoyo pulse. Existing `addVignette` already in place. | `HUDScene.js` — `_setLives()` handler, access GameScene camera | Medium |
| Boss HP phase segment lines | Draw two vertical dividers on the boss health bar at 66% and 33% positions. Camera flash at each threshold crossing. | `HUDScene.js` — `_updateBossBar()` | Low |
| Frenzy Mode screen flash | "FRENZY!" in large bold text (font: bold 40px monospace, fill: #ff4400), centered vertically at y=200, visible for 1.8s with a scale-up tween then fade. | `HUDScene.js` — new `_showFrenzy()` triggered by `frenzyStart` event | Low |
| Explosion size variety | `spawnExplosion()` size variants: small (current, 10 particles), medium (14 particles, turret/flanker), large (25 + second burst, boss). | `src/objects/Explosion.js` | Medium |
| Increased enemy death particles | Raise from 10 to 15 particles per enemy kill burst. Varies particle tint by enemy type: swarmer = white/blue, fighter = orange/red, turret = yellow/orange. | `CollisionManager._killEnemy()` | Low |
| Parallax multi-layer backgrounds | 3 tileSprites per level at scroll speeds 0.2×/0.5×/1.0×. Requires 6 new asset pairs (2 additional layers × 3 levels). This is the only feature that requires art creation. | `ScrollManager.js`, `PreloadScene.js`, `levels.js` | High (art bottleneck) |
| Distinct level color themes | If parallax art uses correct palette per level, this is free. If art isn't ready, fallback: tint the single existing bg tileSprite per level (L1: `0x4488ff`, L2: `0xcc6622`, L3: `0x8844cc`). | `ScrollManager.js` | Low (tint fallback) or High (with new art) |
| Combo HUD badge | "×2 COMBO" text at top-right corner, below life icons. Appears with a brief scale-punch (scale 1.4 → 1.0 over 150ms) on tier change. Disappears on reset. | `HUDScene.js` | Low |

---

## 6. Architecture & Modularity Rules

**Rule 1 — One event bus per system boundary; never reach across scenes directly.**
`GameScene` owns all game state. `HUDScene` owns all display. They communicate exclusively through `game.events.on()/emit()`. The pattern is already established — `scoreChanged`, `livesChanged`, `bossHealthChanged`. Never add `scene.get('GameScene')._player.x` in HUDScene. New features (frenzy, combo) follow this same pattern: emit events from the system that knows the state, listen in the scene that updates the display.

**Rule 2 — New managers are plain JS classes with `scene` as their only Phaser dependency.**
`ComboManager.js` follows the pattern of `CollisionManager.js` and `PowerupManager.js`: constructor takes `(scene)`, emits events via `scene.events.emit()`, has a `destroy()` method. It does not extend `Phaser.Scene`, `Phaser.GameObjects.GameObject`, or any Phaser base class. This keeps managers testable and replaceable without Phaser lifecycle involvement.

**Rule 3 — Asteroid and Flanker are Enemy variants, not new base classes.**
`Asteroid.js` extends `Phaser.Physics.Arcade.Sprite` (same as `Enemy.js`). The flanker is a config on the existing `Enemy` class (`movePattern: 'flank'`), not a subclass. Add the flank case to `Enemy.updateMovement()`. This keeps the collision system unified — `CollisionManager` already handles `enemyGroup`; asteroids get their own group with a single `addAsteroidCollision()` call, not a parallel collision hierarchy.

**Rule 4 — `levels.js` is the single source of truth for per-level configuration.**
Parallax layer keys, scroll speeds, color tints, boss HP, and boss names all belong in `LEVELS[n]`. `ScrollManager.js` reads `LEVELS[level].bgLayers` — it does not have hardcoded level switch/case logic. `WaveManager.js` reads enemy configs from `ENEMY_CONFIGS` — not from `levels.js` — because wave timing is sequence logic, not level identity. This boundary is already implicit; make it explicit when adding bgLayer keys.

**Rule 5 — `LevelClearScene.js` receives all stats as launch data; it owns no game state.**
`GameScene` tracks `_shotsF ired` and `_killCount` as plain integers incremented in-place. On boss kill, `CollisionManager._killBoss()` reads these from `scene._shotsFired` and `scene._killCount` and passes them to `LevelClearScene` via `scene.start('LevelClearScene', { kills, accuracy, bestCombo, score, level })`. `LevelClearScene` is purely a display scene — it renders, waits, then calls `scene.start('GameScene', nextLevelData)` or `scene.start('VictoryScene', ...)`. It never modifies registry state.

---

## 7. Implementation Order Summary

If time is constrained, ship in this order — each row is a complete, independently playable improvement:

1. **Score floaters** — 1 file, 1 tween, instantly visible to any player
2. **Score ticker animation** — 1 function change in HUDScene, zero risk
3. **Enemy entry animations** — 3 lines in WaveManager, transforms wave readability
4. **Knockback on hit** — adds physicality to the one moment that matters most
5. **Enemy mini-HP bar** — eliminates "why isn't this thing dead?" frustration
6. **Powerup timer bar** — closes the last UX information gap in HUD
7. **Combo multiplier** — unlocks skill expression in the score system
8. **Asteroid hazard** — first new threat, biggest single fun-per-effort ratio
9. **Flanker enemy** — breaks the directional monotony of every existing wave
10. **Pincer + diamond formations** — spatial variety, no new enemy art
11. **Boss HP phase segments** — boss fights have structure, not just attrition
12. **Frenzy Mode** — the payoff for the combo system; builds on #7
13. **Level-clear summary** — adds session closure and replayability hook
14. **Critical health vignette pulse** — visceral, low-effort, high-drama
15. **Explosion size variety** — differentiates every death event
16. **Parallax backgrounds + level color themes** — art-gated; do last, do it right
