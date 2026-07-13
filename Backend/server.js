const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const ventaRoutes = require('./routes/ventaRoutes');

dotenv.config();

const app = express();

// Middlewares Globales
// Configuración de CORS permitiendo todos los orígenes para diagnóstico
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 🖼️ SERVIR IMÁGENES LOCALES
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);

// Ruta base de prueba para el navegador
app.get('/', (req, res) => {
    res.send('Servidor de Joyería Elo corriendo perfectamente 🚀');
});

// 🔍 MIDDLEWARE 404: Captura cualquier endpoint de la API que no exista
app.use((req, res, next) => {
    res.status(404).json({ error: `La ruta solicitada: ${req.originalUrl} no fue encontrada en este servidor.` });
});

// 🚨 MIDDLEWARE DE ERRORES GLOBALES
app.use((err, req, res, next) => {
    console.error('💥 Error inesperado en el servidor:', err.stack);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor.', details: err.message });
});

// Exportamos la app para que index.js la utilice
module.exports = app;