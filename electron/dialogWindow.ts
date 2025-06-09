// electron/dialog-window.ts
import { BrowserWindow, screen } from "electron";
import path from "path";
import { VITE_DEV_SERVER_URL, RENDERER_DIST, MAIN_DIST } from "./constants";

export function createDialogWindow(mainWindow: any, windowType: string) {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = mainWindow.getBounds().width;
  const winHeight = mainWindow.getBounds().height;

  const dialogWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    resizable: true,
    modal: true,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    minimizable: false,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(MAIN_DIST, 'preload.mjs')
    },
  });

  // Для отладки
  // dialogWindow.webContents.openDevTools();

  const x = screenWidth - winWidth - 20; // 20px отступ от правого края
  const y = screenHeight - winHeight - 20; // 20px отступ от нижнего края

  dialogWindow.setBounds({ x, y, width: winWidth, height: winHeight });
  
  if (VITE_DEV_SERVER_URL) {
    dialogWindow.loadURL(`${VITE_DEV_SERVER_URL}?window=${windowType}`);
  } else {
    dialogWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: `window=${windowType}`
    });
  }

  dialogWindow.webContents.on("did-finish-load", () => {
    dialogWindow.webContents.send("main-process-message", `Window ${windowType} loaded`);
  });

  return dialogWindow;
}