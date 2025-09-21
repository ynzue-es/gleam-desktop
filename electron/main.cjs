const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const http = require("http");

function startOAuthServer(win) {
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/callback")) {
      const url = new URL(req.url, "http://localhost:3000");
      const code = url.searchParams.get("code");
      win.webContents.send("auth-callback", code);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h2>Connexion réussie, vous pouvez retourner sur Gleam ✅</h2>");
      server.close();
    }
  });

  server.listen(3000, "127.0.0.1", () => {
    console.log("OAuth callback server running on http://127.0.0.1:3000");
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  startOAuthServer(win);

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  //app.setAsDefaultProtocolClient("gleam");

  // handler pour ouvrir une URL externe
  ipcMain.handle("open-external", async (event, url) => {
    await shell.openExternal(url);
  });

  // handler pour PROD (protocol custom gleam://)
  // app.on("open-url", (event, url) => {
  //   event.preventDefault();
  //   if (url.startsWith("http://localhost:3000/callback")) {
  //     win.webContents.send("auth-callback", url);
  //   }
  // });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
