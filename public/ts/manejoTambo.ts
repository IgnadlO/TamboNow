const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec, datosUni } from '../../servet';

export default class Manejo {
	static separarPorFecha(datosSec: datosSec[]): [string[], datosSec[][]]{
		const fechas: string[] = [];
		const datosSecFechas: datosSec[][] = [];

		for(let vaca of datosSec){
			if (!fechas.includes(vaca.fecha)){
				fechas.push(vaca.fecha);
				datosSecFechas.push(new Array());	
			}
			datosSecFechas[fechas.indexOf(vaca.fecha)].push(vaca);
		}

		fechas.sort(function(a, b) {
        if (a > b)
         return -1;
     	return 1
        });

        datosSecFechas.sort(function(a, b){
        if (a[0].fecha > b[0].fecha)
         return -1;
     	return 1
        });

        const mesesP = fechas.map(val => {
        	var objFecha = new Date(val);
			var mes  = objFecha.getMonth() + 1;
			var anio = objFecha.getFullYear();
			return mes + "/" + anio.toString().substring(2,4);
        })

		return [mesesP, datosSecFechas]
	}

	static unificador(tamboActivo: datosTambo): [string[], datosUni[]]{
		const datosTambo: datosPrin[] = ipcRenderer.sendSync("conParametros", "verControlPrincipal", tamboActivo.id);
		const datosSec = ipcRenderer.sendSync("conParametros", "verControlSecundarioOrdenado", tamboActivo.id);
		const [mesesP, datosSecFechas] = Manejo.separarPorFecha(datosSec)
		const nuevoArray: datosUni[] = [];
		const scoresP: number[] = [];
		const scoresA: number[][] = [];
		const largo = mesesP.length;
		const primeraLinea = datosSecFechas.splice(0, 1)[0]		
		
		for(let array of datosSecFechas){
			for(let vaca of array){
				if (!scoresP.includes(vaca.idVaca)){
					scoresP.push(vaca.idVaca);
					scoresA.push(new Array());	
				}
				const score = (vaca.score == null)? 0: vaca.score
				scoresA[scoresP.indexOf(vaca.idVaca)].push(score);
			}
		}
		for(let vaca of primeraLinea){
				if (!scoresP.includes(vaca.idVaca)){
					scoresP.push(vaca.idVaca);
					scoresA.push(new Array());
					scoresA[scoresP.indexOf(vaca.idVaca)].push(0);	
				}
				else {
					if (scoresA[scoresP.indexOf(vaca.idVaca)].length < (largo - 1))
						scoresA[scoresP.indexOf(vaca.idVaca)].push(0)
				}
		}
		const nashe = () => {return new Array(largo - 1)}
		datosTambo.forEach(val => {
			for (let i = 0; i < primeraLinea.length; i++){
				if(val.idVaca == primeraLinea[i].idVaca){
					const score = scoresA[scoresP.indexOf(val.idVaca)]
					nuevoArray.push({
						idVaca: val.idVaca,
  						rp: val.rp,
  						lactancia: val.lactancia,
  						parto: val.parto,
  						del: val.del,
  						tacto: val.tacto,
  						scoresOld: (score == undefined)? nashe() : score,
  						leche: primeraLinea[i].leche,
  						rcs: (primeraLinea[i].rcs == null)? 0: primeraLinea[i].rcs,
  						tanque: primeraLinea[i].tanque,
  						score: primeraLinea[i].score,
					});
				}
			}
		})
		console.log('length de array es ' + nuevoArray.length)	
		console.log(nuevoArray)

		return [mesesP, nuevoArray];
	}
}