const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec } from '../../servet';

let tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
let datosTambo: datosPrin[] = ipcRenderer.sendSync("conParametros", "verControlPrincipal", tamboActivo.id);
let datosTamboSec: datosSec[] = ipcRenderer.sendSync("conParametros", "verControlSecundario", tamboActivo.id);

class Ui {
	private static esVaca = false;
	private static tbody = document.getElementById('tbody')!;
	private static selectorTipo = document.getElementById('tipo')!;

	static main(){
		Ui.crearTabla()
		Ui.mostrarTamboActivo()
		Ui.selectorTipo.addEventListener('change', Ui.cambiarTipoTabla)
		console.log(datosTamboSec)
		//document.getElementById('fechaControl')!.innerText = datosTambo[0].
	}

	static cambiarTipoTabla(e){
		Ui.esVaca = (e.target.options.selectedIndex == 0)? false: true;
		Ui.crearTabla()
	}

	static crearTabla(){
		Ui.tbody.innerHTML = '';
		const limite = (Ui.esVaca)? 4 : 3;

		type tFechas = datosSec[];
		const fechas: string[] = [];
		const datosSecFechas: tFechas[] = [];

		for(let vaca of datosTamboSec){
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

        const meses = fechas.map(val => {
        	var objFecha = new Date(val);
			var mes  = objFecha.getMonth();
			var anio = objFecha.getFullYear();
			return mes + "/" + anio.toString().substring(2,4);
        })

        console.log(meses)
		console.log(fechas)
		console.log(datosSecFechas)

		let scores = '';
		for(let i = meses.length - 1; i > 0; i--){
			if (i >= 5) break;
			scores += `<th><div class="mes"><span>${meses[i]}</span><span>Score</span></div></th>`;
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
				<th id="score" ><div class="mes" id="score"><span id="score">${meses[0]}</span><span id="score">Score</span></div></th>
				<th id="acp">ACP</th>
				<th>Accionar</th>`;
		thead.id = 'thead';
		document.getElementById('tabla')!.replaceChild(thead, document.getElementById('thead')!)

		let i = -1;

		for (let vaca of datosTambo){
			i++;
			const scoreActual: number | null = (datosSecFechas[0][i].score == null)? 0 : datosSecFechas[0][i].score;
			if (scoreActual == null) continue;
			if (Ui.esVaca == true && (vaca.lactancia == 1 || scoreActual < 4))
				continue;	
			else if (Ui.esVaca == false && (vaca.lactancia != 1 || scoreActual < 3))
				continue;
			const tr = document.createElement('tr');
			const num = num => (num == null || num == '')? '' : num.toFixed(2);	
			const scoreT = val => (val != null && val >= limite)? 'scoreAlto': '';
			scores = '';
			for (let iF = fechas.length - 1; iF > 0; iF--) {
				if (iF >= 5) break;
				scores += `<td class="${scoreT(datosSecFechas[iF][i].score)}">${num(datosSecFechas[iF][i].score)}</td>`;
			}
			tr.innerHTML = `
			<td>${i}</td>
			<td class="rp">${vaca.rp}</td>
			<td>${vaca.lactancia}</td>
			<td>${vaca.parto}</td>
			<td>${vaca.del}</td>
			<td>${(vaca.tacto == null)? '': vaca.tacto}</td>
			${scores}
			<td class="leche">${num(datosSecFechas[0][i].leche)}</td>
			<td class="tanque">${num(datosSecFechas[0][i].tanque)}%</td>
			<td class="${scoreT(datosSecFechas[0][i].score)}">${num(datosSecFechas[0][i].score)}</td>
			<td>4</td>
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
		console.log(e.target.id)

	}

	static mostrarTamboActivo(){
    	const elemento = document.getElementById("tamboActivo")!;
    	elemento.innerText = tamboActivo.nombre;
  	}
}

class Manejo {

}

Ui.main();

export {};