# Locked Browser

A simple locked-down browser. It shows only the title bar and stays on one website.

Built with [Electron](https://www.electronjs.org/).

## What it does
- No address bar, tabs, bookmarks, or buttons
- Locks to the website in `config.json`
- F11 = fullscreen
- F12 = screenshot (saved next to the app)
- Ctrl/Cmd + C = Copy
- Ctrl/Cmd + V = Paste
- Ctrl/Cmd + X = Cut
- Ctrl/Cmd + A = Select All
- Fully portable — just unzip and run

Clipboard access (Clipboard API) is enabled for the locked page.

## Download
Get the latest Windows version here:

**https://github.com/Weavin-boy/locked-browser/releases**

Unzip the file, edit `config.json`, then run `Locked Browser.exe`.

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
