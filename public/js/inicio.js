const path = require("path");
const { ipcRenderer } = require("electron");

let tambos = [];
let tambosNombre = [];
const botonCrearTambo = document.getElementById("nuevoTambo");
const inputBuscador = document.getElementById("nombreTambo");

botonCrearTambo.addEventListener("click", crearNuevoTambo);
inputBuscador.addEventListener("keyup", buscador);

function recolectarTambos() {
  tambos = ipcRenderer.sendSync("sinParametros", "leerTambo");
  tambosNombre = tambos.map((value) => {
    return value.nombre;
  });
}

function crearNuevoTambo() {
  const nombre = document.getElementById("nombreTambo").value;
  if (tambosNombre.includes(nombre)) console.log("ya existe");
  else ipcRenderer.sendSync("sinParametros", "crearTambo", nombre);
}

function crearTablaTambos(lista) {
  const contenedor = document.querySelector(".contenedorTabla");
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
    item.addEventListener("click", seleccionarTambo);
    tbody.appendChild(item);
  }
  tabla.appendChild(tbody);
  fragmento.appendChild(tabla);
  contenedor.appendChild(fragmento);
}

function buscador(e) {
  const valor = e.target.value;
  const lista = tambos.filter((value) => {
    if (value.nombre.includes(valor)) return true;
  });
  crearTablaTambos(lista);
}

function seleccionarTambo(e) {
  const index = tambosNombre.indexOf(e.target.innerText);
  const info = ipcRenderer.sendSync("nuevoTamboActivo", tambos[index]);
  window.location = "../views/adminControl.html";
}

function tamboActivo() {
  console.log(ipcRenderer.sendSync("verTamboActivo"));
}

recolectarTambos();
crearTablaTambos(tambos);