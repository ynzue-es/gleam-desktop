const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setPkceData: (data) => ipcRenderer.invoke("set-pkce-data", data),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  onAuthSuccess: (callback) => {
    ipcRenderer.on("auth-success", () => callback());
  },
  getTokens: () => ipcRenderer.invoke("get-tokens"),
  clearTokens: () => ipcRenderer.invoke("clear-tokens"),
});