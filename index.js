const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config');
const path = require('path');
const authController = require('./Controllers/authController');

const app = express();
const port = 3000;

// Configura el motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Define la ruta para la página de inicio
app.get('/', (req, res) => {
  res.render('main');
});

// Define la ruta para la página de login
app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);

app.listen(port, () => {
  console.log(`El server está corriendo en http://localhost:${port}`);
});