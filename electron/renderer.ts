import path from "path";
import { VITE_DEV_SERVER_URL, RENDERER_DIST } from "./constants";

export function loadRenderer(win: any) {
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL); // В режиме разработки загружаем Vite-сервер
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html")); // В продакшене загружаем HTML
  }
}
