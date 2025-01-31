const db = require('../config');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.getRegister = (req, res) => {
  res.render('registro', { errors: null });
};

exports.postRegister = async (req, res) => {
  const { nombre, email, password, confirmPassword } = req.body;

  // Validar errores de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('registro', {
      errors: errors.array(),
    });
  }

  // Verificar que las contraseñas coincidan
  if (password !== confirmPassword) {
    return res.render('registro', {
      errors: [{ msg: 'Las contraseñas no coinciden' }],
    });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario en la base de datos con el rol "usuario"
    const query = 'INSERT INTO usuarios (nombre, email, contraseña, rol, created_at) VALUES (?, ?, ?, ?, NOW())';
    db.execute(query, [nombre, email, hashedPassword, 'usuario'], (err, results) => {
      if (err) {
        console.error('Error al registrar el usuario:', err);

        // Manejar errores específicos de la base de datos
        let errorMsg = 'Error al registrar el usuario';
        if (err.code === 'ER_DUP_ENTRY') {
          errorMsg = 'El correo electrónico ya está registrado';
        }

        return res.render('registro', {
          errors: [{ msg: errorMsg }],
        });
      }

      // Redirigir a la página de login
      res.redirect('/login');
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return res.render('registro', {
      errors: [{ msg: 'Ocurrió un error inesperado. Inténtalo de nuevo.' }],
    });
  }
};