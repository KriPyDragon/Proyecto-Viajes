const db = require('../config');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Mostrar la vista de login
exports.getLogin = (req, res) => {
  res.render('login', { errors: null, email: '' });
};

// Procesar el inicio de sesión
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validar errores de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Renderizar la vista de login con los errores y los datos del formulario
    return res.render('login', {
      errors: errors.array(),
      email: email, // Mantener el correo electrónico ingresado
    });
  }

  // Buscar el usuario en la base de datos
  const query = 'SELECT * FROM usuarios WHERE email = ?';
  db.execute(query, [email], async (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      return res.status(500).send('Error al iniciar sesión');
    }

    // Verificar si el usuario existe
    if (results.length === 0) {
      return res.render('login', {
        errors: [{ msg: 'Correo electrónico o contraseña incorrectos' }],
        email: email,
      });
    }

    const user = results[0];

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.contraseña);
    if (!validPassword) {
      return res.render('login', {
        errors: [{ msg: 'Correo electrónico o contraseña incorrectos' }],
        email: email,
      });
    }

    // Almacenar el ID y el nombre del usuario en la sesión
    req.session.userId = user.IdUsuario;
    req.session.userName = user.nombre; // Almacenar el nombre del usuario

    // Redirigir a la página de inicio (home)
    res.redirect('/');
  });
};

// Cerrar sesión
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/');
  });
};