const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hud', {
  appInfo: () => ipcRenderer.invoke('app:info'),
});
