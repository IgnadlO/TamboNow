import { ipcMain } from "electron";
import conexion from "./conexion";
import Main from "./main";

type tipoTambo = {
	id: number;
	nombre: string;
};

export default class Eventos {
	public static tamboActivo: tipoTambo;

	static main() {
		ipcMain.on("sinParametros", Eventos.puertoSinParametros);
		ipcMain.on("conParametros", Eventos.puertoConParametros);
		ipcMain.on("nuevoTamboActivo", Eventos.cambiarTamboActivo);
		ipcMain.on("verTamboActivo", (event) => {
			console.log(Eventos.tamboActivo);
			event.returnValue = Eventos.verTamboActivo;
		});
	}

	static async puertoSinParametros(event, funcion) {
		const respuesta = await conexion.ruta(funcion, false);
		event.returnValue = respuesta;
	}

	static async puertoConParametros(event, funcion, arg) {
		const respuesta = await conexion.ruta(funcion, arg);
		event.returnValue = respuesta;
	}

	static get verTamboActivo() {
		return Eventos.tamboActivo;
	}

	static cambiarTamboActivo(event, arg) {
		Eventos.tamboActivo = arg;
		event.returnValue = true;
	}
}