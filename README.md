# locked-browser

Minimal locked-down Chromium-based browser (built with Electron).

## Features
- **Only the title bar** is shown (no address bar, bookmark bar, buttons, extensions, tabs, or menus)
- Locks to a single website defined in `config.json`
- Blocks almost all keyboard shortcuts (Ctrl+N, Ctrl+T, Ctrl+S, Ctrl+W, F5, etc.)
- Allowed hotkeys only:
  - **F11** → Toggle fullscreen
  - **F12** → Take a screenshot and save it to your Downloads folder

## Setup

1. Make sure you have Node.js installed.
2. Clone the repo:
   ```bash
   git clone https://github.com/Weavin-boy/locked-browser.git
   cd locked-browser
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Edit `config.json` to set the website you want to lock onto:
   ```json
   {
     "url": "https://your-website.com",
     "title": "My Locked Browser"
   }
   ```
5. Run it:
   ```bash
   npm start
   ```

## Building a standalone app (optional)
```bash
npm run build
```

The browser will open in a window with only a title bar and stay locked to the URL in `config.json`.
