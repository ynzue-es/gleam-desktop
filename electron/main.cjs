const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const http = require("http");
const { exchangeCodeForToken } = require("./tokens.js");

function startOAuthServer(win) {
  const server = http.createServer(async (req, res) => {
    console.log("📥 Requête reçue:", req.method, req.url);

    if (req.url.startsWith("/callback")) {
      try {
        const url = new URL(req.url, "http://localhost:4545");
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        const desc = url.searchParams.get("error_description");
        console.log("➡️ Code reçu:", code);
        if (error) {
          console.error("❌ Erreur OAuth2:", error, desc);
        }
        console.log("🔄 Échange du code contre un token…");
        const tokens = await exchangeCodeForToken(code, global.pkceVerifier);
        console.log("✅ Tokens reçus:", tokens);
        await keytar.setPassword("gleam-desktop", "oauth-tokens", JSON.stringify(tokens));
        console.log("🔐 Tokens stockés dans Keytar");
        win.webContents.send("auth-success");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h2>Connexion réussie, vous pouvez retourner sur Gleam ✅</h2>");
      } catch (err) {
        console.error("🔥 Erreur dans le callback OAuth:", err);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h2>Erreur lors de la connexion ❌</h2><pre>" + err.message + "</pre>");
      } finally {
        server.close();
      }
    } else {
      console.log("❌ Route inconnue:", req.url);
      res.writeHead(404);
      res.end("Not Found");
    }
  });
  server.listen(4545, "127.0.0.1", () => {
    console.log("🚀 OAuth callback server running on http://127.0.0.1:4545");
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
    //win.webContents.openDevTools();
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
  //   if (url.startsWith("http://localhost:4545/callback")) {
  //     win.webContents.send("auth-callback", url);
  //   }
  // });
}



app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

