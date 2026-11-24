const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron');

let mainWindow;
let lockedUrl = 'https://example.com';
let windowTitle = 'Locked Browser';

// Load config
function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    lockedUrl = config.url || lockedUrl;
    windowTitle = config.title || windowTitle;
    console.log('Loaded config:', { lockedUrl, windowTitle });
  } catch (err) {
    console.error('Failed to load config.json, using defaults:', err.message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: windowTitle,
    autoHideMenuBar: true,
    menuBarVisible: false,
    // Only title bar — no address bar, tabs, buttons, etc.
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Remove application menu completely
  mainWindow.setMenu(null);

  // Load the locked URL
  mainWindow.loadURL(lockedUrl);

  // Prevent navigation away from the locked URL
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(lockedUrl)) {
      event.preventDefault();
      console.log('Blocked navigation to:', url);
    }
  });

  mainWindow.webContents.on('will-redirect', (event, url) => {
    if (!url.startsWith(lockedUrl)) {
      event.preventDefault();
    }
  });

  // Block new windows / tabs
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Disable most keyboard shortcuts, allow only F11 and F12
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const { key, control, alt, meta, shift } = input;

    // Allow F11 (fullscreen) and F12 (screenshot)
    if (key === 'F11' || key === 'F12') {
      return; // let it through, we'll handle it globally
    }

    // Block common shortcuts
    const blocked =
      control || meta || // Ctrl / Cmd
      (alt && key !== 'F4') || // Alt (except Alt+F4 for close on Windows)
      key === 'F5' || // refresh
      key === 'F1' ||
      key === 'F3' ||
      key === 'F6' ||
      key === 'F7' ||
      key === 'F8' ||
      key === 'F9' ||
      key === 'F10';

    if (blocked) {
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Global shortcuts for F11 and F12 (more reliable)
app.whenReady().then(() => {
  loadConfig();
  createWindow();

  // F11 — toggle fullscreen
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isFull = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFull);
    }
  });

  // F12 — screenshot to Downloads
  globalShortcut.register('F12', async () => {
    if (!mainWindow) return;

    try {
      const image = await mainWindow.webContents.capturePage();
      const downloadsPath = app.getPath('downloads');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = path.join(downloadsPath, filename);

      fs.writeFileSync(filePath, image.toPNG());

      // Optional: show a brief notification-style dialog (or remove if you want silent)
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Screenshot saved',
        message: `Saved to:\n${filePath}`,
        buttons: ['OK'],
      });
    } catch (err) {
      console.error('Screenshot failed:', err);
      dialog.showErrorBox('Screenshot failed', err.message);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
