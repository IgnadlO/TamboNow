const { ipcRenderer } = require("electron");
import { datosTambo, datosPrin, datosSec, datosUni } from '../../index';

export default class UiComun {
	private static ultimoOrd = {tipo: '', orden: true};
	static nomMeses = ["nashe","Ene",'Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

	static mostrarTamboActivo(tamboActivo: datosTambo) {
    	const elemento = document.getElementById("tamboActivo")!;
    	elemento.innerText = tamboActivo.nombre;
  	}

	static ordenamiento(valor: string, datosUnificados: datosUni[]): datosUni[]{
		if(UiComun.ultimoOrd.tipo == valor) UiComun.ultimoOrd.orden = !UiComun.ultimoOrd.orden;
		else {
			UiComun.ultimoOrd.tipo = valor;
			UiComun.ultimoOrd.orden = true;
		}
		const ord = datosUnificados.slice();
		if(!valor.includes("scoresOld")){
			ord.sort(function(a, b){
	        if (UiComun.ultimoOrd.orden && a[valor] > b[valor])
	         return -1;
	        else if (!UiComun.ultimoOrd.orden && a[valor] < b[valor])
	        	return -1;
	     	return 1
	        });
		}
		else {
			const separado = valor.split("-");
			const n = separado[1];
			const tipo = separado[0];
			ord.sort(function(a, b){
	        if (UiComun.ultimoOrd.orden && a[tipo][n] > b[tipo][n])
	         return -1;
	        else if (!UiComun.ultimoOrd.orden && a[tipo][n] < b[tipo][n])
	        	return -1;
	     	return 1
	        });
		}
        return ord;
	}
}