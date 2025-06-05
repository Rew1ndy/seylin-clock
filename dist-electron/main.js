import { screen, BrowserWindow, ipcMain, app } from "electron";
import path$1 from "path";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 250;
  const winHeight = 100;
  const win2 = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: winWidth,
    height: winHeight,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    transparent: true,
    roundedCorners: true,
    hasShadow: false,
    vibrancy: "fullscreen-ui",
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  const x = screenWidth - winWidth - 20;
  const y = screenHeight - winHeight - 20;
  win2.setBounds({ x, y, width: winWidth, height: winHeight });
  win2 == null ? void 0 : win2.webContents.openDevTools();
  return win2;
}
function loadRenderer(win2) {
  win2.webContents.on("did-finish-load", () => {
    win2 == null ? void 0 : win2.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win2.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win2.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
function createDialogWindow(mainWindow, windowType = "timer") {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const dialogWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: true,
    modal: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path$1.join(MAIN_DIST, "preload.mjs")
    }
  });
  dialogWindow.webContents.openDevTools();
  const winWidth = 400;
  const winHeight = 200;
  const x = screenWidth - winWidth - 20;
  const y = screenHeight - winHeight - 20;
  dialogWindow.setBounds({ x, y, width: winWidth, height: winHeight });
  if (VITE_DEV_SERVER_URL) {
    dialogWindow.loadURL(`${VITE_DEV_SERVER_URL}?window=${windowType}`);
  } else {
    dialogWindow.loadFile(path$1.join(RENDERER_DIST, "index.html"), {
      hash: `window=${windowType}`
    });
  }
  dialogWindow.webContents.on("did-finish-load", () => {
    dialogWindow.webContents.send("main-process-message", `Окно ${windowType} загружено`);
  });
  return dialogWindow;
}
function setupIpcHandlers() {
  ipcMain.on("close-window", () => {
    console.log("Закрытие окна");
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin == null ? void 0 : currentWin.close();
  });
  ipcMain.on("move-window", (_event, data) => {
    const currentWin = BrowserWindow.getFocusedWindow();
    if (!currentWin) return;
    const bounds = currentWin.getBounds();
    currentWin.setBounds({
      x: bounds.x + data.deltaX,
      y: bounds.y + data.deltaY,
      width: bounds.width,
      height: bounds.height
    });
  });
  ipcMain.on("set-window-size", (_event, size) => {
    console.log("Изменение размера окна:", size);
    const currentWin = BrowserWindow.getFocusedWindow();
    if (currentWin) currentWin.setBounds({ width: size.width, height: size.height });
  });
  ipcMain.on("toggle-window", (_event, isUnbound) => {
    console.log("Unbound: ", isUnbound);
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin == null ? void 0 : currentWin.setAlwaysOnTop(!isUnbound);
  });
  ipcMain.on("pos-event-button", (_event, target) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    console.log("Left clicked!", target);
    switch (target.pos) {
      case 0:
        break;
      case 1:
        console.log("Main button");
        createDialogWindow(mainWindow, "timer");
        break;
    }
  });
  ipcMain.on("timer-loaded", (_event, message) => {
    console.log("Сообщение от таймера:", message);
    _event.sender.send("main-process-message", "Привет от основного процесса!");
  });
  ipcMain.on("timer-function-start", (_event, message) => {
    console.log(message);
    const mainWindow = BrowserWindow.getAllWindows().find((win2) => win2.webContents !== _event.sender);
    mainWindow == null ? void 0 : mainWindow.webContents.send("timer-function-start", message);
  });
}
let win;
app.whenReady().then(() => {
  win = createMainWindow();
  loadRenderer(win);
  win.setBackgroundMaterial("auto");
  setInterval(() => {
    const currentTime = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    win == null ? void 0 : win.webContents.send("update-time", currentTime);
  }, 1e3);
  win == null ? void 0 : win.on("resize", () => {
    win == null ? void 0 : win.webContents.send("window-resized", win == null ? void 0 : win.getBounds());
  });
  setupIpcHandlers();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    win = createMainWindow();
    loadRenderer(win);
  }
});
app.commandLine.appendSwitch("disable-network");
app.commandLine.appendSwitch("disable-sync");
export {
  win
};
