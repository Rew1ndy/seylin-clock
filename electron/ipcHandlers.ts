import { BrowserWindow, ipcMain } from "electron";
import { createDialogWindow } from "./dialogWindow";
import { getLog, startLogging, stopLogging } from "./logger";

export function setupIpcHandlers() {
  ipcMain.on("close-window", () => {
    console.log("Window Closed");
    const currentWin = BrowserWindow.getFocusedWindow();
    currentWin?.close();
  });

  ipcMain.on("move-window", (_event, data) => {
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

  ipcMain.on("set-window-size", (_event, size) => {
    console.log("Window size changed:", size);
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
        createDialogWindow(mainWindow, 'timer');
        
        break;
      case 1:
        
        break;
      case 2:

        break;
      default:
        break;
    }
  });

  ipcMain.on("timer-function-start", (_event, message) => {
    console.log(message);
    const mainWindow = BrowserWindow.getAllWindows().find(win => win.webContents !== _event.sender);
    mainWindow?.webContents.send("timer-function-start", message);
  })

  ipcMain.on('start-logging', () => {
    console.log("start logging from main");
    setTimeout(() => {
      startLogging();
    }, 1000)
  });

  ipcMain.on('stop-logging', () => {
    console.log("stoped logging from main");
    stopLogging();
  });

  ipcMain.on('get-log', () => {
    return getLog();
  });
  
}