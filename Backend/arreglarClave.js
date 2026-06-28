const bcrypt = require('bcryptjs');
const db = require('./config/db'); // Conexión a tu base de datos

async function actualizarClave() {
    try {
        console.log("Calculando el hash matemático real de Elo2026*...");
        
        // 1. Generar el hash criptográfico real y válido
        const hashReal = await bcrypt.hash('Elo2026*', 10);
        
        // 2. Insertarlo en la base de datos de forma forzada
        const [resultado] = await db.query(
            "UPDATE usuarios SET password = ? WHERE email = 'admin@joyeriaelo.com'", 
            [hashReal]
        );

        if (resultado.affectedRows > 0) {
            console.log("✅ ¡Clave actualizada con éxito en MySQL!");
            console.log("🔒 Tu nuevo hash seguro es:", hashReal);
        } else {
            console.log("⚠️ No se encontró el correo. Asegúrate de haber ejecutado el INSERT en MySQL Workbench antes.");
        }
        
        process.exit(0); // Cierra el script
    } catch (error) {
        console.error("Error al actualizar la base de datos:", error);
        process.exit(1);
    }
}

actualizarClave();