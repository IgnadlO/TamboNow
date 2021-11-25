const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec, datosUni } from '../../index';
import UiComun from './UiComun.js'

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

	static promedios(tamboActivo: datosTambo): [number[], number[], string[]]{
		const datosSec = ipcRenderer.sendSync("conParametros", "verControlSecundarioOrdenado", tamboActivo.id);
		const [mesesP, datosSecFechas] = Manejo.separarPorFecha(datosSec)
		const rcsTotal: number[] = [];
		const lecheTotal: number[] = [];
		const fechas: string[] = [];	
		
		console.log(datosSecFechas)
		for (let dato of datosSecFechas){
			let rcs: number = 0;
			let leche: number = 0;
			for(let i in dato){
				rcs += dato[i].rcs;
				leche += dato[i].leche;
			}
			rcsTotal.push(Math.round(rcs/dato.length));
			const promLeche: number = leche/dato.length;
			lecheTotal.push(promLeche);
			fechas.push(dato[0].fecha)
		}

		console.log(rcsTotal);
		console.log(lecheTotal);
		console.log(fechas);

		return [rcsTotal.reverse(), lecheTotal.reverse(), fechas.reverse()];
	}

	static distribucion(tamboActivo: datosTambo): [number[], string[]]{
		const datosSec = ipcRenderer.sendSync("conParametros", "verControlSecundarioOrdenado", tamboActivo.id);
		const [mesesP, datosSecFechas] = Manejo.separarPorFecha(datosSec)
		const rcsTotal: number[] = [];	
		const fechas: string[] = [];
		
		for (let dato of datosSecFechas){
			let rcs: number = 0;
			for(let i in dato){
				rcs += dato[i].rcs;
			}
			rcsTotal.push(rcs);
			fechas.push(dato[0].fecha)
		}

		console.log(rcsTotal);
		console.log(fechas);

		return [rcsTotal.reverse(), fechas.reverse()];
	}

	static datosCronicas(tamboActivo) {
		const [meses, datosUni] = Manejo.unificador(tamboActivo)
		const datosCronica = []
		datosCronica.push(["Rp", "Lactancia", "Parto", "DEL", "Tacto", "Scores", "Leche", "Tanque", "Score Actual", "ACP"])
		for(let x = 0; x < 2; x++){
			const esVaca = (x == 1)? true : false; 
			const limite = (esVaca)? 4 : 3;
			let i = -1;
			let n = 0;
			for (let vaca of datosUni){
				i++;
				const scoreActual: number | null = (vaca.score == null)? 0 : vaca.score;
				if (scoreActual == null) continue;
				if (esVaca == true && (vaca.lactancia == 1 || scoreActual < 4))
					continue;	
				else if (esVaca == false && (vaca.lactancia != 1 || scoreActual < 3))
					continue;
				n++;
				const num = num => (num == null || num == '')? '-' : num.toFixed(2);	
				const scoreT = val => (val != null && val >= limite)? 'scoreAlto': '';
				let acp = (vaca.score > limite)? 1: 0;
				let scores = '';
				let max = 0;
				for(let iF = meses.length - 2; iF >= 0; iF--){
					max++;
					if (max >= 5) break;
					const score = (vaca.scoresOld == undefined)? 0: vaca.scoresOld[iF]; 
					scores += `| ${num(score)} `;
					if(vaca.scoresOld[iF] > limite)
						acp++;
				}
				datosCronica.push([vaca.rp,vaca.lactancia,vaca.parto,vaca.del,(vaca.tacto == null)? '': vaca.tacto,scores,num(vaca.leche),num(vaca.tanque),num(vaca.score),acp])
			}
		}
		return datosCronica;
	}

	static datosAporte(tamboActivo) {
		const [meses, datosUni] = Manejo.unificador(tamboActivo)
		const cantVacas = datosUni.length;
		const vcs = Math.ceil(cantVacas * 0.10);
		const datosUnidos = UiComun.ordenamiento("tanque", datosUni);
		const datosUnificados = [];
		for(let i = 0; i < vcs; i++){
			datosUnificados.push(datosUnidos[i])
		}
		const datosAporte = []
		datosAporte.push(["Rp", "Lactancia", "Parto", "DEL", "Tacto", "Scores", "Leche", "Tanque", "Score Actual", "ACP"])
		let i = -1;
		let n = 0;

		for (let vaca of datosUnificados){
			i++;
			n++;
			const limite = (vaca.lactancia > 1)? 4 : 3;
			const tr = document.createElement('tr');
			const num = num => (num == null || num == '')? '' : num.toFixed(2);	
			const scoreT = val => (val != null && val >= limite)? 'scoreAlto': '';
			let acp = (vaca.score > limite)? 1: 0;
			let max = 0;
			let scores = '';
			for(let iF = meses.length - 2; iF >= 0; iF--){
				max++;
				if (max >= 5) break;
				scores += `| ${num(vaca.scoresOld[iF])}`;
				if(vaca.scoresOld[iF] > limite)
					acp++;
			}
			datosAporte.push([vaca.rp,vaca.lactancia,vaca.parto,vaca.del,(vaca.tacto == null)? '': vaca.tacto,scores,num(vaca.leche),num(vaca.tanque),num(vaca.score),acp])
		}
		return datosAporte;
	}
}