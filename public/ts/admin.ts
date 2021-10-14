const xlsx = require("xlsx");
const path = require("path");
const { ipcRenderer } = require("electron");
import {datosPrin, datosSec, datosTambo, datosExcel, datosIndex} from '../../servet';

let datosTambo: datosPrin[] = [];
let datosTamboSec: datosSec[] = [];
const datoIndex: datosIndex[] = [];
let del: number[] = [];

class UiC {
  private static tamboActivo: datosTambo = ipcRenderer.sendSync("verTamboActivo");
  private static botonAceptar = document.getElementById("aceptar")!;
  private static botonCancelar = document.getElementById("cancelar")!;
  private static formControl = document.getElementById("formControl")! as HTMLFormElement;
  private static formFile = document.getElementById("fileExcel")!;
  private static tabla = document.getElementById("tbody")!;
  private static tablaNuevoControl = document.getElementById("tablaNuevoControl")!;
  private static modifiTabla = false;

  static main() {
    UiC.botonAceptar.addEventListener("click", UiC.subirControl);
    UiC.botonCancelar.addEventListener("click", UiC.borrarTabla);
    UiC.formFile.addEventListener("change", UiC.cargarTablaExcel, false);
    UiC.bajarDatosControl();
    document.getElementById('botonNuevoControl')!
    .addEventListener('click', UiC.cambiarEstadoTablaNuevoControl)
    document.getElementById('cancelar')!
    .addEventListener('click', UiC.cambiarEstadoTablaNuevoControl)
    document.getElementById('buscador')!
    .addEventListener('keyup', UiC.buscador)
  }

