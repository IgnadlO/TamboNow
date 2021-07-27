import { ipcMain } from "electron";
import conexion from "./conexion";
import Main from './main';

type tipoTambo = {
	id: number;
	nombre: string;
};

export default class Eventos {
	public tamboActivo: tipoTambo;

	constructor(tamboActivo: tipoTambo) {
		this.tamboActivo = tamboActivo;
		this.main();
	}

	main() {
		ipcMain.on("sinParametros", this.puertoSinParametros);
		ipcMain.on("conParametros", this.puertoConParametros);
		ipcMain.on("nuevoTamboActivo", this.cambiarTamboActivo);
		ipcMain.on("verTamboActivo", (event) => {
			event.returnValue = this.tamboActivo;
		});
	}

	async puertoSinParametros(event, funcion) {
		const respuesta = await conexion.ruta(funcion, false);
		event.returnValue = respuesta;
	}

	async puertoConParametros(event, funcion, arg) {
		const respuesta = await conexion.ruta(funcion, arg);
		event.returnValue = respuesta;
	}

	cambiarTamboActivo(event, arg) {
		console.log(arg);
		this.tamboActivo = arg;
		event.returnValue = true;
	}
}