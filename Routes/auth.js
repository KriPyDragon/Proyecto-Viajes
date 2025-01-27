const express = require('express');
const router = express.Router();

// Ruta para la página de login (GET)
router.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para manejar el envío del formulario de login (POST)
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // Aquí puedes agregar la lógica para autenticar al usuario
    console.log(`Email: ${email}, Password: ${password}`);
    res.redirect('/'); // Redirige al inicio después del login
});

module.exports = router;