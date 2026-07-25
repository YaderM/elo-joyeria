const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.procesarVenta = async (req, res) => {
    const { cliente, carrito, total, comprobante_sinpe } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const idVenta = uuidv4(); 
        const detalleJson = JSON.stringify(carrito);

        // Consulta alineada con los nombres exactos de columnas estándar
        await connection.query(
            `INSERT INTO ventas_pendientes 
             (id_venta, nombre_cliente, email_cliente, detalle_productos, total, comprobante_sinpe, estado) 
             VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
            [idVenta, cliente.nombre, cliente.email, detalleJson, total, comprobante_sinpe]
        );

        await connection.commit();
        res.status(201).json({ success: true, mensaje: 'Solicitud de venta registrada correctamente', idVenta });

    } catch (error) {
        await connection.rollback();
        console.error('Error en la transacción de venta:', error.message);
        res.status(500).json({ error: error.message || 'Error al registrar la venta pendiente' });
    } finally {
        connection.release();
    }
};
