const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config');
const rutas = require('./Routes/Rutas');

const app = express();
const port = 3000;

// Configura el motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usa las rutas definidas en Routes/Rutas.js
app.use('/', rutas);

app.listen(port, () => {
  console.log(`El server está corriendo en http://localhost:${port}`);
});