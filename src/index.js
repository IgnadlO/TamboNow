const { app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const modulo = require('./conexion');


require('electron-reload')(__dirname, ({
	electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
	})
)

let mainWindow;

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

function createWindow() {
	mainWindow = new BrowserWindow({
		height: 768,
		width: 1024,
		webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../public/views/index.html'),
		protocol: 'file',
		slashes: true
	}));

	// const  mainMenu = Menu.buildFromTemplate(templateMenu);
	// Menu.setApplicationMenu(mainMenu);

	mainWindow.on('closed', () => {
		mainWindow = null
	});
}

ipcMain.on('sinParametros', async (event, arg) => {
  const respuesta = await modulo[arg]();
  event.returnValue = respuesta;
})

ipcMain.on('conParametros', async (event, funcion, arg) => {
  const respuesta = await modulo[funcion](arg);
  event.returnValue = respuesta;
})


const templateMenu = [
	{
 	label: 'File',
 	submenu: [{
 		label: 'Salir',
 		click() {
 		alert('salir')
 		}
	}]
}]
