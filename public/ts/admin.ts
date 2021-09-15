const xlsx = require("xlsx");
const path = require("path");
const { ipcRenderer } = require("electron");
import {datosPrin, datosSec, datosTambo, datosExcel} from '../../servet';

let datosTambo: datosPrin[] = [];
let datosTamboSec: datosSec[] = [];
let del: number[] = [];

class UiC {
  private static tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
  private static botonAceptar = document.getElementById("aceptar")!;
  private static botonCancelar = document.getElementById("cancelar")!;
  private static formControl = document.getElementById("formControl")! as HTMLFormElement;
  private static formFile = document.getElementById("fileExcel")!;
  private static tabla = document.getElementById("tbody")!;
  private static tablaNuevoControl = document.getElementById("tablaNuevoControl")!;

  static main() {
    UiC.botonAceptar.addEventListener("click", UiC.subirControl);
    UiC.botonCancelar.addEventListener("click", UiC.borrarTabla);
    UiC.formFile.addEventListener("change", UiC.cargarTablaExcel, false);
    UiC.bajarDatosControl();
    document.getElementById('botonNuevoControl')!
    .addEventListener('click', UiC.cambiarEstadoTablaNuevoControl)
  }

  static bajarDatosControl(){
    const datosPrin = ipcRenderer.sendSync("conParametros", "verControlPrincipal", UiC.tamboActivo.id);
    const datosSec = ipcRenderer.sendSync("conParametros", "verControlSecundario", UiC.tamboActivo.id);
    console.log(datosPrin);
    console.log(datosSec);
    UiC.crearTablaControl(datosPrin, datosSec);
  }

  static cambiarEstadoTablaNuevoControl() {
    const boton = document.getElementById('contBotonNuevoControl')!;
  
    if (UiC.tablaNuevoControl.style.display != 'none'){
      UiC.tablaNuevoControl.style.display = 'none';
      boton.style.display = 'block'; 
    }
    else {
      UiC.tablaNuevoControl.style.display = 'flex';
      boton.style.display = 'none';
    }
  }

  static borrarTabla() {
    UiC.tabla.innerHTML = '';
    for (let i in datosTambo) datosTambo.pop();
    UiC.formControl.reset();
  }

  static cargarTablaExcel(e) {
    let files = e.target.files,
      f = files[0];
    let reader = new FileReader();
    reader.onload = function (eReader) {
      const fechaControlInput = document.getElementById(
        "fechaControl"
      )! as HTMLInputElement;
      const fechaControl = fechaControlInput.value;
      if (!fechaControl) {
        UiC.borrarTabla();
        console.log("debe seleccionar la fecha");
        return 0;
      }
      if (!eReader.target) return 0;
      const readerResult = eReader.target.result as ArrayBuffer;
      const excel = xlsx.read(new Uint8Array(readerResult), { type: "array" });
      const datos: datosExcel[] = xlsx.utils.sheet_to_json(excel.Sheets["subir"]);
      const calcularDel = (fecha) =>
        Math.floor(
          (new Date(fechaControl).getTime() - new Date(fecha).getTime()) /
            (1000 * 3600 * 24)
        );
      let sumaCs = 0;
      for (let i = 0; i <= datos.length - 1; i++) {
        const fecha = UiC.formatearfechaExcel(datos[i].Fecha);
        datosTambo.push({
          rp: datos[i].Rp,
          lactancia: datos[i].Lactancia,
          parto: fecha.fechaBien,
          tacto: datos[i].Tacto == undefined ? null : datos[i].Tacto,
          del: calcularDel(fecha.fechaMal),
          tambo: UiC.tamboActivo.id,
        });
        const esNull = datos[i].Leche == undefined || datos[i].Rcs == undefined? true: false;
        datosTamboSec.push({
          leche: esNull ? null : datos[i].Leche,
          rcs: esNull ? null : datos[i].Rcs,
          totalCs: esNull ? null : datos[i].Leche * datos[i].Rcs,
          tanque: 0,
          score: esNull ? null : datos[i].Rcs / 100 / 2 + 3,
          fecha: fechaControl,
          idVaca: i,
        });
        sumaCs += esNull ? 0 : datosTamboSec[i].totalCs!;
      }
      for (let dato of datosTamboSec)
        dato.tanque = dato.totalCs == null ? 0 : (dato.totalCs / sumaCs) * 100!;
      UiC.crearTablaControl(datosTambo, datosTamboSec);
    };
    reader.readAsArrayBuffer(f);
  }

