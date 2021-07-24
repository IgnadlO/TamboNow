import * as path from "path";
import * as sqlite3 from "sqlite3";
sqlite3.verbose();

export default class Conexion {
	private static rutas: object;
	private static dbPath = path.resolve(__dirname, "../Docs/database.db");
	private static db = new sqlite3.Database(Conexion.dbPath);

	static ruta(funcion: string, arg: string | boolean) {
		return Conexion[funcion](arg);
	}

	private static crearTambo(name) {
		console.log("crearTambo se activo");
		const data = {
			nombre: name,
		};
		Conexion.db.serialize(() => {
			Conexion.db.run(
				"INSERT INTO tambos(nombre) VALUES(?)",
				[name],
				(err) => {
					if (err) {
						throw err;
						console.log(err);
					}
					console.log("Tambo creado");
				}
			);
		});
		return "hello world!";
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

	private static devolver(arg) {
		return new Promise((res, rej) => {
			res(arg);
		});
	}
}