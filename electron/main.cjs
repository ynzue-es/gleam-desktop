const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  app.setAsDefaultProtocolClient("gleam");

  ipcMain.handle("open-external", async (event, url) => {
    await shell.openExternal(url);
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (url.startsWith("gleam://auth/callback")) {
      win.webContents.send("auth-callback", url);
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
