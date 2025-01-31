const express = require('express');
const router = express.Router();
const db = require('../config');
const authController = require('../Controllers/authController');
const mainController = require('../Controllers/mainController');
const registerController = require('../Controllers/registerController');
const { body, validationResult } = require('express-validator');

// Ruta para la página de inicio (protegida)
router.get('/', mainController.getHome);

// Ruta para la página de login
router.get('/login', authController.getLogin);

// Ruta para procesar el login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  authController.postLogin
);

// Ruta para la página de registro
router.get('/registro', registerController.getRegister);

// Ruta para procesar el registro
router.post(
  '/registro',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('confirmPassword').notEmpty().withMessage('La confirmación de la contraseña es requerida'),
  ],
  registerController.postRegister
);

// Ruta para la página de crear vuelos (protegida para administradores)
router.get('/crear-vuelos', (req, res) => {
  if (req.session.userRole === 'admin') {
    res.render('crear_vuelos', { userName: req.session.userName });
  } else {
    res.redirect('/'); // Redirigir a la página de inicio si no es administrador
  }
});

// Ruta para procesar la creación de vuelos
router.post('/crear-vuelos', (req, res) => {
  const { origen, destino, fecha, precio } = req.body;

  console.log('Origen:', origen, 'Destino:', destino); // Agrega esta línea para verificar los valores

  if (!origen || !destino || !fecha || !precio) {
    return res.render('crear_vuelos', {
      userName: req.session.userName,
      error: 'Todos los campos son obligatorios',
    });
  }

  if (origen === destino) {
    return res.render('crear_vuelos', {
      userName: req.session.userName,
      error: 'El origen y el destino no pueden ser los mismos',
    });
  }

  const query = 'INSERT INTO vuelos (origen, destino, fecha, precio) VALUES (?, ?, ?, ?)';
  db.execute(query, [origen, destino, fecha, precio], (err, results) => {
    if (err) {
      console.error('Error al crear el vuelo:', err);
      return res.render('crear_vuelos', {
        userName: req.session.userName,
        error: 'Error al crear el vuelo',
      });
    }
    res.redirect('/'); // Redirigir a la página de inicio después de crear el vuelo
  });
});

// Ruta para buscar viajes
router.get('/buscar-viajes', (req, res) => {
  const { origin, destination, 'check-in': checkIn, 'check-out': checkOut } = req.query;
  res.render('buscar_viajes', { origin, destination, checkIn, checkOut });
});

// Ruta para la página de contacto
router.get('/contacto', (req, res) => {
  res.render('contacto', { userName: req.session.userName });
});

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;