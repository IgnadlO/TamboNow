const modulo = {};
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
// const Promise = require('bluebird')
const dbPath = path.resolve(__dirname, '../Docs/database.db');
const db = new sqlite3.Database(dbPath);

modulo.crearTambo = (name) => {
	console.log('hola');
	const data = {
		nombre: name
	};
	db.serialize(()=> {
		db.run('INSERT INTO tambos(nombre) VALUES(?)', [name], (err) =>{
			if(err) {
				throw err;
				console.log(err);
			}
			console.log('Tambo creado');
		})
	})
	return 'hello world!'
}

modulo.leerTambo = () => {
	return new Promise((resolve, reject) => {
		db.all("SELECT * FROM tambos", (err, result) => {
			if (err) {
				console.log(err);
				reject(err);
			} else resolve(result);
		});
	});
};

modulo.devolver = (arg) => {
	return new Promise((res, rej) => {
		res(arg)
	});
}

module.exports = modulo;