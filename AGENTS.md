# Chuckie Egg (DHTML port)

Browser port of A&F Software's 1983 BBC game. One to four players collect the eggs on a level, avoid hens and the mother duck, and ride lifts. There is no build step and no test suite. Open `ch-egg.html` (a static server is enough). `body onload` calls `load()` in `loader.js`, which builds `audio`, `keyboard`, and `gui`. `gui.Init()` starts the timer.

Script order in `ch-egg.html` is the load order. Later files call earlier globals. Do not add modules or a bundler unless asked.

## Style

Files are 2007-era constructors: methods assigned on `this`, shared state in globals from `pch.js`, tabs, and a GPL header. Match that. `level-editor.html` is the archived editor page, not part of the game loop. `images/farmer.gif` is the game sprite strip; the editor palette uses `images/farmer-icon.gif`.

`config.js` has the only runtime switches: `g_loadLevels` (custom layouts from storage) and `g_audioEnabled`.

## Loop

`GUIUpdate` -> `gui.Update()` runs one GUI state per tick (`g_frequency` is 33 Hz, `g_nmsec` in `pch.js`). In-game, `GUIStateInGame` calls `game.Update()`:

- `0` keeps playing.
- `1` is the end of the death tune. If `PlayerIsOut()` the state becomes game over, otherwise `AdvancePlayer()` reloads a level and the state becomes get-ready.
- `2` is Escape+H back to the high scores.

`Game.Update` order matters. It handles a pending death, then a finished death tune, then level complete when `GetNumEggs() == 0`, then pause, then mother duck, hens, lifts, and the farmer. The clock and bonus tick after the farmer moves. A level ends by draining the bonus in `DoLevelCompleted`, then `IncrementLives` and `SelectLevel`.

Lives are taken in `AdvancePlayer`, not when the farmer first dies. `PlayerIsOut` is checked before that call, so a life that reaches zero is noticed on the next death.

## Coordinates and cells

The playfield is 20 by 28 cells (`LevelManager`). Each cell is 8px. Logical pixels are 160 by 224 (`levelXMax`, `levelYMax`); the score bar is the other 32px of the 256-high screen. The board is drawn at 320 by 256 because BBC Mode 2 pixels are double-wide: sprite `left` is often `x << 1`, while `top` is unscaled. CSS on `#outerdiv` scales the finished board. Keep gameplay in the 160-wide space.

Cell values in `LevelManager`: `0` blank, `1` wall, `2` grain, `3` egg, `4` ladder, `5` lift, `6` farmer, `7` hen. Layouts in `levellayouts.js` are number grids plus parallel hen, farmer `[cellX, cellY]`, and lift column arrays. `g_levelLayouts` in `levelmgr.js` is what the game plays. `alternative_levels/` is not wired in. With `g_loadLevels`, `LevelManager.LoadLevels` overwrites the eight layouts from storage.

`Player.InitLevelState` copies a layout into that player's own grid and sets `numEggs` to 12. `LevelState` holds a reference to that grid and paints it. Eating an egg or grain mutates the copy in place (`ClearCellAt`). A death reload uses that copy, so collected eggs stay gone. `SelectLevel` is what copies a fresh layout.

## Where to change things

- `farmer.js` — movement, jump, ladders, collision. `CollisionDetection` hits the screen edge before it checks the egg cell. `ScreenBoundryCollide` sets `dead` for a fall off the bottom (and for the top, unless jumping). `OnEggCollision` clears the cell and calls `game.OnEggCollected`.
- `game.js` — score, lives, time, level advance, death tune. `AcceptDeath` ignores a death when `GetNumEggs() == 0`. `AdvancePlayer` scans the reloaded layout with `LayoutHasEggs`; if nothing is left it calls `ClearEggs` and does not take a life, so the next `Update` runs the level-complete path.
- `player.js` — per-player score, lives, bonus, egg count, and layout copy.
- `hens.js`, `motherduck.js`, `lifts.js` — hazards and platforms. Hen count and whether the mother duck is free depend on the level number in `CalcNumRequiredHens` and `IsMotherDuckFreed` (bands of 8, wrapping past the 8 authored layouts).
- `gui.js` — menu states, high-score entry, get-ready, game over. `highscores.js` is the table.
- `keyboard.js` — key codes, including redefinition.
- `audio.js` — samples. `play` / `stop` take a sample index (`tuneSample` is the death tune, `applauseSample` is level complete).
- `storage.js` and `rle.js` — saved layouts and high scores.

## Traps

Same-frame last egg and a fatal fall: the boundary check flags `dead` before the egg is taken. `Farmer.Update` cancels that death when the egg count is already zero, and does not keep simulating the frame. `Game.AcceptDeath` is the second check, including the clock hitting zero. Do not reorder those without keeping both.

`numEggs` is a counter starting at 12, not a count of eggs found in the grid. The layout scan on reload is what catches a grid with nothing left to pick up.

Globals (`farmer`, `level`, `game`, …) are null until `game.Init`. The GUI timer keeps running while you poke them from the console.
