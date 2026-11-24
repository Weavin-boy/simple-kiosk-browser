# locked-browser

A minimal, locked-down Chromium-based browser (built with Electron). Ideal for kiosk-style or single-website use.

## Features
- Shows **only the title bar** (no address bar, bookmarks, buttons, extensions, tabs, or menus)
- Locks to a single website defined in `config.json` (placed next to the `.exe`)
- Window icon updates to the website’s favicon
- Blocks almost all keyboard shortcuts
- Allowed hotkeys:
  - **F11** → Toggle fullscreen
  - **F12** → Screenshot (saved to a `screenshots` folder next to the `.exe`)
- Controller / joystick support (Gamepad API + basic button mapping for fullscreen/screenshot)
- **Fully portable** — no installation. Unzip and run.
- All data stays inside the folder (nothing written to AppData)

## Download the portable Windows version

The easiest way is via GitHub Actions:
1. Go to the [Actions](https://github.com/Weavin-boy/locked-browser/actions) tab.
2. Open the latest successful **Build Portable Windows App** run.
3. Download the **Locked-Browser-Portable** artifact.
4. Unzip it → you get a `Locked-Browser` folder.
5. Edit `config.json` if needed, then run `Locked Browser.exe`.

You can also create a tagged release (see below) to attach the zip permanently.

## Build it yourself on your computer

This is a public project. Anyone can clone and build it.

### Requirements
- Node.js (v20 or later recommended)
- Git
- On Windows (for the portable `.exe` build)

### Steps
```bash
git clone https://github.com/Weavin-boy/locked-browser.git
cd locked-browser
npm install
```

Edit `config.json`:
```json
{
  "url": "https://your-website.com",
  "title": "My Locked Browser"
}
```

Run in development:
```bash
npm start
```

Build the portable Windows folder:
```bash
npm run build:win
```
The output is in `dist/win-unpacked/`. Zip that folder if you want to share it.

### Create a release with the zip (optional)
```bash
git tag v1.0.0
git push origin v1.0.0
```
Then on the [Releases](https://github.com/Weavin-boy/locked-browser/releases) page you can upload the zip as an asset.

## Folder layout (portable)
```
Locked-Browser/
  Locked Browser.exe
  config.json          ← change the locked website here
  data/                ← all app data (cache, cookies, etc.)
  screenshots/         ← F12 screenshots
  ...
```

All settings and files stay inside the folder — completely self-contained.
