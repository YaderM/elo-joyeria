const app = require('./server'); // 👈 Importamos la app de server.js
const db = require('./config/db'); // 👈 Importamos el pool configurado correctamente
require('dotenv').config();

// Probar conexión
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conectado exitosamente a la base de datos de Joyería Elo');
        connection.release();
    } catch (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        process.exit(1);
    }
})();

// 🚀 EL ARRANQUE FINAL
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});