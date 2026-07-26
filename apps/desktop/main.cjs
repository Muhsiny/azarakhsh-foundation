const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const SITE_URL = "https://azarakhsh-foundation.sjzjan420.workers.dev";

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#083f36",
    title: "بنیاد آذرخش",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadURL(SITE_URL).catch(() => {
    win.loadFile(path.join(__dirname, "../web/index.html"));
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(SITE_URL)) return { action: "allow" };
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
