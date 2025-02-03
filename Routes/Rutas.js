const express = require('express');
const router = express.Router();
const db = require('../config');
const authController = require('../Controllers/authController');
const mainController = require('../Controllers/mainController');
const registerController = require('../Controllers/registerController');
const { body, validationResult } = require('express-validator');
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
  const { origen, destino, fecha, hora, precio } = req.body;

  console.log('Origen:', origen, 'Destino:', destino, 'Fecha:', fecha, 'Hora:', hora, 'Precio:', precio); // Agrega esta línea para verificar los valores

  if (!origen || !destino || !fecha || !hora || !precio) {
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

  const query = 'INSERT INTO vuelos (origen, destino, fecha, hora, precio) VALUES (?, ?, ?, ?, ?)';
  db.execute(query, [origen, destino, fecha, hora, precio], (err, results) => {
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

  // Consulta a la base de datos para buscar vuelos
  const query = `
    SELECT idvuelos, origen, destino, fecha, hora, precio 
    FROM vuelos 
    WHERE origen = ? AND destino = ? AND fecha = ?
  `;

  db.execute(query, [origin, destination, checkIn], (err, results) => {
    if (err) {
      console.error('Error al buscar vuelos:', err);
      return res.render('buscar_viajes', {
        origin,
        destination,
        checkIn,
        checkOut,
        error: 'Error al buscar vuelos',
      });
    }

    // Renderizar la vista con los resultados de la búsqueda
    res.render('buscar_viajes', {
      origin,
      destination,
      checkIn,
      checkOut,
      vuelos: results, // Pasar los resultados de la consulta a la vista
    });
  });
});

// Ruta para la página de reserva de vuelo
router.get('/reservar-vuelo/:id', (req, res) => {
  const vueloId = req.params.id;

  // Consulta a la base de datos para obtener los detalles del vuelo
  const query = 'SELECT * FROM vuelos WHERE idvuelos = ?';
  db.execute(query, [vueloId], (err, results) => {
    if (err) {
      console.error('Error al obtener los detalles del vuelo:', err);
      return res.status(500).send('Error al obtener los detalles del vuelo');
    }

    if (results.length === 0) {
      return res.status(404).send('Vuelo no encontrado');
    }

    const vuelo = results[0];
    res.render('reserva_vuelo', { vuelo });
  });
});

// Ruta para procesar la reserva de vuelo
router.post('/reservar-vuelo', (req, res) => {
  const { nombre, email, vuelo } = req.body;

  // Consulta para obtener el número de reservas actuales del vuelo
  const query = 'SELECT reservas, origen, destino, fecha, hora, precio FROM vuelos WHERE idvuelos = ?';
  db.execute(query, [vuelo], (err, results) => {
    if (err) {
      console.error('Error al obtener el número de reservas:', err);
      return res.render('reserva_vuelo', { error: 'Error al procesar la reserva', vuelo: { idvuelos: vuelo } });
    }

    const vueloData = results[0];
    const reservasActuales = vueloData.reservas;

    // Verificar si el número de reservas ha alcanzado el límite
    if (reservasActuales >= 20) {
      return res.render('reserva_vuelo', { error: 'El vuelo ha alcanzado el número máximo de reservas', vuelo: { idvuelos: vuelo } });
    }

    // Insertar la reserva en la base de datos
    const insertQuery = 'INSERT INTO reservas (idVuelo, nombre, email, fechaReserva) VALUES (?, ?, ?, NOW())';
    db.execute(insertQuery, [vuelo, nombre, email], (err, results) => {
      if (err) {
        console.error('Error al realizar la reserva:', err);
        return res.render('reserva_vuelo', { error: 'Error al procesar la reserva', vuelo: { idvuelos: vuelo } });
      }

      // Actualizar el número de reservas del vuelo
      const updateQuery = 'UPDATE vuelos SET reservas = reservas + 1 WHERE idvuelos = ?';
      db.execute(updateQuery, [vuelo], (err, results) => {
        if (err) {
          console.error('Error al actualizar el número de reservas:', err);
          return res.render('reserva_vuelo', { error: 'Error al procesar la reserva', vuelo: { idvuelos: vuelo } });
        }

        // Crear el directorio si no existe
        const reservasDir = path.join(__dirname, '../public/reservas');
        if (!fs.existsSync(reservasDir)) {
          fs.mkdirSync(reservasDir, { recursive: true });
        }

        // Generar el PDF de la reserva
        const doc = new pdf();
        const fileName = `reserva_${vuelo}_${nombre}.pdf`;
        const filePath = path.join(reservasDir, fileName);
        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(25).text('Reserva de Vuelo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(18).text(`Nombre: ${nombre}`);
        doc.fontSize(18).text(`Correo Electrónico: ${email}`);
        doc.fontSize(18).text(`ID del Vuelo: ${vuelo}`);
        doc.fontSize(18).text(`Origen: ${vueloData.origen}`);
        doc.fontSize(18).text(`Destino: ${vueloData.destino}`);
        doc.fontSize(18).text(`Fecha: ${new Date(vueloData.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        doc.fontSize(18).text(`Hora: ${vueloData.hora}`);
        doc.fontSize(18).text(`Precio: $${vueloData.precio}`);
        doc.end();

        res.render('reserva_vuelo', { message: 'Reserva realizada con éxito. Descarga tu PDF aquí.', vuelo: { idvuelos: vuelo }, pdfPath: `/reservas/${fileName}` });
      });
    });
  });
});

// Ruta para la página de contacto
router.get('/contacto', (req, res) => {
  res.render('contacto', { userName: req.session.userName });
});

// Ruta para cerrar sesión
router.get('/logout', authController.logout);

module.exports = router;