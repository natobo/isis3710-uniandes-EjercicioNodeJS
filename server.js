// Importa todos los modulos
const fs = require('fs');
const axios = require('axios');
const { config } = require('./config');
//Crea el servidor http
const server = require('http').createServer();
//Funcion que crea el markup para el proveedor y el cliente
const createMarkup = (user, type) => {
  return type === 'proveedores'
    ? `<tr>
        <th scope="row">${user.idproveedor}</th>
        <td>${user.nombrecompania}</td>
        <td>${user.nombrecontacto}</td>
    </tr>`
    : `<tr>
        <th scope="row">${user.idCliente}</th>
        <td>${user.NombreCompania}</td>
        <td>${user.NombreContacto}</td>
    </tr>`;
};
// Funcion que carga los datos del response dentro de un html
const chargeDataHtml = async (data, dirHtml, type) => {
  let joinedHtml = ``;
  // Pre carga en el joinedHTML toda la información de axios
  data.forEach((p) => (joinedHtml += createMarkup(p, type)));
  // Crea la respuesa de html
  const respHtml = `
    <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <title>${type === 'proveedores' ? `Proveedores` : `Cliente`}</title>
        </head>
        <body>
            <h1 style="text-align:center">${
              type === 'proveedores'
                ? `Listado de proveedores`
                : `Listado de clientes`
            }</h1>
            <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nombre contacto</th>
                    <th scope="col">Nombre compania</th>
                  </tr>
                </thead>
                <tbody>
                  ${joinedHtml}
                </tbody>
              </table>
        </body>
        </html>`;
  // Usamos sync ya que debe escribir todo el html antes de enviar la respuesta.
  fs.writeFileSync(dirHtml, respHtml, function (err) {
    if (err) return console.log(err);
  });
};
//Crea la configutacion del servidor de node
server.on('request', (request, response) => {
  // Obtiene el pathname entre proveedores y clientes
  const pathname = request.url.split('/')[2];
  // Si es proovedores realiza la petición en axios y mapea el resultado
  if (
    request.method === 'GET' &&
    (pathname === 'proveedores' || pathname === 'clientes')
  ) {
    // Hace la peticion en axios y procesa la respuesta
    axios
      .get(
        pathname === 'proveedores'
          ? 'https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json'
          : 'https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json'
      )
      .then((axiosResp) => {
        // Ob
        let respAxiosData = axiosResp.data;
        // Carga toda la data a
        chargeDataHtml(respAxiosData, config.dirHtml, pathname);
        // Lee el archivo index.html y lo manda como response en caso que de exista.
        fs.readFile(config.dirHtml, null, (error, data) => {
          if (error) {
            response.writeHead(404);
            response.write('File index.html not found');
            response.end();
          } else {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
          }
        });
      })
      .catch((err) => console.error(err));
  } else {
    response.writeHead(404);
    response.write(
      `Verify the api petition and try again. It should be /api/proveedores or /api/clientes`
    );
    response.end();
  }
});
// Pone a escuchar el servidor de nodejs en el puerto pasado por parámetro en el archivo config.js
server.listen(config.port);
console.log(`Listening http://localhost:${config.port}`);