const xlsx = require('xlsx');
const path = require('path');
const formFile = document.getElementById('fileExcel');

// Muestra la tabla del excel
function mostrar(e) {
  var files = e.target.files, f = files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var excel = xlsx.read(data, {type: 'array'});

    let datos = xlsx.utils.sheet_to_json(excel.Sheets['subir']);
    for (let i = 0; i <= datos.length - 1; i++){
      datos[i].Tacto = (datos[i].Tacto == undefined)? "" : datos[i].Tacto;
      datos[i].Leche = (datos[i].Leche == undefined)? "" : datos[i].Leche;
      datos[i].Rcs = (datos[i].Rcs == undefined)? "" : datos[i].Rcs;
      datos[i].Fecha = formatearFechaExcel(datos[i].Fecha);
    }
    
    const contenedor = document.querySelector(".contenedorTabla");
    const fragmento = document.createDocumentFragment();
    const tabla = document.createElement('table');
    tabla.classList.add('table','table-striped');
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
      const tbody = document.createElement('tbody');

    for (let i = 0; i <= datos.length - 1; i++){
      const item = document.createElement('tr');
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
formFile.addEventListener('change', mostrar, false);

function formatearFechaExcel(fechaExcel) {
  const diasUTC = Math.floor(fechaExcel - 25569);
  const valorUTC = diasUTC * 86400;
  const infoFecha = new Date(valorUTC * 1000);

  const diaFraccionado = fechaExcel - Math.floor(fechaExcel) + 0.0000001;
  let totalSegundosDia = Math.floor(86400 * diaFraccionado);
  const segundos = totalSegundosDia % 60;
  totalSegundosDia -= segundos;

  const horas = Math.floor(totalSegundosDia / (60 * 60));
  const minutos = Math.floor(totalSegundosDia / 60) % 60;

  // Convertidos a 2 dígitos
  infoFecha.setDate(infoFecha.getDate() + 1);
  const dia = ('0' + infoFecha.getDate()).slice(-2);
  const mes = ('0' + (infoFecha.getMonth() + 1)).slice(-2);
  const anio = infoFecha.getFullYear();

  const fecha = `${dia}/${mes}/${anio}`;

 return fecha;
}