import { BrowserWindow, ipcMain } from "electron";

export function setupIpcHandlers() {
  // Обработчик для закрытия окна
  ipcMain.on("close-window", () => {
    console.log("Закрытие окна");
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin?.close();
  });

  // Обработчик для перемещения окна
  ipcMain.on("move-window", (_event, data) => {
    console.log("Получено перемещение:", data);
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

  // Тестовый обработчик
  ipcMain.on("test-message", (_event, message) => {
    console.log("Получено сообщение:", message);
  });

  // Обработчик для изменения размера окна
  ipcMain.on("set-window-size", (_event, size) => {
    console.log("Изменение размера окна:", size);
    const currentWin = BrowserWindow.getFocusedWindow();
    if (currentWin) currentWin.setBounds({ width: size.width, height: size.height });
  });
}