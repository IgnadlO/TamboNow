const { ipcRenderer } = require("electron");
const Chart = require('chart.js');
import { datosTambo, datosPrin, datosSec, datosUni } from '../../index';
import Manejo from './manejoTambo.js';

let tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
let datosSec: datosSec[] = [];

class Peron {
	private static vcs = 0;

	static main() {
		Peron.mostrarTamboActivo();
		Peron.recojerDatos();
	}

	static mostrarTamboActivo() {
		const elemento = document.getElementById("tamboActivo")!;
		elemento.innerText = tamboActivo.nombre;
	}

	static recojerDatos() {
		let [rcs, fechas] = Manejo.distribucion(tamboActivo);
		Peron.graficarDatos(rcs, fechas);
		Peron.cargarTabla(rcs, fechas)
	}

	static graficarDatos(rcs, fechas) {
		let coso = <HTMLCanvasElement>document.getElementById("myChart")!
		let ctx = coso.getContext('2d');
		let myChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: fechas,
				datasets: [
					{
						label: "Rcs",
						data: rcs,
						backgroundColor: ["rgb(250, 029, 109)"],
						borderColor: "rgb(250, 029, 109)",
					},
				],
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: "Distribucion Mensual del Rcs",
					},
				},
				scales: {
					y: {
				        min: 0,
					},
				},
			},
		});
	}

	static cargarTabla(rcs, fechas){
		const tabla = document.getElementById('tabla')!;
		for(let i in fechas){
		const tr = document.createElement('tr');
		tr.innerHTML = `
        				<td>${fechas[i]}</td>
        				<td>${rcs[i]}ML</td>
      					`;
      	tabla.appendChild(tr);
      }
	}
}

Peron.main()