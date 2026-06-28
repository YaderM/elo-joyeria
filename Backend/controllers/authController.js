const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. INICIO DE SESIÓN (Soporta Admin y Cliente)
// ==========================================
exports.login = async (req, res) => {
    try {
        const { email, contrasena } = req.body; 

        // 1. Buscar al usuario en la base de datos usando tu columna 'email'
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const user = rows[0];

        // 2. Comparar la contraseña ingresada con la columna 'password' de tu tabla
        const passwordCorrecto = await bcrypt.compare(contrasena, user.password);
        
        if (!passwordCorrecto) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // 3. VALIDACIÓN DE ROLES (Permite pasar a admins y clientes para la verificación del profesor)
        if (user.rol !== 'admin' && user.rol !== 'cliente') {
            return res.status(403).json({ error: 'No tienes un rol autorizado en el sistema' });
        }

        // 4. Generar el Token JWT válido por 2 horas (incluye el rol)
        const token = jwt.sign(
            { id_usuario: user.id_usuario, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // 5. Responder al Frontend con los datos y el ROL asignado
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol // <-- Clave para que Vite sepa si es admin o cliente
            }
        });

    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ error: 'Error del servidor al intentar iniciar sesión' });
    }
};

// ==========================================
// 2. RESTABLECER CONTRASEÑA (Soporta Admin y Cliente)
// ==========================================
exports.restablecerContrasena = async (req, res) => {
    try {
        const { email, nuevaContrasena } = req.body;

        // 1. Validar que el correo ingresado pertenezca a un rol autorizado (admin o cliente)
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND rol IN ("admin", "cliente")', [email]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'El correo electrónico no coincide con un usuario autorizado.' });
        }

        // 2. Encriptar la nueva contraseña usando bcryptjs (siguiendo tu estándar)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptado = await bcrypt.hash(nuevaContrasena, salt);

        // 3. Modificación real en tu tabla usando tus columnas exactas ('password' y 'email')
        await db.query('UPDATE usuarios SET password = ? WHERE email = ?', [passwordEncriptado, email]);

        // 4. Respuesta exitosa
        res.json({ mensaje: 'Contraseña actualizada correctamente en la base de datos.' });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error.message);
        res.status(500).json({ error: 'Error del servidor al intentar actualizar la contraseña' });
    }
};