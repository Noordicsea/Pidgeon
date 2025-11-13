const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { existsSync, appendFileSync } = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

// Fix cache issues on Windows - configure cache directory
if (process.platform === 'win32') {
  const os = require('os');
  // Set cache to temp directory which always has write permissions
  const cacheDir = join(os.tmpdir(), `electron-cache-${process.pid}`);
  app.commandLine.appendSwitch('disk-cache-dir', cacheDir);
  app.commandLine.appendSwitch('disk-cache-size', '104857600'); // 100MB limit
}

// Suppress Chromium's stderr output (cache errors, etc.)
const logFile = join(__dirname, 'electron-debug.log');
let consoleWindow = null;
let logBuffer = [];

// Intercept stderr early to catch Chromium errors
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = function(chunk, encoding, fd) {
  const message = chunk.toString();
  
  // Filter out known harmless errors
  if (
    message.includes('Unable to move the cache') ||
    message.includes('Unable to create cache') ||
    message.includes('Gpu Cache Creation failed') ||
    message.includes('Autofill.enable') ||
    message.includes('Autofill.setAddresses') ||
    message.includes('ERROR:net\\disk_cache') ||
    message.includes('ERROR:gpu\\ipc')
  ) {
    // Log to file
    try {
      appendFileSync(logFile, `[${new Date().toISOString()}] ${message}`, 'utf8');
    } catch (e) {
      // Ignore file write errors
    }
    
    // Buffer for console window
    if (message.trim()) {
      logBuffer.push(message.trim());
      // Update console window if it exists
      if (consoleWindow && !consoleWindow.isDestroyed()) {
        updateConsoleWindow();
      }
    }
    return true; // Suppress from terminal
  }
  
  // Allow other errors through
  return originalStderrWrite(chunk, encoding, fd);
};

function createConsoleWindow() {
  if (!isDev || consoleWindow) return;
  
  consoleWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Electron Debug Console',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Allow require() for dev console only
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Electron Debug Console</title>
  <style>
    body {
      margin: 0;
      padding: 10px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      background: #1e1e1e;
      color: #d4d4d4;
      overflow: auto;
    }
    #log {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .error { color: #f48771; }
    .info { color: #4ec9b0; }
    .timestamp { color: #808080; font-size: 10px; }
  </style>
</head>
<body>
  <div id="log"></div>
  <script>
    const logDiv = document.getElementById('log');
    function addLog(message, type = 'info') {
      const div = document.createElement('div');
      div.className = type;
      const timestamp = new Date().toLocaleTimeString();
      div.innerHTML = '<span class="timestamp">[' + timestamp + ']</span> ' + 
        message.replace(/\\n/g, '<br>');
      logDiv.appendChild(div);
      logDiv.scrollTop = logDiv.scrollHeight;
    }
    
    // Listen for log updates from main process
    const { ipcRenderer } = require('electron');
    ipcRenderer.on('log-message', (event, message, type) => {
      addLog(message, type);
    });
    
    addLog('Electron Debug Console Ready', 'info');
    addLog('Suppressed errors are logged here and to electron-debug.log', 'info');
  </script>
</body>
</html>
  `;

  consoleWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  
  consoleWindow.on('closed', () => {
    consoleWindow = null;
  });
}

function updateConsoleWindow() {
  if (consoleWindow && !consoleWindow.isDestroyed() && logBuffer.length > 0) {
    // Send buffered messages in batches
    const messages = logBuffer.splice(0, Math.min(50, logBuffer.length));
    messages.forEach(msg => {
      try {
        consoleWindow.webContents.send('log-message', msg, 'error');
      } catch (e) {
        // Window might be closing
      }
    });
    // Schedule next batch if more messages exist
    if (logBuffer.length > 0) {
      setTimeout(updateConsoleWindow, 100);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    frame: false, // Remove default title bar
    titleBarStyle: 'hidden', // Hide title bar on macOS
    autoHideMenuBar: true, // Hide menu bar
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove menu bar completely
  mainWindow.setMenuBarVisibility(false);

  // Handle window maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize-changed', true);
  });
  
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize-changed', false);
  });

  // Clean up mainWindow reference when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // DevTools will NOT open automatically - user can open with F12 if needed
  } else {
    const indexPath = join(__dirname, 'dist', 'index.html');
    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Built files not found. Please run npm run build first.');
      app.quit();
    }
  }
}

// IPC handlers for window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

app.whenReady().then(() => {
  // Set cache path after app is ready (more reliable)
  if (process.platform === 'win32') {
    try {
      const os = require('os');
      const cachePath = join(os.tmpdir(), `electron-cache-${process.pid}`);
      app.setPath('cache', cachePath);
    } catch (error) {
      // Ignore - errors are being suppressed anyway
    }
  }
  
  // Create console window in dev mode (with slight delay to ensure it's ready)
  if (isDev) {
    setTimeout(() => {
      createConsoleWindow();
      // Process any buffered messages
      setTimeout(updateConsoleWindow, 200);
    }, 500);
  }
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up on exit
app.on('before-quit', () => {
  if (consoleWindow && !consoleWindow.isDestroyed()) {
    consoleWindow.close();
  }
});
