import * as path from "path";
import * as sqlite3 from "sqlite3";
sqlite3.verbose();

type datosPrincipales = {
	rp: number,
	lactancia: number,
	parto: string,
	del: number,
	tacto: string | null,
	tambo: string
};

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
					"INSERT INTO tambos(nombre) VALUES(?); SELECT SCOPE_IDENTITY();",
					[name],
					(err, res) => {
						if (err) {
							rej(err);
							console.log(err);
						} else {
							console.log("Tambo creado");
							console.log(res);
							resolve(res);
						}
					}
				);
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

	private static get obtenerUltimoId(){
		return new Promise((res, rej) => {
			Conexion.db.all('SELECT SCOPE_IDENTITY()', (err, result) => {
				if(err) console.log(err)
				res(result);
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

	private static nuevoControlPrincipal(datos: datosPrincipales[]){
		return new Promise((res, rej) => {
			Conexion.db.run('INSERT INTO datosPrincipales VALUES(?)', datos, err => {
				if(err) rej(err);
				else res(true);
			})
		})
	}

	private static verControlPrincipal(tambo: string){
		return new Promise((res, rej) => {
			Conexion.db.all("SELECT * FROM datosPrincipales WHERE tambo = ?", tambo, (err, result) => {
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