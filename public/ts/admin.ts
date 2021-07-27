const xlsx = require("xlsx");
const path = require("path");
const { ipcRenderer } = require("electron");

type datosPrincipal = {
  Rp: number;
  Lactancia: number;
  Parto: string;
  Fecha: number;
  Tacto: string | null;
  Leche: number | string;
  Rcs: number | string;
};

type datosDb = {
  rp: number;
  lactancia: number;
  parto: string;
  tacto: string | null;
  leche: number | string;
  rcs: number | string;
  tambo: number;
};

type datosTambos = {
  id: number;
  nombre: string;
};

let datos: datosPrincipal[];

class UiC {
  private static tamboActivo: datosTambos =
    ipcRenderer.sendSync("verTamboActivo");
  private static botonAceptar = document.getElementById("aceptar")!;
  private static botonCancelar = document.getElementById("cancelar")!;
  private static formControl = document.getElementById(
    "formControl"
  )! as HTMLFormElement;
  private static formFile = document.getElementById("fileExcel")!;

  static main() {
    UiC.botonAceptar.addEventListener("click", UiC.subirControl);
    UiC.botonCancelar.addEventListener("click", UiC.borrarTabla);
    UiC.formFile.addEventListener("change", UiC.mostrar, false);
  }

  static borrarTabla() {
    document.querySelector(".contenedorTabla")!.innerHTML = "";
    for (let i = datos.length; i > 0; i--) {
      datos.pop();
    }
    UiC.formControl.reset();
  }

  // Muestra la tabla del excel
  static mostrar(e) {
    let files = e.target.files,
      f = files[0];
    let reader = new FileReader();
    reader.onload = function (eReader) {
      if (eReader.target) {
        const readerResult = eReader.target.result as ArrayBuffer;
        let data = new Uint8Array(readerResult);
        let excel = xlsx.read(data, { type: "array" });
        datos = xlsx.utils.sheet_to_json(excel.Sheets["subir"]);
      }
      for (let i = 0; i <= datos.length - 1; i++) {
        datos[i].Lactancia = datos[i].Lactancia;
        datos[i].Parto = UiC.formatearfechaExcel(datos[i].Fecha);
        datos[i].Tacto = datos[i].Tacto == undefined ? "" : datos[i].Tacto;
        datos[i].Leche = datos[i].Leche == undefined ? "" : datos[i].Leche;
        datos[i].Rcs = datos[i].Rcs == undefined ? "" : datos[i].Rcs;
      }
      const contenedor = document.querySelector(".contenedorTabla")!;
      const fragmento = document.createDocumentFragment();
      const tabla = document.createElement("table");
      tabla.classList.add("table", "table-striped");
      tabla.innerHTML = `
    <thead>
        <tr>
          <th scope="col">N°</th>
          <th scope="col">RP</th>
          <th scope="col">Lactancia</th>
          <th scope="col">Fecha</th>
          <th scope="col">Tacto</th>
          <th scope="col">Leche</th>
          <th scope="col">Rcs</th>
        </tr>
      </thead>`;
      const tbody = document.createElement("tbody");

      for (let i = 0; i <= datos.length - 1; i++) {
        const item = document.createElement("tr");
        item.innerHTML = `
          <th scope="row">${i}</th>
          <td>${datos[i].Rp}</td>
          <td>${datos[i].Lactancia}</td>
          <td>${datos[i].Fecha}</td>
          <td>${datos[i].Tacto}</td>
          <td>${datos[i].Leche}</td>
          <td>${datos[i].Rcs}</td>`;
        tbody.appendChild(item);
      }
      tabla.appendChild(tbody);
      fragmento.appendChild(tabla);
      contenedor.appendChild(fragmento);
    };
    reader.readAsArrayBuffer(f);
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

    const fecha = `${dia}/${mes}/${anio}`;

    return fecha;
  }

  static MostrarTamboActivo() {
    const elemento = document.getElementById("tamboActivo")!;
    elemento.innerText = UiC.tamboActivo.nombre;
  }

  static subirControl(e) {
    //ipcRenderer.sendSync('conParametros', 'nuevoControlPrincipal', datos);
    const elemento = document.getElementById(
      "fechaControl"
    )! as HTMLInputElement;
    const fechaControl = elemento.value;
    if (!fechaControl || !datos || datos.length == 0) {
      console.log("falta informacion");
      return 0;
    }
    const datosTambo: datosDb[] = datos.map((dato) => {
      return {
        rp: dato.Rp,
        lactancia: dato.Lactancia,
        parto: dato.Parto,
        tacto: dato.Tacto,
        leche: dato.Leche,
        rcs: dato.Rcs,
        tambo: UiC.tamboActivo.id,
      };
    });
    console.log(datosTambo);
  }
}

UiC.MostrarTamboActivo();
UiC.main();

export{}