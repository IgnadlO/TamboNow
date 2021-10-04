import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import Eventos from './eventos';

export default class Main {
  static application = app;
  static mainWindow: BrowserWindow;

  private static createWindow() {
    Main.mainWindow = new BrowserWindow({ 
        height: 768, 
        width: 800,
        icon: path.join(__dirname , '..' , 'public', 'img', 'Daco_4003289.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
        // webPreferences: {
        //   preload: path.join(__dirname, '..', 'public', 'js', 'index.js')
        // }
    });
    Main.mainWindow.loadFile(
      path.join(__dirname, "../public/views/index.html")
    );
    // Main.mainWindow.webContents.openDevTools();
  }

  static onReady() {
    Main.createWindow();
    Main.application.on("activate", function () {
      if (BrowserWindow.getAllWindows().length === 0) Main.createWindow();
    });
  }

  static onWindowsAllClosed() {
    if (process.platform !== "darwin") {
      Main.application.quit();
    }
  }
}

function main() {
  Main.application.on("window-all-closed", Main.onWindowsAllClosed);
  Main.application.on("ready", Main.onReady);
  Eventos.main();

  const templateMenu = [
    {
      label: "File",
      submenu: [
        {
          label: "Salir",
          click() {
            alert("salir");
          },
        },
      ],
    },
  ];
}

main();