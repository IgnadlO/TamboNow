const path = require('path');
const { ipcRenderer } = require('electron')
console.log(ipcRenderer.sendSync('sinParametros', 'leerTambo'))
console.log(ipcRenderer.sendSync('conParametros', 'devolver', ['hola','como','estas?']))

function crearTambo(){
	nombre = document.getElementById('nombreTambo').value;
	// main.crearDatabase(nombre);
}

async function crearTablaTambos(){
	const tambos = await main.leerTambo();

	const contenedor = document.querySelector(".contenedorTabla");
    const fragmento = document.createDocumentFragment();
    const tabla = document.createElement('table');
    tabla.classList.add('table','table-striped','table-hover');
    tabla.innerHTML = `
    <thead>
        <tr>
          <th scope="col">Tambos</th>
        </tr>
      </thead>`;
      const tbody = document.createElement('tbody');

    for (let i = 0; i <= tambos.length - 1; i++){
      const item = document.createElement('tr');
      console.log(tambos[i].nombre);
      item.innerHTML = `<th scope="row">${tambos[i].nombre}</th>`;
      tbody.appendChild(item);
    }

    tabla.appendChild(tbody);
    fragmento.appendChild(tabla);
    contenedor.appendChild(fragmento);
}

