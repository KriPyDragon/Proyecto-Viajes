const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const rutas = require('./Routes/Rutas');
const sessionMiddleware = require('./middleware/sessionMiddleware'); // Importa el middleware de sesión

const app = express();
const port = 3000;

// Configura el motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del middleware de sesión
app.use(
  session({
    secret: 'tu_clave_secreta', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambia a true si usas HTTPS
  })
);

// Usa el middleware de sesión
app.use(sessionMiddleware);

// Usa las rutas definidas en Routes/Rutas.js
app.use('/', rutas);

app.listen(port, () => {
  console.log(`El server está corriendo en http://localhost:${port}`);
});