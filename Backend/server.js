const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // 👈 Requerido para manejar rutas de carpetas de forma segura
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// 🖼️ SERVIR IMÁGENES LOCALES (¡Súper importante para tu base de datos!)
// Esto expone la carpeta donde guardas las fotos de las joyas de Joyería Elo.
// Si tu carpeta de imágenes está en la raíz y se llama 'public' o 'imagenes', lo mapeas así:
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);

// Ruta base de prueba para el navegador
app.get('/', (req, res) => {
    res.send('Servidor de Joyería Elo corriendo perfectamente 🚀');
});

// 🔍 MIDDLEWARE 404: Captura cualquier endpoint de la API que no exista
app.use((req, res, next) => {
    res.status(404).json({ error: `La ruta solicitada: ${req.originalUrl} no fue encontrada en este servidor.` });
});

// 🚨 MIDDLEWARE DE ERRORES GLOBALES: Evita que el servidor se caiga (Crash Protection)
app.use((err, req, res, next) => {
    console.error('💥 Error inesperado en el servidor:', err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor de Joyería Elo corriendo en el puerto ${PORT}`);
});