const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Force all app data (cache, cookies, GPU cache, etc.) into a local folder
// so nothing is written to AppData or other system locations.
if (app.isPackaged) {
  const portableDir = path.dirname(process.execPath);
  const dataDir = path.join(portableDir, 'data');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    app.setPath('userData', dataDir);
    app.setPath('sessionData', path.join(dataDir, 'session'));
    app.setPath('logs', path.join(dataDir, 'logs'));
    app.setPath('crashDumps', path.join(dataDir, 'crashDumps'));
  } catch (e) {
    console.error('Could not set portable data paths:', e);
  }
}

let mainWindow;
let lockedUrl = 'https://example.com';
let windowTitle = 'Locked Browser';

function loadConfig() {
  try {
    let configPath;
    if (app.isPackaged) {
      configPath = path.join(path.dirname(process.execPath), 'config.json');
    } else {
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

      // Save screenshots inside the portable folder
      let screenshotsDir;
      if (app.isPackaged) {
        screenshotsDir = path.join(path.dirname(process.execPath), 'screenshots');
      } else {
        screenshotsDir = path.join(__dirname, 'screenshots');
      }
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const filePath = path.join(screenshotsDir, filename);

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
