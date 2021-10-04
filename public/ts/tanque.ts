const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec, datosUni } from '../../servet';
import Manejo from './manejoTambo.js'
import UiComun from './UiComun.js'

let tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
let datosUnificados: datosUni[] = [];
let meses: string[];

class Ui {
	private static vcs = 0;
	private static tbody = document.getElementById('tbody')!;
	private static selectorTipo = document.getElementById('tipo')!;

	static main(){
		Ui.datosTanque();
		Ui.crearEncabezadoTabla();
		Ui.crearTabla(datosUnificados)
		UiComun.mostrarTamboActivo(tamboActivo)
		//document.getElementById('fechaControl')!.innerText = datosTambo[0].
	}

	static datosTanque(){
		let datosUni: datosUni[];
		[meses, datosUni] = Manejo.unificador(tamboActivo);
		const cantVacas = datosUni.length;
		Ui.vcs = Math.ceil(cantVacas * 0.10);
		datosUni = UiComun.ordenamiento("tanque", datosUni);
		let vcsAportan: number = 0;
		let rcsAportan: number = 0;
		let lecheAportan: number = 0;
		for(let i = 0; i < Ui.vcs; i++){
			datosUnificados.push(datosUni[i])
			vcsAportan += datosUni[i].tanque;
			rcsAportan += datosUni[i].rcs;
			lecheAportan += datosUni[i].leche;
		}
		let totalRcs = 0;
		for(let dato of datosUni){
			totalRcs += dato.rcs;
		}
		const promedio = Math.ceil(totalRcs / cantVacas)
		const promedioSin = Math.ceil((totalRcs - rcsAportan) / (cantVacas - Ui.vcs));

		Ui.plasmarDatosTanque(Ui.vcs, Math.ceil(vcsAportan), promedio, promedioSin, lecheAportan.toFixed(1))
	}

	static plasmarDatosTanque(cant, porcentaje, promedio, promedioSin, leche){
		document.getElementById('vcsAportan')!.innerText = cant;
		document.getElementById('vcsPorcentaje')!.innerText = porcentaje + "%";
		document.getElementById('rcsProm')!.innerText = promedio + "/ML";
		document.getElementById('rcsPromSin')!.innerText = promedioSin + "/ML";
		document.getElementById('vcsAportanD')!.innerText = cant;
		document.getElementById('lecheAportan')!.innerText = leche;
	}

	static crearEncabezadoTabla(){
		let scores = '';
		let max = 0;
		for(let i = meses.length - 1; i > 0; i--){
			max++;
			if (max >= 5) break;
			const fecha = meses[i].split('/');
			scores += `<th id="scoresOld-${i - 1}"><div class="mes" id="scoresOld-${i - 1}"><span id="scoresOld-${i - 1}">${UiComun.nomMeses[fecha[0]] + '-' + fecha[1]}</span><span id="scoresOld-${i - 1}">Score</span></div></th>`;
		}

		const thead = document.createElement('thead');
		thead.innerHTML = `
				<th>N°</th>
				<th id="rp" >RP</th>
				<th id="lactancia">Lact.</th>
				<th id="parto">Inicio Lact.</th>
				<th id="del">DEL</th>
				<th id="tacto">Tacto</th>
				${scores}
				<th id="leche">Leche</th>
				<th id="tanque">%Tan.</th>
				<th id="score" ><div class="mes" id="score"><span id="score">${UiComun.nomMeses[meses[0].split('/')[0]] + '-' + meses[0].split('/')[1]}</span><span id="score">Score</span></div></th>
				<th id="acp">ACP</th>`;
		thead.id = 'thead';
		if(document.getElementById('thead'))
			document.getElementById('tabla')!.replaceChild(thead, document.getElementById('thead')!);
		else
			document.getElementById('tabla')!.appendChild(thead);
	}

	static crearTabla(datosUni){
		Ui.tbody.innerHTML = '';
		let i = -1;
		let n = 0;

		for (let vaca of datosUni){
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
				scores += `<td class="${scoreT(vaca.scoresOld[iF])}">${num(vaca.scoresOld[iF])}</td>`;
				if(vaca.scoresOld[iF] > limite)
					acp++;
			}
			tr.innerHTML = `
			<td>${n}</td>
			<td class="rp">${vaca.rp}</td>
			<td>${vaca.lactancia}</td>
			<td>${vaca.parto}</td>
			<td>${vaca.del}</td>
			<td>${(vaca.tacto == null)? '': vaca.tacto}</td>
			${scores}
			<td class="leche">${num(vaca.leche)}</td>
			<td class="tanque">${num(vaca.tanque)}%</td>
			<td class="${scoreT(vaca.score)}">${num(vaca.score)}</td>
			<td class="acp${acp}">${acp}</td>
			`;
			Ui.tbody.appendChild(tr)
		}
		Ui.crearBotonesTabla();
	}

	static crearBotonesTabla(){
		const ths = document.getElementsByTagName('th');
		for(let th of ths){
			th.addEventListener('click', Ui.ordenamientoTabla)
		}
	}

	static ordenamientoTabla(e){
        Ui.crearTabla(UiComun.ordenamiento(e.target.id, datosUnificados));
	}
}

Ui.main();


export {};