  static crearTablaControl(datos, datosSec) {
    UiC.tabla.innerHTML = '';
    const vaciarDato = (dato) => (dato == null ? "" : dato);
    for (let i = 0; i <= datos.length - 1; i++) {
      const item = document.createElement("tr");
      const crearCampo = (dato, id: number, tipo: string) => {
        const campo = document.createElement("td");
        campo.innerText = (tipo == "score" && dato != null)? dato.toFixed(2) : dato;
        campo.id = (tipo == "parto" ? "s" : "n") + "/" + id + "/" + tipo;
        campo.addEventListener("click", UiC.editarCampo);
        return campo;
      };
      item.innerHTML = `<td scope="row">${i}</td>`;
      for (let sub of ["rp", "lactancia", "parto", "del", "tacto"])
        item.appendChild(crearCampo(datos[i][sub], i, sub));
      for (let sub of ["leche", "rcs", "score"]) {
        if (datosSec[i] == undefined)
           item.appendChild(crearCampo(null, i, sub));
        else
           item.appendChild(crearCampo(datosSec[i][sub], i, sub));
      }
      UiC.tabla.appendChild(item);
    }
  }

  //(e.target.id[0] == 's')? 'text': 'number'
  static editarCampo(e) {
    const input = document.createElement("td");
    input.innerHTML = `<input type="text" id="${e.target.id}" size="10" value="${e.target.innerText}">`;
    input.addEventListener("keypress", UiC.modificarCampo);
    e.target.parentNode.replaceChild(input, e.target);
    const elemento = document.getElementById(e.target.id)!;
    elemento.focus();
    elemento.addEventListener("blur", UiC.modificarCampo);
  }

  static modificarCampo(e) {
    if ((e.key != "Enter" && e.type == "keypress") || e.type != "blur")
      return 0;
    const datosValor = e.target.id.split("/");
    datosTambo[datosValor[1]][datosValor[2]] = e.target.value;

    const campo = document.createElement("td");
    campo.innerHTML = e.target.value;
    campo.id = e.target.id;
    campo.addEventListener("click", UiC.editarCampo);
    e.target.parentNode.replaceChild(campo, e.target);
  }

  static formatearfechaExcel(fechaExcel) {
    const diasUTC = Math.floor(fechaExcel - 25569);
    const valorUTC = diasUTC * 86400;
    const infofecha = new Date(valorUTC * 1000);
    const diaFraccionado = fechaExcel - Math.floor(fechaExcel) + 0.0000001;
    let totalSegundosDia = Math.floor(86400 * diaFraccionado);
    const segundos = totalSegundosDia % 60;
    totalSegundosDia -= segundos;

    const horas = Math.floor(totalSegundosDia / (60 * 60));
    const minutos = Math.floor(totalSegundosDia / 60) % 60;

    // Convertidos a 2 dígitos
    infofecha.setDate(infofecha.getDate() + 1);
    const dia = ("0" + infofecha.getDate()).slice(-2);
    const mes = ("0" + (infofecha.getMonth() + 1)).slice(-2);
    const anio = infofecha.getFullYear();

    const fechaBien = `${dia}/${mes}/${anio}`;
    const fechaMal = `${mes}/${dia}/${anio}`;

    return { fechaBien, fechaMal };
  }

  static mostrarTamboActivo() {
    const elemento = document.getElementById("tamboActivo")!;
    elemento.innerText = UiC.tamboActivo.nombre;
  }

  static subirControl(e) {
    const elemento = document.getElementById("fechaControl")! as HTMLInputElement;
    const fechaControl = elemento.value;
    if (!fechaControl || !datosTambo || datosTambo.length == 0) {
      console.log("falta informacion");
      return 0;
    }
    console.log(datosTambo);
    console.log(datosTamboSec);
    ipcRenderer.sendSync("conParametros", "nuevoControlPrincipal", datosTambo);
    const vacas = ipcRenderer.sendSync("conParametros", "verControlPrincipal", UiC.tamboActivo.id);
    for (let i in vacas){
      datosTambo.forEach((val,index) => {
        if(val.rp == vacas[i].rp){
          datosTamboSec[index].idVaca = vacas[i].idVaca;
          return 0;
        }
      })
    }
    ipcRenderer.sendSync("conParametros", "subirControlSecundario", datosTamboSec);
  }
}

function main(){
   UiC.mostrarTamboActivo();
   UiC.main();
}

main();

export {};