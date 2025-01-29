const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const mainController = require('../Controllers/mainController');
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
router.get('/registro', (req, res) => {
  res.render('registro');
});

// Ruta para la página de contacto
router.get('/contacto', (req, res) => {
  res.render('contacto', { userName: req.session.userName });
});

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;