  static buscador(e){
    const valor = e.target.value;
    const datosBuscados: datosPrin[] = [];
    const datosSecBuscados: datosSec[] = [];

    const buscar = (dT, dS) => {
      dT.forEach((val, i) => {
        if (val.rp.toString().includes(valor)) {
          datosBuscados.push(val);
          for (let vaca of dS) {
            if (vaca.idVaca == val.idVaca) {
              datosSecBuscados.push(vaca);
              break;
            }
          }
        }
      });
      UiC.crearTablaControl(datosBuscados, datosSecBuscados);
    };

    if (datosTambo.length == 0) {
      const datosPrin = ipcRenderer.sendSync("conParametros","verControlPrincipal",UiC.tamboActivo.id);
      const datosSec = ipcRenderer.sendSync("conParametros","verControlSecundario",UiC.tamboActivo.id);
      buscar(datosPrin, datosSec);
    } else buscar(datosTambo, datosTamboSec);

    //datosBuscados.push()
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
      UiC.borrarTabla();
      UiC.bajarDatosControl();
      UiC.modifiTabla = false;
    }
    else {
      UiC.tablaNuevoControl.style.display = 'flex';
      boton.style.display = 'none';
      UiC.borrarTabla();
      UiC.modifiTabla = true;
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
          idVaca: i,
          rp: datos[i].Rp,
          lactancia: datos[i].Lactancia,
          parto: fecha.fechaBien,
          tacto: datos[i].Tacto == undefined ? null : datos[i].Tacto,
          del: calcularDel(fecha.fechaMal),
          tambo: UiC.tamboActivo.id,
        });
        const esNull = datos[i].Leche == undefined || datos[i].Rcs == undefined? true: false;
        datoIndex.push({
          rp: datos[i].Rp,
          id: i,
        });
        datosTamboSec.push({
          leche: esNull ? 0 : datos[i].Leche,
          rcs: esNull ? 0 : datos[i].Rcs,
          totalCs: esNull ? null : datos[i].Leche * datos[i].Rcs,
          tanque: 0,
          score: esNull ? null : Math.log((datos[i].Rcs / 100)) / Math.log(2) + 3,
          fecha: fechaControl,
          idVaca: i,
        });
        sumaCs += esNull ? 0 : datosTamboSec[i].totalCs!;
      }
      for (let dato of datosTamboSec)
        dato.tanque = dato.totalCs == null ? 0 : (dato.totalCs / sumaCs) * 100!;
      UiC.mostrarDatosControl(datosTambo)
      UiC.crearTablaControl(datosTambo, datosTamboSec);
    };
    reader.readAsArrayBuffer(f);
  }

  static mostrarDatosControl(datos) {
    const comparacion = UiC.compararControlPrin(datos);
    const total = comparacion[0] + comparacion[1];
    document.getElementById('vacasNuevas')!.innerText = comparacion[0].toString();
    document.getElementById('vacasActualizadas')!.innerText = comparacion[1].toString();
    document.getElementById('vacasEliminadas')!.innerText = comparacion[2].toString();
    document.getElementById('vacasTotal')!.innerText = total.toString();
  }

  static crearTablaControl(datos, datosSec) {
    console.log(datosTambo)
    UiC.tabla.innerHTML = '';
    const vaciarDato = (dato) => (dato == null ? "" : dato);
    for (let i = 0; i <= datos.length - 1; i++) {
      const item = document.createElement("tr");
      const crearCampo = (dato, id: number, tipo: string) => {
        const campo = document.createElement("td");
        campo.innerText = (tipo == "score" && dato != null)? dato.toFixed(2) : dato;
        campo.id = (tipo == "parto" ? "s" : "n") + "/" + id + "/" + tipo;
        if(UiC.modifiTabla)
          campo.addEventListener("click", UiC.editarCampo);
        else
          campo.style.cursor = 'auto'
        return campo;
      };
      item.innerHTML = `<td scope="row">${i + 1}</td>`;
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
    if(e.target.id.includes('parto'))
      input.innerHTML = `<input type="text" id="${e.target.id}" class="input__largo" size="10" value="${e.target.innerText}">`;
    else
      input.innerHTML = `<input type="text" id="${e.target.id}" class="input__corto" size="10" value="${e.target.innerText}">`;
    input.addEventListener("keypress", UiC.modificarCampo);
    input.classList.add('modifi');
    e.target.parentNode.replaceChild(input, e.target);
    const elemento = document.getElementById(e.target.id)!;
    elemento.focus();
    elemento.addEventListener("blur", UiC.modificarCampo);
  }

  static modificarCampo(e) {
    if (e.key != "Enter" && e.type == "keypress")
      return 0;
    e.target.removeEventListener("blur", UiC.modificarCampo)
    const datosValor = e.target.id.split("/");
    datosTambo[datosValor[1]][datosValor[2]] = e.target.value;
    const padre = e.target.parentNode
    padre.innerHTML = e.target.value;
    padre.id = e.target.id;
    padre.classList.remove('modifi');
    padre.addEventListener("click", UiC.editarCampo);
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

  static compararControlPrin(datosNuevos: datosPrin[]){
    const datosActuales = ipcRenderer.sendSync("conParametros", "verControlPrincipal", UiC.tamboActivo.id);
    let eliminadas = 0, nuevas = 0, actualizadas = 0;
    datosActuales.forEach(val => {
      let existe = false;
      for (let vaca of datosNuevos){
        if(vaca.rp == val.rp)
         existe = true;
      }
      if(!existe) eliminadas++;
    });
    datosNuevos.forEach(val => {
      let existe = false;
      for (let vaca of datosActuales){
        if(vaca.rp == val.rp){
          existe = true;
          actualizadas++;
        }
      }
      if(!existe){
        nuevas++;
      }
    });
    return [nuevas, actualizadas, eliminadas];
  }

  static subirControl(e) {
    const elemento = document.getElementById("fechaControl")! as HTMLInputElement;
    const fechaControl = elemento.value;
    if (!fechaControl || !datosTambo || datosTambo.length == 0) {
      console.log("falta informacion");
      return 0;
    }
    let datosActuales = ipcRenderer.sendSync("conParametros", "verControlPrincipal", UiC.tamboActivo.id);
    const vacasNuevas: datosPrin[] = [], vacasActualizar: datosPrin[] = [], vacasEliminadas: number[] = [];
    console.log(datosActuales)

    datosActuales.forEach(val => {
      let existe = false;
      for (let vaca of datosTambo)
        if(vaca.rp == val.rp) existe = true;  
      if(!existe) vacasEliminadas.push(val.idVaca);
    });

    datosTambo.forEach(val => {
      let existe = false;
      for (let vaca of datosActuales){
        if(vaca.rp == val.rp){
          existe = true;
          vacasActualizar.push(val);
        }
      }
      if(!existe) vacasNuevas.push(val);
    });

    console.log('datos nuevos');
    const subir = {
      nv: vacasNuevas, 
      ac: vacasActualizar, 
      br: vacasEliminadas, 
      tambo: UiC.tamboActivo.id
    };
    console.log(subir)
    ipcRenderer.sendSync("conParametros", "subirControlPrincipal", subir);

    datosActuales = ipcRenderer.sendSync("conParametros", "verControlPrincipal", UiC.tamboActivo.id);
    console.log(datoIndex);
    datoIndex.forEach(val => {
      for (let vaca of datosActuales){
        if(val.rp == vaca.rp)
          datosTamboSec[val.id].idVaca = vaca.idVaca;
      }
    })

    console.log('datosTamboSec')
    ipcRenderer.sendSync("conParametros", "subirControlSecundario", datosTamboSec);

    UiC.cambiarEstadoTablaNuevoControl();
  }
}

function main(){
   UiC.mostrarTamboActivo();
   UiC.main();
}

main();

export {};