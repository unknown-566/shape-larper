# Shape Larper

Bullet hell arcade with upgrades, sacrifices and seven guardians.

Two ways to play:

- **Classic**: the whole game in one window.
- **Desktop** (desktop app): one transparent window covers the current monitor's work area. Player, enemy and boss panels are drawn together. Bullets are visible inside panels and hidden in the transparent gaps, with continuous world-space movement and collisions.
- **Windows** (browser fallback): separate pop-up windows for the player and enemies.

## Performance

Settings → Graphics offers **auto**, **low**, and **high**. Auto starts in low quality on CPUs reporting four or fewer logical processors, and switches to low after sustained slow frames. Low reduces decorative effects, particles and HiDPI rendering. Enemy counts, bullets and damage stay the same.

Rendering is capped at 60 FPS. Window hit feedback no longer shakes native windows, and muted music stops scheduling synthesizer notes.

Version 0.4.0 replaces native entity windows with a single canvas compositor. It draws the world once through a combined panel mask, eliminating window movement IPC, per-window transforms, window creation and native resizing during combat. Panel layout adapts to the display; settings offer panel and interface size controls. Escape opens a centered pause menu with Resume, Settings, Return to menu and Quit game. Settings opened during a run return to pause and keep the run frozen.

## Play in a browser

Open `index.html`. Windows mode works in desktop Chrome or Edge once pop-ups are allowed for the page. Browser limits apply: max 10 enemies at once, 12 enemy windows, and pop-ups keep a small address bar.

## Desktop app (no browser limits)

The desktop app has full-size waves, no pop-up prompts, and aiming across the transparent surface. Alt-Tab pauses the run. Transparent space captures input while playing, so shooting does not click applications underneath. The app uses the current monitor's work area and responds to display/DPI changes.

**Download:** [Releases → latest](https://github.com/unknown-566/shape-larper/releases/tag/latest)

- Windows: `ShapeLarper-win-x64.zip`. Unzip it and run `Shape Larper.exe`.
- macOS: `ShapeLarper-mac-universal.zip` (unsigned: right-click the app and choose Open).
- Linux: `ShapeLarper-linux-x64.zip`.

Build it yourself (Node 22):

```bash
npm install
npm start            # run without packaging
npm run build:win    # dist/Shape Larper-win32-x64/Shape Larper.exe
npm run build:mac    # dist/Shape Larper-darwin-universal/
npm run build:linux  # dist/Shape Larper-linux-x64/
```

GitHub Actions (`.github/workflows/build.yml`) builds all three on every push. Pushes to `main` also replace the `latest` release with fresh downloads.

The app is unsigned, so Windows SmartScreen may warn on first launch: click "More info", then "Run anyway".
