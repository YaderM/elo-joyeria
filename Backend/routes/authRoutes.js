const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para procesar el inicio de sesión
router.post('/login', authController.login);

// ✅ Nueva ruta real y funcional para restablecer la contraseña del administrador
router.post('/restablecer', authController.restablecerContrasena);

module.exports = router;