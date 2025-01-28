const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const mainController = require('../Controllers/mainController');
const { body, validationResult } = require('express-validator');
const session = require('express-session');

// Configuración de sesiones
router.use(
  session({
    secret: 'tu_clave_secreta', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambia a true si usas HTTPS
  })
);

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
router.get('/registro', authController.getRegistro);

// Ruta para procesar el registro
router.post(
  '/registro',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El correo electrónico no es válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    body('confirmPassword').notEmpty().withMessage('La confirmación de la contraseña es requerida'),
  ],
  authController.postRegistro
);

module.exports = router;