const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.procesarVenta = async (req, res) => {
    const { cliente, carrito, total, comprobante_sinpe, tipo_entrega, costo_envio, telefono_cliente } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const idVenta = uuidv4(); 
        const detalleJson = JSON.stringify(carrito);

        // Consulta actualizada para incluir tipo de entrega, costo de envío y teléfono del cliente
        await connection.query(
            `INSERT INTO ventas_pendientes 
             (id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe, tipo_entrega, costo_envio, telefono_cliente, estado) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
            [
                idVenta, 
                cliente.nombre, 
                cliente.email, 
                detalleJson, 
                total, 
                comprobante_sinpe || null, 
                tipo_entrega || 'ENVIO', 
                costo_envio || 0, 
                telefono_cliente || cliente.telefono || null
            ]
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