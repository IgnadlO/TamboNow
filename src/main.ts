import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import Conexion from "./conexion";

type tipoTambo = {
  id: number,
  nombre: string
}

class Main {
  static application = app;
  static ipcMain = ipcMain;
  static conexion = Conexion;
  static mainWindow: BrowserWindow;

  private static createWindow() {
    Main.mainWindow = new BrowserWindow({ 
        height: 768, 
        width: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    Main.mainWindow.loadFile(
      path.join(__dirname, "../public/views/index.html")
    );
    Main.mainWindow.webContents.openDevTools();
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

  static async puertoSinParametros(event,funcion) {
    const respuesta = await Main.conexion.ruta(funcion, false);
    event.returnValue = respuesta;
  }

  static async puertoConParametros(event, funcion, arg) {
    const respuesta = await Main.conexion.ruta(funcion,arg);
    event.returnValue = respuesta;
  }
}


function main() {
  let tamboActivo: tipoTambo;
  Main.application.on("window-all-closed", Main.onWindowsAllClosed);
  Main.application.on("ready", Main.onReady);
  Main.ipcMain.on("sinParametros", Main.puertoSinParametros);
  Main.ipcMain.on("conParametros", Main.puertoConParametros);
  ipcMain.on("nuevoTamboActivo", cambiarTamboActivo);
  ipcMain.on("verTamboActivo", event => {event.returnValue = tamboActivo});

  function cambiarTamboActivo(event, arg){
    tamboActivo = arg;
    event.returnValue = true;
  }

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