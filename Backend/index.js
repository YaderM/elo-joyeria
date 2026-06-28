const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos (Usando Pool)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión (¡Corregido para funcionar con Pool!)
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos de Joyería Elo');
    connection.release(); // Libera la conexión para que otros puedan usarla
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Ruta para obtener todos los productos de la joyería
app.get('/api/productos', (req, res) => {
    const query = 'SELECT * FROM productos';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err.message);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results); // Envía los productos en formato JSON al Frontend
    });
});