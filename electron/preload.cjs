const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  onAuthCallback: (callback) => {
    ipcRenderer.on("auth-callback", (event, data) => callback(data));
  },
});