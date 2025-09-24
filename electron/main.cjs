const { app, BrowserWindow, ipcMain, shell, protocol } = require("electron");
const path = require("path");
const http = require("http");
const { exchangeCodeForToken } = require("./tokens.js");
const keytar = require("keytar");

// Mode: "server" (localhost) ou "protocol" (gleam://)
const OAUTH_MODE = process.env.NODE_ENV === "development" ? "server" : "protocol";

ipcMain.handle("set-pkce-data", (event, { verifier, state }) => {
  global.pkceVerifier = verifier;
  global.oauthState = state;
  console.log("📦 PKCE data reçue:", { verifier, state });
});

ipcMain.handle("get-tokens", async () => {
  const data = await keytar.getPassword("gleam-desktop", "oauth-tokens");
  return data ? JSON.parse(data) : null;
});

ipcMain.handle("clear-tokens", async () => {
  await keytar.deletePassword("gleam-desktop", "oauth-tokens");
  global.pkceVerifier = null;
  global.oauthState = null;
  console.log("Tokens détruies ❌");
  return true;
});

function startOAuthServer(win) {
  const server = http.createServer(async (req, res) => {
    if (req.url.startsWith("/callback")) {
      try {
        const url = new URL(req.url, "http://localhost:4545");
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        if (error) throw new Error(error);
        if (returnedState !== global.oauthState) throw new Error("Invalid state");
        const tokens = await exchangeCodeForToken(code, global.pkceVerifier);
        await keytar.setPassword("gleam-desktop", "oauth-tokens", JSON.stringify(tokens));
        win.webContents.send("auth-success");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h2>Connexion réussie, vous pouvez retourner sur Gleam ✅</h2>");
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h2>Erreur lors de la connexion ❌</h2><pre>" + err.message + "</pre>");
      } finally {
        server.close();
      }
    } else {
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
      contextIsolation: true, 
      nodeIntegration: false,
    },
  });
  if (OAUTH_MODE === "server") {
    console.log("🔧 Mode OAuth: serveur local (http://localhost:4545/callback)");
    startOAuthServer(win);
  } else {
    console.log("🔧 Mode OAuth: protocole custom (gleam://auth/callback)");
    app.setAsDefaultProtocolClient("gleam");
    app.on("open-url", async (event, url) => {
      event.preventDefault();
      if (url.startsWith("gleam://auth/callback")) {
        try {
          const parsed = new URL(url);
          const code = parsed.searchParams.get("code");
          const returnedState = parsed.searchParams.get("state");
          if (returnedState !== global.oauthState) throw new Error("Invalid state");
          const tokens = await exchangeCodeForToken(code, global.pkceVerifier);
          await keytar.setPassword("gleam-desktop", "oauth-tokens", JSON.stringify(tokens));
          win.webContents.send("auth-success");
          console.log("✅ Tokens reçus via protocole custom");
        } catch (err) {
          console.error("🔥 Erreur protocole:", err);
        }
      }
    });
  }

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  ipcMain.handle("open-external", async (event, url) => {
    await shell.openExternal(url);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});