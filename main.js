const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let lockedUrl = 'https://example.com';
let windowTitle = 'Locked Browser';

// Load config (looks next to the .exe in production, or in the project folder in development)
function loadConfig() {
  try {
    let configPath;
    if (app.isPackaged) {
      // Portable build: config.json sits next to the .exe
      configPath = path.join(path.dirname(process.execPath), 'config.json');
    } else {
      // Development
      configPath = path.join(__dirname, 'config.json');
    }

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      lockedUrl = config.url || lockedUrl;
      windowTitle = config.title || windowTitle;
      console.log('Loaded config from', configPath, { lockedUrl, windowTitle });
    } else {
      console.log('No config.json found at', configPath, '- using defaults');
    }
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
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(lockedUrl);

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

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const { key, control, alt, meta } = input;

    if (key === 'F11' || key === 'F12') {
      return;
    }

    const blocked =
      control || meta ||
      (alt && key !== 'F4') ||
      key === 'F5' ||
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

app.whenReady().then(() => {
  loadConfig();
  createWindow();

  globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isFull = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFull);
    }
  });

  globalShortcut.register('F12', async () => {
    if (!mainWindow) return;

    try {
      const image = await mainWindow.webContents.capturePage();
      const downloadsPath = app.getPath('downloads');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = path.join(downloadsPath, filename);

      fs.writeFileSync(filePath, image.toPNG());

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
