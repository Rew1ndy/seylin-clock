// electron/dialog-window.ts
import { BrowserWindow, screen } from "electron";
import path from "path";
import { VITE_DEV_SERVER_URL, RENDERER_DIST, MAIN_DIST } from "./constants";

export function createDialogWindow(mainWindow: any, windowType: string = 'timer') {
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
      preload: path.join(MAIN_DIST, 'preload.mjs')
    },
  });

  // Для отладки
  dialogWindow.webContents.openDevTools();
      

  const winWidth = 400;
  const winHeight = 200;

  const x = screenWidth - winWidth - 20; // 20px отступ от правого края
  const y = screenHeight - winHeight - 20; // 20px отступ от нижнего края

  dialogWindow.setBounds({ x, y, width: winWidth, height: winHeight });
  
  if (VITE_DEV_SERVER_URL) {
    // Добавляем параметр window к URL
    dialogWindow.loadURL(`${VITE_DEV_SERVER_URL}?window=${windowType}`);
  } else {
    // В продакшене загружаем тот же index.html, но с параметром в хэше
    // URL хэш сохраняется даже при загрузке файла
    dialogWindow.loadFile(path.join(RENDERER_DIST, "index.html"), {
      hash: `window=${windowType}`
    });
  }

  // Отправляем сообщение после загрузки окна
  dialogWindow.webContents.on("did-finish-load", () => {
    dialogWindow.webContents.send("main-process-message", `Окно ${windowType} загружено`);
  });

  return dialogWindow;
}