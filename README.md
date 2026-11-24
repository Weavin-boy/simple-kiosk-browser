# locked-browser

Minimal locked-down Chromium-based browser (built with Electron).

## Features
- **Only the title bar** is shown (no address bar, bookmark bar, buttons, extensions, tabs, or menus)
- Locks to a single website defined in `config.json`
- Blocks almost all keyboard shortcuts (Ctrl+N, Ctrl+T, Ctrl+S, Ctrl+W, F5, etc.)
- Allowed hotkeys only:
  - **F11** → Toggle fullscreen
  - **F12** → Take a screenshot and save it to your Downloads folder
- **Fully portable** — no installation required. Just unzip and run.

## Download Portable Version

### Option 1: Automatic build via GitHub Actions (recommended)
1. Go to the [Actions](https://github.com/Weavin-boy/locked-browser/actions) tab.
2. Click **Build Portable Windows App** on the left.
3. Click **Run workflow** → **Run workflow**.
4. Wait for it to finish, then download the **Locked-Browser-Portable** artifact.
5. Unzip it anywhere and run `Locked Browser.exe`.

### Option 2: Create a tagged release
Push a tag to trigger a release with the portable zip attached:
```bash
git tag v1.0.0
git push origin v1.0.0
```
Then check the [Releases](https://github.com/Weavin-boy/locked-browser/releases) page.

## Run from source

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

## Build portable locally (Windows)
```bash
npm install
npm run build:win
```
The portable files will be in `dist/win-unpacked/`. You can zip that folder yourself.

All settings and files stay inside the folder — completely self-contained.
