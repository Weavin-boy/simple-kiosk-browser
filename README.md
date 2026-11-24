# Simple Kiosk Browser

A simple locked-down (kiosk-style) browser. It shows only the title bar and stays on one website.

Built with [Electron](https://www.electronjs.org/).

## What it does
- No address bar, tabs, bookmarks, or buttons
- Locks to the website in `config.json` (origin-checked; only `https://` allowed)
- F11 = fullscreen (only while the window is focused)
- F12 = screenshot (saved next to the app)
- Ctrl/Cmd + C/V/X/A = clipboard
- Right-click drag locks the pointer (for games)
- Fully portable — just unzip and run

Clipboard, pointer lock, and keyboard lock are granted **only** for the locked origin.

**Note on “locked”:** Navigation is restricted to the configured origin (including iframes). Modifier keys (Ctrl/Alt/Shift) are allowed so games can use them. F11 and F12 only work when this window is focused.

## Security notes (from issue #1)
- URL checks use origin comparison, not simple string prefix matching.
- `will-frame-navigate` is also blocked so iframes cannot escape.
- Favicon downloads are limited to `https:`, with a size cap and timeout.
- `config.json` URLs must be valid `https://` (otherwise the default is used).
- DevTools are disabled.
- Cookies and screenshots are stored unencrypted next to the executable (`data/` and `screenshots/`). This is normal for a portable app.
- The app does not auto-update. Check the releases page for new builds.

## Download
Get the latest Windows version here:

**https://github.com/Weavin-boy/locked-browser/releases**

(After renaming the repository to `simple-kiosk-browser`, old URLs will redirect.)

Each release includes a SHA-256 of the zip so you can verify the download.

Unzip the file, edit `config.json` (must be a valid `https://` URL), then run `Simple Kiosk Browser.exe`.

## Build it yourself
1. Install Node.js
2. Clone the repo:
   ```bash
   git clone https://github.com/Weavin-boy/locked-browser.git
   cd locked-browser
   ```
3. Install and run:
   ```bash
   npm install
   npm start
   ```
4. To make the portable Windows build:
   ```bash
   npm run build:win
   ```
   The files will be in `dist/win-unpacked/`.
