import { app, BrowserWindow, ipcMain } from 'electron';
import createMainWindow from './window';
import { loadRenderer } from './renderer';
import { setupIpcHandlers } from './ipcHandlers';

export let win: BrowserWindow | null;

app.whenReady().then(() => {
  win = createMainWindow();
  loadRenderer(win);
  win.setBackgroundMaterial('auto');
  
  setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    win?.webContents.send("update-time", currentTime);
  }, 1000);
  
  win?.on('resize', () => {
    win?.webContents.send("window-resized", win?.getBounds());
  });

  // Регистрируем все обработчики IPC в основном процессе
  setupIpcHandlers();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    win = createMainWindow();
    loadRenderer(win);
  }
});

app.commandLine.appendSwitch("disable-network");
app.commandLine.appendSwitch("disable-sync");
