import * as path from "path";
import * as sqlite3 from "sqlite3";
import { datosPrin } from '../servet'
sqlite3.verbose();

export default class Conexion {
	private static rutas: object;
	private static dbPath = path.resolve(__dirname, "../Docs/database.db");
	private static db = new sqlite3.Database(Conexion.dbPath);

	static ruta(funcion: string, arg: any) {
		return Conexion[funcion](arg);
	}

	private static crearTambo(name) {
		console.log(name);
		return new Promise((resolve, rej) =>{
			Conexion.db.serialize(() => {
				Conexion.db.run(
					"INSERT INTO tambos(nombre) VALUES(?)",
					[name],
					(err, res) => {
						if (err) {
							rej(err);
							console.log(err);
						} else {
							console.log("Tambo creado");
							resolve(Conexion.obtenerTamboId(name));
						}
					}
				);
			});
		});
	}

	private static obtenerTamboId(nombre){
		return new Promise((res, rej) => {
			Conexion.db.all('SELECT * FROM tambos WHERE nombre = ?', nombre, (err, result) => {
				if(err) console.log(err)
				res(result);
			});
		});
	}

	private static borrarTambo(tambo){
		return new Promise((res, rej) => {
			Conexion.db.run('DELETE FROM tambos WHERE id = ?', tambo.id, (err) => {
				if(err){ 
					console.log(err);
					rej(false);
				}
				res(true);
			});
		});
	}

	private static leerTambo() {
		return new Promise((resolve, reject) => {
			Conexion.db.all("SELECT * FROM tambos", (err, result) => {
				if (err) {
					console.log(err);
					reject(err);
				} else resolve(result);
			});
		});
	}

	private static nuevoControlPrincipal(datos: datosPrin[]){
		return new Promise((res, rej) => {
			for (let dato of datos){
				Conexion.db.run('INSERT INTO datosPrincipales(rp,lactancia,parto,del,tacto,tambo) VALUES(?,?,?,?,?,?)', 
					[dato.rp,dato.lactancia,dato.parto,dato.del,dato.tacto,dato.tambo],
					err => {
					if(err) rej(err);
					console.log(err)
				})
			}
			res(true);
		})
	}

	private static verControlPrincipal(tambo: number){
		return new Promise((res, rej) => {
			Conexion.db.all("SELECT * FROM datosPrincipales", (err, result) => {
				if (err) {
					console.log(err);
					rej(err);
				} else res(result);
			});
		});
	}

	private static devolver(arg) {
		return new Promise((res, rej) => {
			res(arg);
		});
	}
}