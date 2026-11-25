# Simple Kiosk Browser

A simple kiosk-style browser that starts on the page you choose.

It shows only the title bar and stays on that site (or the same domain, including subdomains).

## What it does
- No address bar, tabs, or extra buttons
- Starts on the page set in `config.json`
- Navigation is limited to the same root domain (subdomains are allowed)
- Set `"allowExternalNavigation": true` in `config.json` to allow leaving the domain
- F11 = fullscreen
- F12 = screenshot (saved next to the app)
- Ctrl/Cmd + C / V / X / A work
- Right-click and drag locks the mouse (useful for games)
- Unzip and run — no install needed

## Download
Latest Windows build (v1.0.4a):

**https://github.com/Weavin-boy/simple-kiosk-browser/releases/download/v1.0.4a/Simple-Kiosk-Browser-Portable.zip**

SHA-256: `(will be updated after release)`

Unzip, edit `config.json` with your site, then run `Simple Kiosk Browser.exe`.

## config.json
```json
{
  "url": "https://example.com",
  "title": "My Site",
  "allowExternalNavigation": false
}
```
- `url` — starting page (must be https://)
- `title` — window title
- `allowExternalNavigation` — set to `true` to allow navigation to other domains (default: false)

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
By default, navigation is limited to the root domain in `config.json` (subdomains are allowed). Set `allowExternalNavigation` to `true` to turn this off. Modifier keys still work so games can use them. F11 and F12 only work while the window is focused.

Cookies and screenshots are stored next to the app (unencrypted). The app does not update itself — check the releases page for new versions.
