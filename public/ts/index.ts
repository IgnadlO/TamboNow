const path = require("path");
const { ipcRenderer } = require("electron");

type datosTambo = {
  id: number;
  nombre: string;
};

class manejoTambos {
  static tambos: datosTambo[];
  static tambosNombre: string[];

  static get recolectarTambos() {
    manejoTambos.tambos = ipcRenderer.sendSync("sinParametros", "leerTambo");
    manejoTambos.tambosNombre = manejoTambos.tambos.map((value) => {
      return value.nombre;
    });
    return manejoTambos.tambos;
  }

  static crearNuevoTambo() {
    const elemento = document.getElementById("nombreTambo") as HTMLInputElement;
    const nombre = elemento.value;
    if (manejoTambos.tambosNombre.includes(nombre)) console.log("ya existe");
    else {
      const send = ipcRenderer.sendSync("conParametros", "crearTambo", nombre);
      console.log(send);
    }
  }

  static seleccionarTambo(tambo) {
    const index = manejoTambos.tambosNombre.indexOf(tambo);
    const info = ipcRenderer.sendSync(
      "nuevoTamboActivo",
      manejoTambos.tambos[index]
    );
    Ui.cambiarPestañaControl();
  }

  static get tamboActivo() {
    return ipcRenderer.sendSync("verTamboActivo");
  }
}

class Ui {
  private static botonCrearTambo = document.getElementById("nuevoTambo");
  private static inputBuscador = document.getElementById("nombreTambo");
  private static tamboSeleccionado: datosTambo;
  private static cuadroValidacion: HTMLElement;

  static eventos() {
    if (!Ui.botonCrearTambo || !Ui.inputBuscador)
      console.log("no se encuenta el elemento");
    else {
      Ui.botonCrearTambo.addEventListener(
        "click",
        manejoTambos.crearNuevoTambo
      );
      Ui.inputBuscador.addEventListener("keyup", Ui.buscador);
    }
  }

  static borrarTamboValidar(tambo) {
    Ui.tamboSeleccionado = tambo;
    Ui.cuadroValidacion = document.createElement("div");
    Ui.cuadroValidacion.id = "validacion";
    Ui.cuadroValidacion.innerHTML = `
    <h3>Confirmacion</h3>
    <label>Esta seguro de que quiere eliminar el tambo ${Ui.tamboSeleccionado.nombre}?</label>
    `;
    const elementoChild = document.createElement("div");
    elementoChild.appendChild(Ui.crearBotones("aceptar"));
    elementoChild.appendChild(Ui.crearBotones("cancelar"));
    Ui.cuadroValidacion.appendChild(elementoChild);
    const contenedor = document.getElementById("contenedor")!;
    contenedor.appendChild(Ui.cuadroValidacion);
  }

  static crearBotones(texto: string) {
    const boton = document.createElement("button");
    boton.innerHTML = texto;
    boton.classList.add(texto);
    boton.addEventListener("click", Ui.borrarTamboBotones);
    return boton;
  }

  static borrarTamboBotones(e) {
    if (e.target.value == "aceptar") {
      console.log("se borro el tambo " + Ui.tamboSeleccionado.nombre);
      Ui.crearTablaTambos(manejoTambos.recolectarTambos);
    }
    document.getElementById("contenedor")!.removeChild(Ui.cuadroValidacion);
  }

  static crearTablaTambos(lista) {
    const contenedor = document.querySelector(".contenedorTabla")!;
    contenedor.innerHTML = "";
    const fragmento = document.createDocumentFragment();
    const tabla = document.createElement("table");
    tabla.classList.add("table", "table-striped", "table-hover");
    tabla.innerHTML = `
    <thead>
        <tr>
          <th scope="col">Tambos</th>
        </tr>
      </thead>`;
    const tbody = document.createElement("tbody");
    for (let i = 0; i <= lista.length - 1; i++) {
      const item = document.createElement("tr");
      item.innerHTML = `<th scope="row">${lista[i].nombre}</th>`;
      item.addEventListener("click", Ui.presionoUnTambo);
      tbody.appendChild(item);
    }
    tabla.appendChild(tbody);
    fragmento.appendChild(tabla);
    contenedor.appendChild(fragmento);
  }

  static presionoUnTambo(e) {
    manejoTambos.seleccionarTambo(e.target.innerText);
  }

  static buscador(e) {
    const valor = e.target.value;
    const lista = manejoTambos.tambos.filter((value) => {
      if (value.nombre.includes(valor)) return true;
    });
    Ui.crearTablaTambos(lista);
  }

  static cambiarPestañaControl() {
    window.location.href = "../views/adminControl.html";
  }
}

function main() {
  Ui.eventos();
  Ui.crearTablaTambos(manejoTambos.recolectarTambos);
}

main();

export{}