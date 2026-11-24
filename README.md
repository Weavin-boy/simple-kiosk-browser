# Simple Kiosk Browser

A simple locked-down browser. It shows only the title bar and stays on one website.

Built with [Electron](https://www.electronjs.org/).

## What it does
- No address bar, tabs, bookmarks, or buttons
- Locks to the website in `config.json` (origin-checked; only `https://` allowed)
- F11 = fullscreen (only while the window is focused)
- F12 = screenshot (saved next to the app)
- Ctrl/Cmd + C/V/X/A = clipboard
- Right-click drag locks the pointer (for games)
- Fully portable — just unzip and run

Clipboard, pointer lock, and keyboard lock are granted only for the locked origin.

**Note:** “Locked” means navigation is restricted to the configured origin. Modifier keys are allowed so games can use them.

Data (cookies, session, screenshots) is stored unencrypted next to the executable in a `data/` and `screenshots/` folder. This is normal for a portable app.

## Download
Get the latest Windows version here:

**https://github.com/Weavin-boy/locked-browser/releases**

(After renaming the repo, this link will redirect to the new name.)

Each release includes a SHA-256 of the zip so you can verify the download.

Unzip the file, edit `config.json` (must be a valid `https://` URL), then run `Simple Kiosk Browser.exe`.

The app does not auto-update. Check the releases page for new builds.

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
