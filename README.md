# Shape Larper

Bullet hell arcade with upgrades, sacrifices and seven guardians.

Two ways to play:

- **Classic**: the whole game in one window.
- **Desktop** (desktop app): one transparent window covers the current monitor's work area. Player, enemy and boss panels are drawn together. Bullets are visible inside panels and hidden in the transparent gaps, with continuous world-space movement and collisions.
- **Windows** (browser fallback): separate pop-up windows for the player and enemies.

## v0.4.5: stable co-op arena and monitor selection

- Desktop co-op uses one fixed, fully visible shared arena on both clients, including different monitor resolutions. Neither pilot moves the panel. Both pilots spawn together and can leave every screen edge.
- Settings → Monitor cycles connected displays and shows their resolution. Selection is saved; unplugging the selected display moves the game to an available display. Each pilot chooses independently.
- Boss health uses a name/percentage chip and thin segmented rail anchored above or below the boss. Hover reveals exact HP and phase without reserving a large panel.
- Renderer starts after all modules load, preventing intermittent startup errors. Guest settings stay open while the team is paused.
- Both players and the relay must use **v0.4.5** (protocol shape-larper-045).

## Co-op menus and online relay

- Upgrade points open the card menu automatically. The world eases into slow motion, then freezes once both pilots have received the menu. Either pilot can choose the single team upgrade; play resumes after both finish or defer. Card descriptions, stat previews and costs have separate areas. Hover lifts, tilts and highlights cards.
- The player panel follows movement with a soft lag; its upgrade control and credit readout travel with it. The boss health bar springs toward the boss, appears in front of panel chrome, and moves below the boss when the player is above it. It remains on-screen. Desktop wave announcements use a compact top banner.
- **Online · room code** adds outbound WebSocket relay transport alongside LAN. Both players must run v0.4.5. No public relay is bundled or running: deploy the included server, then enter its WSS address and access key in the game. The host creates a room; the second pilot enters its code.

**Deployment:** [Czech relay guide](relay/README.md), `render.yaml`, Dockerfile and the `ShapeLarper-Relay-v0.4.5.zip` release asset. The server was tested locally with browser and Electron clients, including room pairing and synchronized menus; cloud deployment and your school network still require verification. Outbound WSS avoids relying on incoming LAN connections, but a network can also block WSS or the hosting domain. Do not assume any transport works on every network.

## v0.4.3: impact effects

Stronger shared panel shake, expanding shockwaves, radial sparks and illuminated panel corners on dash, kills, damage, pulses and boss phases/deaths. Settings offers Impact effects: Off / Soft / Full / Overdrive. Screen shake and Flashes remain independent switches. Low graphics caps simultaneous impact bursts at eight and reduces ray counts. LAN forwards impact events to the other pilot. The native desktop window remains stationary; the compositor moves panel masks, world and chrome together and compensates aim coordinates.

## v0.4.2: LAN co-op, credits and the hangar

Open **LAN co-op** on two desktop copies of v0.4.2 on the same network. One player chooses **Host game**; the other selects the automatically discovered lobby. **Join by IP** works when broadcasts are filtered. Allow the game on private networks in Windows Firewall (UDP discovery and TCP gameplay, port 43871). No internet matchmaking or port forwarding is needed.

Two pilots share hull, pulse charge and team upgrades. The host runs the simulation and controls resume and upgrade choices; either pilot can request pause or upgrades. Each receives earned credits and advancements in their own save. Desktop co-op uses a common fixed arena across display sizes. A disconnect ends the session; host a new lobby to reconnect.

