exports.testDb = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.status(200).json({ success: true, message: 'Conectado a Aiven!', data: rows });
    } catch (error) {
        // Esto nos dirá si es un error de contraseña, host o certificado SSL
        res.status(500).json({ 
            success: false, 
            message: 'Fallo de conexión', 
            error: error.message,
            code: error.code // Ej: ER_ACCESS_DENIED_ERROR, ETIMEDOUT, etc.
        });
    }
};