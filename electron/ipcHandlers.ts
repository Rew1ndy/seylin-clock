import { BrowserWindow, ipcMain } from "electron";
import { loadRenderer } from "./renderer";
import { createDialogWindow } from "./dialog-window";

export function setupIpcHandlers() {
  // Обработчик для закрытия окна
  ipcMain.on("close-window", () => {
    console.log("Закрытие окна");
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin?.close();
  });

  // Обработчик для перемещения окна
  ipcMain.on("move-window", (_event, data) => {
    // console.log("Получено перемещение:", data);
    const currentWin = BrowserWindow.getFocusedWindow();
    if (!currentWin) return;

    const bounds = currentWin.getBounds();
    
    currentWin.setBounds({
      x: bounds.x + data.deltaX, 
      y: bounds.y + data.deltaY,
      width: bounds.width,
      height: bounds.height,
    });
  });

  // Обработчик для изменения размера окна
  ipcMain.on("set-window-size", (_event, size) => {
    console.log("Изменение размера окна:", size);
    const currentWin = BrowserWindow.getFocusedWindow();
    if (currentWin) currentWin.setBounds({ width: size.width, height: size.height });
  });

  ipcMain.on("toggle-window", (_event, isUnbound) => {
    console.log("Unbound: ", isUnbound);
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin?.setAlwaysOnTop(!isUnbound);
  });

  ipcMain.on("pos-event-button", (_event, target) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    console.log("Left clicked!", target)
    switch (target.pos) {
      case 0:
        
        break;
      case 1:
        console.log("Main button")
        createDialogWindow(mainWindow, 'timer');
        break;
      case 2:

        break;
      default:
        break;
    }
  });

  ipcMain.on("timer-loaded", (_event, message) => {
    console.log("Сообщение от таймера:", message);
    // Можно отправить обратно какие-то данные
    _event.sender.send("main-process-message", "Привет от основного процесса!");
  });

  ipcMain.on("timer-function-start", (_event, message) => {
    console.log(message);
    const mainWindow = BrowserWindow.getAllWindows().find(win => win.webContents !== _event.sender);
    mainWindow?.webContents.send("timer-function-start", message);
    // console.log("Focused: ", mainWindow)
  })
}