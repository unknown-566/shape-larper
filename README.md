# Shape Larper

Bullet hell arcade with upgrades, sacrifices and seven guardians.

Two ways to play:

- **Classic**: the whole game in one window.
- **Windows**: every enemy and boss lives in its own window on your desktop. The camera follows you, enemy windows move as you move, and bullets fly from window to window.

## Play in a browser

Open `index.html`. Windows mode works in desktop Chrome or Edge once pop-ups are allowed for the page. Browser limits apply: max 10 enemies at once, 12 enemy windows, and pop-ups keep a small address bar.

## Desktop app (no browser limits)

The desktop app has frameless windows, full-size waves, up to 48 enemy windows, no pop-up prompts, and aiming that works over the desktop between windows.

Windows: download `ShapeLarper-win-x64.zip`, unzip it, and run `Shape Larper.exe`.

Build it yourself (Node 22):

```bash
npm install
npm start            # run without packaging
npm run build:win    # dist/Shape Larper-win32-x64/Shape Larper.exe
npm run build:mac    # dist/Shape Larper-darwin-universal/
npm run build:linux  # dist/Shape Larper-linux-x64/
```

GitHub Actions (`.github/workflows/build.yml`) builds all three and attaches them to the run as artifacts.

The app is unsigned, so Windows SmartScreen may warn on first launch: click "More info", then "Run anyway".
