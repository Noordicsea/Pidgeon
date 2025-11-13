const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window control APIs
  windowControls: {
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
    onMaximizeChange: (callback) => {
      ipcRenderer.on('window-maximize-changed', (_, isMaximized) => callback(isMaximized));
      return () => ipcRenderer.removeAllListeners('window-maximize-changed');
    }
  },
  // Authentication APIs
  auth: {
    register: (userData) => ipcRenderer.invoke('auth-register', userData),
    login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    getSession: (sessionId) => ipcRenderer.invoke('auth-get-session', sessionId),
    logout: (sessionId) => ipcRenderer.invoke('auth-logout', sessionId)
  },
  // Database APIs
  database: {
    isReady: () => ipcRenderer.invoke('db-is-ready')
  }
});
