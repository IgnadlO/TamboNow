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
		let [leche, fechas] = Manejo.produccion(tamboActivo);
		Peron.graficarDatos(leche, fechas);
		Peron.cargarTabla(leche, fechas)
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
						label: "Leche/Lts",
						data: rcs,
						backgroundColor: ["rgb(250, 131, 44)"],
						borderColor: "rgb(250, 131, 44)",
					},
				],
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: "Produccion Mensual",
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

	static cargarTabla(leche, fechas){
		const tabla = document.getElementById('tabla')!;
		for(let i in fechas){
		const tr = document.createElement('tr');
		tr.innerHTML = `
        				<td>${fechas[i]}</td>
        				<td>${leche[i]}lts.</td>
      					`;
      	tabla.appendChild(tr);
      }
	}
}

Peron.main()