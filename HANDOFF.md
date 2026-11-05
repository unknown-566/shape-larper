# Shape Larper: handoff

State at v0.3.3 (branch `main`, also mirrored on `claude/festive-thompson-65no8r`).

## What it is

A bullet-hell arcade roguelite. You go through 7 sectors. Each sector has 2 waves and a guardian boss. After each wave you pick an upgrade card. Sacrifice cards cost HP and count as "debts". The final boss, Aam Saltman, sits on the throne after the 7th guardian and gets stronger with every debt. After him the game ends, or you can keep going in Endless.

There are two modes:
- **Classic**: the whole game on one 960×640 canvas.
- **Windows**: the player, every enemy cluster, the boss and the boss health bar each get their own real window on the desktop. The camera follows the player, and bullets fly across windows and vanish in the gaps.

## Files

| Path | What |
|---|---|
| `index.html` | The whole game. HTML, CSS and JS in one file, written in a dense "golfed" style. Runs from `file://`. |
| `electron/main.js` | Desktop shell. It opens frameless child windows, moves them natively (one batched IPC per frame), hides the launcher during a run and streams the OS cursor position. |
| `electron/preload.js` | The `window.SL` bridge: `move`, `main`, `onCursor`, `native`. |
| `package.json` | Electron 44.9.2 and @electron/packager 20.3.0, plus the build scripts. |
| `.github/workflows/build.yml` | CI for pushes to `main`. Builds win/mac/linux zips and publishes the `latest` release plus one `vX.Y.Z` release per version. macOS is optional because its runners are often unavailable. |
| `tests/` | Playwright scripts used during development (see Testing). |
| `README.md` | User-facing info. |

## Map of `index.html` (search for these markers)

- Top: constants, `snd()`, input state, upgrade tables (`UP`, `EV`, `SAC`), `ENTS()` (codex), `menuDraw()` (all menu screens).
- Game flow: `newGame`, `startWave`, `startBoss`, `begin`, `spawn`, `advance`, `choose`, `hurt`, `kill`, `bossDie`, `pulse`.
- `bossUpd()`: one branch per boss `b.n` from 0 to 6. `fbUpd` is the final boss (n = 7, which equals `NB`).
- `upd()`: the simulation step. `drawWorld()` draws the world, `overlays()` and `hud()` draw the UI, `render()` and `loop()` run the frame.
- `/* audio: a small mixing desk` is the audio section:
  - mixer (`mkMix`), instruments (`kick`, `snare`, `bass`, `pad`, `lead`…),
  - `SONGS` (menu, wave, boss, final; hooks are written as text strings),
  - `mTick` (sequencer, called every frame from `render`),
  - `sfx(name,{x,r,s,t})` (every sound effect, voice-limited).
- `/* final boss: Aam Saltman`: `fbUpd`, `THR` (throne state: 0 none, 1 fighting, 2 won), `DEBT`, `endless()`.
- `/* juice`: hit-stop `stop()`, `vignette()`.
- `wmShift`, `wmBounds`: in Windows mode the arena frame slides with the player, so the world has no walls.
- `/* v0.3`: `VER`, advancements (`ADV`, `ach(id)`, toasts), the new enemies Sniper, Blinker and Weaver (`enX`, `enXDraw`), `wmPlayer` (player window motion), `wmLeash`.
- `/* visuals`: `beat()` (pulse synced to the kick drum), `menuBG`, `titleMenu`, `mbtn`, `btnBox`, plus the background layers `nebula`, `bgShapes`, `gridDraw`.
- `/* windows mode`: `wmStart` and `wmStop`, `wmOpen` (opens a pop-up and draws into it directly; same-origin `about:blank`), `wmSync` (clusters enemies into windows, opens, closes and moves them), `wmDraw` and `wmFrame` (the slice of the world each window shows plus its chrome), `bossBar`, `statusDraw`.

## Key conventions and gotchas

- **Coordinates.** The world is in arena units (`W`×`H` = 960×640, the UI uses the same coordinates). `M` is the aim point in world units. `MU` is the UI mouse. In Windows mode the screen position of a world point is `CX + (x - P.x) * WSC`.
- **Version** lives in two places: `const VER` in `index.html` and `version` in `package.json`. Keep them equal and bump both for every release.
- **Saves** are in localStorage: `ng_hi`, `ng_seen` (codex, plus `win` = throne count), `ng_cfg` (settings, including `wm` and `mus`), `ng_adv`.
- **Scaling.** Difficulty follows progress, not build: `ED() = 1.087^NP`, where NP is the number of picks. `PW()` lets the actual build nudge HP.
- **Windows mode limits.**
  - In the browser: max 10 live enemies and 12 windows.
  - In the desktop app (`NAT`): no live cap and 48 windows.
  - Every window size is fixed: player 768×512, enemy 200×200, boss 420×420, boss health bar 520×64.
- **NaN safety.** Positions sent to `SL.move` are filtered with `isFinite`, and the main process validates them too. This was a real crash: a game controller reporting a single axis turned movement into NaN.
- **Known risks:**
  - Real Windows/macOS window managers were not tested by the author agent, only Xvfb with openbox.
  - Music is fully synthesized in the code. The author agent could not listen to it and only checked loudness and spectrograms.
  - The app is unsigned.

## Run and build

```bash
npm install
npm start                 # desktop app
npm run build:win         # dist/Shape Larper-win32-x64/Shape Larper.exe (works from Linux, no wine)
```
Browser: open `index.html`. Windows mode in the browser needs pop-ups allowed (Chrome or Edge).

## Testing

All tests are Playwright scripts. Chromium is preinstalled in the original environment.

```bash
node tests/fullrun2.js $PWD/index.html     # bot plays a whole run through the throne, checks advancements
node tests/wmtest2.js  $PWD/index.html     # browser Windows mode: caps, retry, closing the player window
node tests/blk.js      $PWD/index.html     # blocked pop-ups fall back to Classic
node tests/pad.js      $PWD/index.html     # one-axis gamepad must not produce NaN
node tests/render2.js  $PWD/index.html     # renders songs and sfx offline to a2_*.wav (check with ffmpeg ebur128)
```
Desktop app tests need Xvfb, openbox and ImageMagick `import`:
```bash
xvfb-run -a -s "-screen 0 1920x1080x24" tests/runwm.sh tests/el3.js    # merged windows, boss bar, window motion
```
Some scripts click menu coordinates. "Start run" is at (200,229), so they break if the title layout changes.

## Open ideas the user raised or that are still open

- The user can't tell how good the music and sound are; listening feedback is pending. A possible next step is swapping in real recorded tracks (CC0 or ones the user owns).
- Final boss balance with many debts is untuned (66 to 131 s for the bot).
- Off-window threat indicators in Windows mode.
- Small leftovers: Esc does not go back in menus, and the touch pause button overlaps the score.
- The codebase is one large golfed file. Splitting it into modules would help a new agent.
