const express = require('express');
const router = express.Router();
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

// Ruta para la página de contacto
router.get('/contacto', (req, res) => {
  res.render('contacto', { userName: req.session.userName });
});

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;