const path = require("path");
const { ipcRenderer } = require("electron");
import {datosTambo} from '../../servet';

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
    else if (nombre == '') console.log('esta vacio');
    else if (nombre == 'limpiarDB') {
      ipcRenderer.sendSync("sinParametros", "limpiarDB");
      console.log('se limpio la base de datos');
      elemento.value = '';
    }
    else {
      const send = ipcRenderer.sendSync("conParametros", "crearTambo", nombre);
      ipcRenderer.sendSync("nuevoTamboActivo", send[0]);
      Ui.cambiarPestañaControl();
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
  private static listaTambos = document.querySelector(".menu__contenido")!;
  private static tamboSeleccionado: datosTambo;
  private static cuadroValidacion: HTMLElement;

  static eventos() {
    if (!Ui.botonCrearTambo || !Ui.inputBuscador)
      console.log("no se encuenta el elemento");
    else {
      Ui.botonCrearTambo.addEventListener("click", manejoTambos.crearNuevoTambo);
      Ui.inputBuscador.addEventListener("keyup", Ui.buscador);
    }
  }

  static borrarTamboValidar(e) {
    const id = (e.target.id == '')? e.target.parentNode.id: e.target.id;
    if (JSON.parse(id).nombre == 'cacho'){
    console.log(id)
    Ui.tamboSeleccionado = JSON.parse(id);
    Ui.cuadroValidacion = document.createElement("div");
    Ui.cuadroValidacion.id = "validacion";
    Ui.cuadroValidacion.innerHTML = `
    <h3>AVISO</h3>
    <label>Hola te cuento que ${Ui.tamboSeleccionado.nombre} no se puede borrar asi que volve por donde entraste</label>
    <br>
    `;
    const elementoChild = document.createElement("div");
    elementoChild.appendChild(Ui.crearBotones("cancelar"));
    Ui.cuadroValidacion.appendChild(elementoChild);
    const contenedor = document.getElementById("contenedor__alerta")!;
    contenedor.innerHTML = '';
    contenedor.appendChild(Ui.cuadroValidacion);
    return 0;
    }
    console.log(id)
    Ui.tamboSeleccionado = JSON.parse(id);
    Ui.cuadroValidacion = document.createElement("div");
    Ui.cuadroValidacion.id = "validacion";
    Ui.cuadroValidacion.innerHTML = `
    <h3>Confirmacion</h3>
    <label>Esta seguro de que quiere eliminar el tambo ${Ui.tamboSeleccionado.nombre}?</label>
    <br>
    `;
    const elementoChild = document.createElement("div");
    elementoChild.appendChild(Ui.crearBotones("aceptar"));
    elementoChild.appendChild(Ui.crearBotones("cancelar"));
    Ui.cuadroValidacion.appendChild(elementoChild);
    const contenedor = document.getElementById("contenedor__alerta")!;
    contenedor.innerHTML = '';
    contenedor.appendChild(Ui.cuadroValidacion);
  }

  static crearBotones(texto: string) {
    const boton = document.createElement("button");
    boton.innerHTML = texto;
    const tipo = (texto == 'cancelar')? 'rojo' : 'Holanda';
    boton.classList.add(texto,'boton',tipo);
    boton.addEventListener("click", Ui.borrarTamboBotones);
    return boton;
  }

  static borrarTamboBotones(e) {
    if (e.target.innerHTML == "aceptar") {
      const confirmacion = ipcRenderer.sendSync('conParametros', 'borrarTambo', Ui.tamboSeleccionado)
      if(confirmacion) console.log("se borro el tambo " + Ui.tamboSeleccionado.nombre);
      const tambos = manejoTambos.recolectarTambos;
      Ui.crearTablaTambos(tambos);
      Ui.crearListaTambos(tambos);
    }
    document.getElementById("contenedor__alerta")!.removeChild(Ui.cuadroValidacion);
  }

  static crearTablaTambos(lista) {
    const tabla = document.querySelector(".table")!;
    if (tabla.firstElementChild)
      tabla.removeChild(tabla.firstElementChild)
    const tbody = document.createElement("tbody");
    const crearTd = (inner, evento, registro, id?) => {
        const item = document.createElement('td');
        item.innerHTML = inner;
        item.id = (id)? id: '';
        item.addEventListener('click', Ui[evento]);
        registro.appendChild(item);
      }
    for (let i = 0; i <= lista.length - 1; i++) {
      const registro = document.createElement("tr");
      crearTd(lista[i].nombre, 'presionoUnTambo', registro, lista[i].nombre);
      crearTd(`<img src="../img/timescircle.png" width="40px" height="40px" class="borrar" >`, 'borrarTamboValidar', registro, JSON.stringify(lista[i]) )
      tbody.appendChild(registro);
    }
    tabla.appendChild(tbody);
  }

  static crearListaTambos(lista) {
    Ui.listaTambos.innerHTML = '';
    for (let dato of lista) {
      Ui.listaTambos.insertAdjacentHTML("beforeend",`
          <div class="menu__opcion" id="${dato.nombre}">
            <label class="texto menu__link" id="${dato.nombre}">${dato.nombre}</label>
          </div>
          `);
      Ui.listaTambos.lastElementChild!.addEventListener('click', Ui.presionoUnTambo);
    }
  }

  static presionoUnTambo(e) {
    manejoTambos.seleccionarTambo(e.target.id);
  }

  static buscador(e) {
    const valor = e.target.value;
    const lista = manejoTambos.tambos.filter((value) => {
      if (value.nombre.includes(valor)) return true;
    });
    Ui.crearTablaTambos(lista);
    console.log(lista)
  }

  static cambiarPestañaControl() {
    window.location.href = "../views/adminControl.html";
  }
}

function main() {
  Ui.eventos();
  const tambos = manejoTambos.recolectarTambos
  Ui.crearTablaTambos(tambos);
  Ui.crearListaTambos(tambos);
}

main();

export{}