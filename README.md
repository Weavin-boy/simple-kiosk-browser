# Simple Kiosk Browser

A simple kiosk-style browser that starts on the page you choose.

It shows only the title bar and stays on that site.

## What it does
- No address bar, tabs, or extra buttons
- Starts on the page set in `config.json`
- F11 = fullscreen
- F12 = screenshot (saved next to the app)
- Ctrl/Cmd + C / V / X / A work
- Right-click and drag locks the mouse (useful for games)
- Unzip and run — no install needed

## Download
Latest Windows build (v1.0.3b):

**https://github.com/Weavin-boy/simple-kiosk-browser/releases/download/v1.0.3b/Simple-Kiosk-Browser-Portable.zip**

SHA-256: `8757417507ccc31c22c7687bf7004b2ccea546476aab7bafd0bbb459d8fd4ae8`

Unzip, edit `config.json` with your site, then run `Simple Kiosk Browser.exe`.

## Build it yourself
1. Install Node.js
2. Clone and run:
   ```bash
   git clone https://github.com/Weavin-boy/simple-kiosk-browser.git
   cd simple-kiosk-browser
   npm install
   npm start
   ```
3. To build the portable Windows version:
   ```bash
   npm run build:win
   ```
   Output is in `dist/win-unpacked/`.

## Notes
Navigation is limited to the site in `config.json`. Modifier keys still work so games can use them. F11 and F12 only work while the window is focused.

Cookies and screenshots are stored next to the app (unencrypted). The app does not update itself — check the releases page for new versions.
