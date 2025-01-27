const express = require('express');
const authController = require('../Controllers/authController');
const mainController = require('../Controllers/mainController');
const router = express.Router();

// Define la ruta para la página de inicio
router.get('/', mainController.getHome);

// Define la ruta para la página de login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Define la ruta para la página de registro
router.get('/registro', (req, res) => {
  res.render('registro');
});

module.exports = router;