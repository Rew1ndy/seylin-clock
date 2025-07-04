import { BrowserWindow, screen } from "electron";
import path from "path";
import { __dirname } from "./constants";


export default function createMainWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    const winWidth = 350;
    const winHeight = 150;

    const win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        width: winWidth,
        height: winHeight,
        alwaysOnTop: true,
        frame: false,
        resizable: true,
        minimizable: false,
        transparent: true,
        roundedCorners: true,
        hasShadow: false,
        vibrancy: 'fullscreen-ui',
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    })

    const x = screenWidth - winWidth - 20; // 20px отступ от правого края
    const y = screenHeight - winHeight - 20; // 20px отступ от нижнего края

    win.setBounds({ x, y, width: winWidth, height: winHeight });
    // win?.webContents.openDevTools();

    return win;
}