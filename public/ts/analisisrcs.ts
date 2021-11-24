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
		let [rcsProm, lecheProm, fechas] = Manejo.promedios(tamboActivo);
		Peron.graficarDatos(rcsProm, lecheProm, fechas);
	}

	static graficarDatos(rcsProm, lecheProm, fechas) {
		let coso = <HTMLCanvasElement>document.getElementById("myChart")!
		let ctx = coso.getContext('2d');
		let myChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: fechas,
				datasets: [
					{
						label: "Lts/Vo",
						data: lecheProm,
						backgroundColor: ["rgb(2, 119, 189, 0.5)"],
						stack: "combined",
						type: "bar",
					},
					{
						label: "Rcs",
						data: rcsProm,
						backgroundColor: ["rgb(250, 029, 109)"],
						borderColor: "rgb(250, 029, 109)",
						stack: "combined",
						yAxisID: 'y2',
					},
				],
			},
			options: {
				plugins: {
					title: {
						display: true,
						text: "Cuadro Comparativo",
					},
				},
				scales: {
					y: {
						type: 'linear',
				        position: 'left',
				        stack: 'demo',
				        stackWeight: 1,
				        min: 12,
				        max: 21.5
					},
					y2: {
						type: 'linear',
				        position: 'rigth',
				        stack: 'demo',
				        stackWeight: 1,
						stacked: true,
						min: 0,
					},
					x: {
						color: 'red'
					}
				},
			},
		});
	}
}

Peron.main()
