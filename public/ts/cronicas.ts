const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec, datosUni } from '../../index';
import Manejo from './manejoTambo.js'
import UiComun from './UiComun.js'

let tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
let datosUnificados: datosUni[];
let meses: string[];

class Ui {
	private static esVaca = false;
	private static tbody = document.getElementById('tbody')!;
	private static selectorTipo = document.getElementById('tipo')!;
	private static ultimoOrd = {tipo: '', orden: true};

	static main(){
		Ui.crearEncabezadoTabla();
		Ui.crearTabla(datosUnificados)
		Ui.mostrarTamboActivo()
		Ui.selectorTipo.addEventListener('change', Ui.cambiarTipoTabla)
		document.getElementById('fechaControl')!.innerText = UiComun.nomMeses[meses[0].split('/')[0]] + ' de ' + meses[0].split('/')[1];
	}

	static cambiarTipoTabla(e){
		Ui.esVaca = (e.target.options.selectedIndex == 0)? false: true;
		Ui.crearTabla(datosUnificados);
	}

	static mostrarTamboActivo() {
    	const elemento = document.getElementById("tamboActivo")!;
    	elemento.innerText = tamboActivo.nombre;
  	}

	static crearEncabezadoTabla(){
		const limite = (Ui.esVaca)? 4 : 3;
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
				<th id="acp">ACP</th>
				<th>Accionar</th>`;
		thead.id = 'thead';
		if(document.getElementById('thead'))
			document.getElementById('tabla')!.replaceChild(thead, document.getElementById('thead')!);
		else
			document.getElementById('tabla')!.appendChild(thead);
	}

	static crearTabla(datosUni){
		Ui.tbody.innerHTML = '';
		const limite = (Ui.esVaca)? 4 : 3;
		let i = -1;
		let n = 0;

		for (let vaca of datosUni){
			i++;
			const scoreActual: number | null = (vaca.score == null)? 0 : vaca.score;
			if (scoreActual == null) continue;
			if (Ui.esVaca == true && (vaca.lactancia == 1 || scoreActual < 4))
				continue;	
			else if (Ui.esVaca == false && (vaca.lactancia != 1 || scoreActual < 3))
				continue;
			n++;
			const tr = document.createElement('tr');
			const num = num => (num == null || num == '')? '-' : num.toFixed(2);	
			const scoreT = val => (val != null && val >= limite)? 'scoreAlto': '';
			let acp = (vaca.score > limite)? 1: 0;
			let scores = '';
			let max = 0;
			for(let iF = meses.length - 2; iF >= 0; iF--){
				max++;
				if (max >= 5) break;
				const score = (vaca.scoresOld == undefined)? 0: vaca.scoresOld[iF]; 
				scores += `<td class="${scoreT(score)}">${num(score)}</td>`;
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
			<td>
				<select>
					<option>        </option>
					<option>Secar</option>
					<option>Tratar</option>
					<option>Muestrear</option>
					<option>Anular</option>
					<option>Segregar</option>
				</select>
			</td>
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

[meses, datosUnificados] = Manejo.unificador(tamboActivo);
Ui.main();


export {};