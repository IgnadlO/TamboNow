import * as path from "path";
import * as sqlite3 from "sqlite3";
import { datosPrin, datosSec, tipoControlSubir } from '../index'
sqlite3.verbose();

export default class Conexion {
	private static rutas: object;
	private static dbPath = `${__dirname}/../schema/database.db`;
	private static db = new sqlite3.Database(Conexion.dbPath);
	// private static db = new sqlite3.Database(':memory:');

	static ruta(funcion: string, arg: any) {
		return Conexion[funcion](arg);
	}

	private static limpiarDB() { //borrar los datos de la base de datos (salvo el tambo "Cacho")
		Conexion.db.run('DELETE FROM tambos WHERE id > 1', (err) => {
				if(err) console.log(err);
			});
		Conexion.db.run('DELETE FROM datosPrincipales WHERE idVaca > 14', (err) => {
				if(err) console.log(err);
			});
		Conexion.db.run('DELETE FROM datosSecundarios WHERE idVaca > 14', (err) => {
				if(err) console.log(err);
			});
		console.log('DB limpiada');
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
			});
			Conexion.db.all(`select S.idVaca from datosPrincipales P inner join datosSecundarios S on P.idVaca=S.idVaca where P.tambo = ?`, tambo.id, (err, result) => {
				if (err) {
					console.log(err);
					rej(err);
				} else {
					if(result.length != 0){
						for(let dato of result){
							Conexion.db.run(`DELETE FROM datosSecundarios WHERE idVaca= ?`, dato.idVaca, (err) => {
								if (err) {
									console.log(err);
									rej(err);
								}
							});
						}
					}
				}
			});
			Conexion.db.run(`DELETE FROM datosPrincipales WHERE tambo = ?`, tambo.id, (err) => {
				if (err) {
					console.log(err);
					rej(err);
				}
			});
			res(true);
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

	private static subirControlPrincipal(datos: tipoControlSubir){
		return new Promise((res, rej) => {
			for (let dato of datos.nv){ //datos nuevos
				Conexion.db.run('INSERT INTO datosPrincipales(rp,lactancia,parto,del,tacto,tambo) VALUES(?,?,?,?,?,?)', 
					[dato.rp,dato.lactancia,dato.parto,dato.del,dato.tacto,dato.tambo],
					err => {
					if(err) rej(err);
				})
			}
			for (let dato of datos.ac){ //datos que se actualizan
				Conexion.db.run('UPDATE datosPrincipales SET lactancia = ?, parto = ?, del = ?, tacto = ? WHERE rp = ? AND tambo = ?', 
					[dato.lactancia,dato.parto,dato.del,dato.tacto,dato.rp,dato.tambo],
					err => {
					if(err) rej(err);
				})
			}
			for (let dato of datos.br){ //datos que se deben borrar
				console.log(dato);
				Conexion.db.run('DELETE FROM datosPrincipales WHERE idVaca = ?', 
					dato,
					err => {
					if(err) rej(err);
					else {
						Conexion.db.run('DELETE FROM datosSecundarios WHERE idVaca = ?', 
						dato,
						err => {
						if(err) rej(err);
						})
					}
				})
			}	
			res(true);
		})
	}

	private static subirControlSecundario(datos: datosSec[]){
		return new Promise((res, rej) => {
			for (let dato of datos){
				Conexion.db.run('INSERT INTO datosSecundarios(leche,rcs,totalCs,tanque,score,fecha,idVaca) VALUES(?,?,?,?,?,?,?)', 
					[dato.leche,dato.rcs,dato.totalCs,dato.tanque,dato.score,dato.fecha,dato.idVaca],
					err => {
					if(err) rej(err);
				})
			}
			res(true);
		})
	}

	private static verControlPrincipal(tambo: number){
		return new Promise((res, rej) => {
			Conexion.db.all("SELECT * FROM datosPrincipales WHERE tambo = ?", tambo, (err, result) => {
				if (err) {
					console.log(err);
					rej(err);
				} else res(result);
			});
		});
	}

	private static verControlSecundario(tambo: number){
		return new Promise((res, rej) => {
			Conexion.db.all(`select S.idVaca,S.rcs, S.fecha, S.leche, S.tanque, S.score from datosPrincipales P inner join datosSecundarios S on P.idVaca=S.idVaca where P.tambo = ?`, tambo, (err, result) => {
				if (err) {
					console.log(err);
					rej(err);
				} else res(result);
			});
		});
	}	

	private static verControlSecundarioOrdenado(tambo: number){
		return new Promise((res, rej) => {
			Conexion.db.all(`select S.idVaca, S.rcs, S.fecha, S.leche, S.tanque, S.score from datosPrincipales P inner join datosSecundarios S on P.idVaca=S.idVaca where P.tambo = ? ORDER BY S.idVaca DESC;`, tambo, (err, result) => {
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