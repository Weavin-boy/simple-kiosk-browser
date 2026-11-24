const { app, BrowserWindow, dialog, nativeImage, session } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Force all app data into a local folder (fully portable)
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

function isValidHttpsUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAllowedUrl(url) {
  try {
    return new URL(url).origin === new URL(lockedUrl).origin;
  } catch {
    return false;
  }
}

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
      const candidate = config.url || lockedUrl;
      if (isValidHttpsUrl(candidate)) {
        lockedUrl = candidate;
      } else {
        console.error('config.json url must be a valid https:// URL, using default');
      }
      windowTitle = config.title || windowTitle;
      console.log('Loaded config from', configPath, { lockedUrl, windowTitle });
    } else {
      console.log('No config.json found at', configPath, '- using defaults');
    }
  } catch (err) {
    console.error('Failed to load config.json, using defaults:', err.message);
  }
}

function downloadFavicon(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') {
        return resolve(null);
      }
    } catch {
      return resolve(null);
    }

    const req = https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      const chunks = [];
      let size = 0;
      const maxBytes = 1024 * 1024; // 1 MB
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
          req.destroy();
          return resolve(null);
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        try {
          const img = nativeImage.createFromBuffer(Buffer.concat(chunks));
          resolve(img.isEmpty() ? null : img);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function takeScreenshot() {
  if (!mainWindow) return;
  try {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();

    await new Promise((r) => setTimeout(r, 150));

    const image = await mainWindow.webContents.capturePage();
    if (image.isEmpty()) {
      throw new Error('Captured image is empty (window may have been occluded or not ready)');
    }

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
    console.log('Screenshot saved to', filePath);

    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Screenshot saved',
      message: `Saved to:\n${filePath}`,
      buttons: ['OK'],
    });
  } catch (err) {
    console.error('Screenshot failed:', err);
    dialog.showErrorBox('Screenshot failed', err.message || String(err));
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
      devTools: false,
      enableBlinkFeatures: 'Gamepad',
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadURL(lockedUrl);

  mainWindow.webContents.on('page-favicon-updated', async (event, favicons) => {
    if (favicons && favicons.length > 0) {
      const icon = await downloadFavicon(favicons[0]);
      if (icon) {
        mainWindow.setIcon(icon);
        console.log('Set window icon from favicon');
      }
    }
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
      console.log('Blocked navigation to:', url);
    }
  });

  mainWindow.webContents.on('will-redirect', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('will-frame-navigate', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    const { key, control, alt, meta, shift } = input;

    // F11: toggle fullscreen (only when this window is focused)
    if (key === 'F11') {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      }
      return;
    }

    // F12: screenshot
    if (key === 'F12') {
      event.preventDefault();
      takeScreenshot();
      return;
    }

    // Allow F1 and F3 to pass through to the page
    if (key === 'F1' || key === 'F3') {
      return;
    }

    // Allow all Ctrl/Cmd, Alt, and Shift (and combinations) so the page receives them
    if (control || meta || alt || shift) {
      return;
    }

    // Still block bare function keys that could refresh or escape the lock
    const blocked =
      key === 'F5' ||
      key === 'F6' ||
      key === 'F7' ||
      key === 'F8' ||
      key === 'F9' ||
      key === 'F10';

    if (blocked) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        // Prevent multiple gamepad loops
        if (window.__lockedBrowserGamepad) return;
        window.__lockedBrowserGamepad = true;

        let lastButtons = [];
        function pollGamepad() {
          const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
          for (const gp of gamepads) {
            if (!gp) continue;
            const buttons = gp.buttons.map(b => b.pressed);
            if (buttons[0] && !lastButtons[0]) {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F12', keyCode: 123, bubbles: true }));
            }
            if ((buttons[1] || buttons[9]) && !(lastButtons[1] || lastButtons[9])) {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F11', keyCode: 122, bubbles: true }));
            }
            lastButtons = buttons;
          }
          requestAnimationFrame(pollGamepad);
        }
        window.addEventListener('gamepadconnected', () => console.log('Gamepad connected'));
        pollGamepad();

        // Auto pointer lock on right-click so mouse stays locked during drag
        let rightButtonDown = false;

        document.addEventListener('mousedown', (e) => {
          if (e.button === 2) {
            rightButtonDown = true;
            e.preventDefault();
            const target = (e.target && e.target.requestPointerLock) ? e.target : document.body;
            if (target && target.requestPointerLock) {
              target.requestPointerLock().catch(() => {
                document.body.requestPointerLock().catch(() => {});
              });
            }
          }
        }, true);

        document.addEventListener('mouseup', (e) => {
          if (e.button === 2 && rightButtonDown) {
            rightButtonDown = false;
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
          }
        }, true);

        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        }, true);

        window.addEventListener('blur', () => {
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          rightButtonDown = false;
        });
      })();
    `).catch(err => console.error('Failed to inject scripts:', err));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  loadConfig();

  const allowedPermissions = new Set([
    'clipboard-read',
    'clipboard-sanitized-write',
    'pointerLock',
    'keyboardLock',
  ]);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const requestingUrl = details && details.requestingUrl;
    const ok = allowedPermissions.has(permission) && isAllowedUrl(requestingUrl);
    callback(ok);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    return allowedPermissions.has(permission) && isAllowedUrl(requestingOrigin);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
