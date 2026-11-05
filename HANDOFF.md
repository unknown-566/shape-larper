# Shape Larper: handoff

## Current implementation: v0.4.6

soundtrack.js loads before boot.js and populates SONGS; shared audio building blocks/mTick remain in index.html. Four original arrangements share eight-bar motif variants and a 32-bar form; melody is not gated by enemy count. stringNote uses deterministic Karplus-style cached buffers (96 maximum), electricKeys uses FM, shaker uses shared noise. No external media dependencies. Initial delay timing and cancelled pending song transitions corrected. tests/soundtrack.js renders all four complete forms through OfflineAudioContext and exports a 32-second wave preview, checking finite audio, peak/RMS, bounded cache and muted scheduling. Protocol remains045; no relay update needed.

## Previous implementation: v0.4.5

Co-op desktopLayout uses a fixed shared W×H arena fitted inside the available viewport, with header/footer margin. CX/CY use this panel center on both clients; solo retains soft following. tests/coop-movement.js uses real keyboard events for each pilot across 800×600 and 1920×1080 and tests leaving the bottom edge. It also catches startup page errors. boot.js is loaded LAST and starts scheduling only after every module loads; preserve this order in all builds.

Boss HUD uses drawCompactBossBar: small name/percent chips, segmented rail, exact HP/phase on hover. desktopBossAnchor keeps spring following and above/below hysteresis. Classic uses the same design.

electron/displays.js persists monitor id in userData/display.json, validates selections, positions desktop in workArea and menu within bounds, handles unplug/metrics changes. Settings cycles monitors with physical resolution labels; each co-op client selects independently. tests/displays.js mocks two monitors, negative origins and unplug. Native integration verifies real enumeration/selection on the available monitor; physical dual-monitor hardware was not tested. Guest settings remain open while authoritative state is pause.

Both clients and relay use shape-larper-045.

## Previous implementation: v0.4.4

User requested relay prepared for deployment (no hosting account), not a live public service. relay/server.js + own pinned ws dependency/lock implement authenticated optional-key WebSocket rooms, bounds/rate/backpressure, heartbeat and cleanup. render.yaml is a free-plan Node service with generated access key; Docker is an alternative. relay-client.js connects from renderer using WSS (plain WS loopback tests only). netSend routes to relay or existing LAN; event handling shared in handleNetEvent(). LAN protocol bumped to shape-larper-044. Root Windows build excludes server deps. Release also includes a small relay-source ZIP; never include relay/node_modules. No cloud deployment or school-network testing was performed.

progression.js PICK tracks per-session id, arrived/ready flags, scale and shared choice. simulationStep() replaces direct upd() in the frame loop: decelerates over ~0.45s, holds at .12 until both clients acknowledge menu arrival, then freezes at zero. Host owns simulation; both players see the same serialized card choices/previews and either can choose. Both ready resumes. Action messages include runId/session id. Point acquisition automatically opens menu; defer keeps choices. Tests that call choose directly must first advance simulationStep until scale zero. Fullrun test now seeds RNG and advances this state machine.

Cards use separate description/stat/cost regions with hover lift/tilt; hit testing uses cardHit. Player panel softly follows movement; upgrade button coordinates attach to that panel, tracked by upgradeButton/upgradeHit. Boss bar follows a damped spring above/below actual boss position with hysteresis and screen clamp, drawn over chrome; compact top wave banner avoids card/HUD conflicts.

Tests: relay.js, relay-game.js, native-coop.js with SHAPE_TEST_RELAY=1 (also supports packaged EXE path), coop-progression.js, menu-follow.js, impact-effects.js, desktop-overlay.js, panel-boundaries.js, updater-ui.js and deterministic fullrun2.js. Render/Docker files are prepared, not cloud-tested.

## Previous implementation: v0.4.3

effects.js adds bounded world impact rings/rays, panel corner highlights, and LAN impact events. CFG.impact defaults 1.35; settings offers 0/.6/1.35/2. CFG.shk and CFG.fl independently control motion/flashes. Desktop presentation wraps masks, world, frames and HUD in one translation (capped at 10 CSS px); desktopPre subtracts that translation for mouse aim. Menus do not shake. Containment reserves additional margin. Do not move OS windows or apply per-entity coordinate offsets. tests/impact-effects.js checks aim, unchanged simulation positions, one world draw, low-FX bounds and switches. native-coop.js also asserts effect delivery.

## Previous implementation: v0.4.2

LAN: electron/lan.js implements UDP discovery and bounded TCP frames (port 43871, protocol shape-larper-042). multiplayer.js handles two-player host-authoritative simulation and 30 Hz snapshots. Shared hull/pulse/upgrades; host resumes and chooses. Guest does not simulate. Run IDs reset reward checkpoints on retry. Only run-earned advancements replicate. Desktop co-op uses a common fixed arena; solo keeps scrolling. Disconnect ends the session; no host migration or reconnect-in-progress.

progression.js owns ng_wallet, six cosmetics, four economic upgrades, banked picks, animated cards and vector icons. New U fields must be in U0 so previews restore them. advance() banks a pick and starts the next wave; choose() MUST NOT call begin(). Deferred cards keep their options. Practice awards no credits.

Desktop containment clamps simulation positions as well as panels. Tests: panel-boundaries.js (five resolutions, whole entities inside panels, preview/insurance invariants); coop-progression.js (real TCP between browser renderers); native-coop.js (two actual apps, preload, desktop co-op, pause, retry reward reset); lan-discovery.js (UDP and protocol rejection). fullrun2.js now opens banked picks and asserts final-boss completion. Existing overlay, performance and updater tests remain applicable.

Minimize-other-windows defaults on for Windows run launches, using a fixed Shell.Application.MinimizeAll command in hidden PowerShell. Set CFG.clearDesktop=false in automated UI tests to avoid affecting the user's windows.

Desktop mode now uses one transparent BrowserWindow and one clipped world draw (`desktop.js`), rather than native windows per entity. `menus.js` owns adaptive settings and pause UI. The older architecture below is retained as historical context.

Windows builds now use electron-builder (NSIS + ZIP). `electron/updater.js` uses electron-updater for installed Windows copies: a check 5 seconds after launch and every 4 hours, automatic background download, SHA-512 verification, and explicit Restart & update. Never enable install-on-quit or interrupt runs. Preferences are stored in userData/updates.json; saves use the same userData directory as v0.4.0. Portable/unpackaged/non-Windows copies show an installer link instead of self-replacing. `updates.js` exposes status and actions in settings and an update-ready banner in the title menu.

Publish the Setup EXE, its blockmap, latest.yml and portable ZIP together on a versioned GitHub release, marking the version tag as latest. Do not recreate a separate `latest` tag release: updater clients need the semantic version and metadata on the newest release. `npm run build:win` writes all four assets to dist/. Preserve installer names referenced by latest.yml. Tests: updater.js (state machine), updater-network.js (real NsisUpdater with local fixtures, checksum rejection and downgrade prevention), updater-ui.js, native-overlay.js, desktop-overlay.js and performance.js.

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