- **Credits:** enemy kills, bosses, wave clears and clean-wave bonuses. Practice pays nothing. Credits survive death.
- **Hangar:** six cosmetic hulls, unlocked with credits and the listed advancement. They change ship color and silhouette.
- **Economic upgrades:** Bounty Hunter increases kill payouts; Compound Interest pays extra on clears; Liquid Armor spends 15 host credits to block a hit, with a five-second cooldown; Capital Rounds scales damage with the host's saved credits, capped at +30%.
- **Banked upgrades:** clears grant picks without stopping play. Click **UPGRADES** or press **U**. Animated cards can be deferred with **U**, **Escape**, or **Keep for later**, without rerolling. Choosing never restarts the wave.
- **Desktop:** enemies and bosses stop at visible panel/screen boundaries. Starting a run minimizes other windows on Windows; this can be disabled in Settings.
- Canvas vector insignia replace platform emoji in upgrades, advancements and menus.

New persistent data uses localStorage `ng_wallet`; previous saves are retained. Reset progress also resets credits and skins.

## Performance

Settings → Graphics offers **auto**, **low**, and **high**. Auto starts in low quality on CPUs reporting four or fewer logical processors, and switches to low after sustained slow frames. Low reduces decorative effects, particles and HiDPI rendering. Enemy counts, bullets and damage stay the same.

Rendering is capped at 60 FPS. Window hit feedback no longer shakes native windows, and muted music stops scheduling synthesizer notes.

Version 0.4.0 replaces native entity windows with a single canvas compositor. It draws the world once through a combined panel mask, eliminating window movement IPC, per-window transforms, window creation and native resizing during combat. Panel layout adapts to the display; settings offer panel and interface size controls. Escape opens a centered pause menu with Resume, Settings, Return to menu and Quit game. Settings opened during a run return to pause and keep the run frozen.

## Play in a browser

Open `index.html`. Windows mode works in desktop Chrome or Edge once pop-ups are allowed for the page. Browser limits apply: max 10 enemies at once, 12 enemy windows, and pop-ups keep a small address bar.

## Desktop app (no browser limits)

The desktop app has full-size waves, no pop-up prompts, and aiming across the transparent surface. Alt-Tab pauses the run. Transparent space captures input while playing, so shooting does not click applications underneath. The app uses the current monitor's work area and responds to display/DPI changes.

**Download:** [Releases → latest](https://github.com/unknown-566/shape-larper/releases/latest)

- Windows installer: `ShapeLarper-Setup-vVERSION-win-x64.exe`. Install once to enable automatic updates.
- Windows portable: `ShapeLarper-vVERSION-win-x64.zip`. Extract it and run `Shape Larper.exe`; this copy offers a link to the installer instead of replacing portable files.
- macOS: `ShapeLarper-mac-universal.zip` (unsigned: right-click the app and choose Open).
- Linux: `ShapeLarper-linux-x64.zip`.

Build it yourself (Node 22):

```bash
npm install
npm start            # run without packaging
npm run build:win    # dist/: Windows installer, ZIP, latest.yml and blockmap
npm run build:mac    # dist/Shape Larper-darwin-universal/
npm run build:linux  # dist/Shape Larper-linux-x64/
```

GitHub Actions (`.github/workflows/build.yml`) builds all three on every push to main. Releases include the Windows installer and its `latest.yml`/blockmap; publish these files together without renaming the installer. Versioned releases are preserved and the newest is marked as latest.

## Automatic updates (Windows installer, v0.4.1+)

The installed app checks GitHub Releases after launch and every four hours, and downloads newer stable versions in the background. It never restarts or installs during a run. When ready, use **Restart & update** in the main menu or **Pause → Settings**. Settings also provide a manual check and an automatic-updates toggle. Downloaded installers are verified against the release's SHA-512 checksum. Saves and preferences remain in the same user-data directory.

Existing v0.4.0 ZIP copies cannot update themselves: install v0.4.1 once. Portable ZIPs and non-Windows builds do not self-install updates. The release pipeline must always upload the Setup EXE, its `.blockmap`, and `latest.yml` before publishing a release.

The app is unsigned, so Windows SmartScreen may warn on first launch: click "More info", then "Run anyway".
