const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // Asegúrate de tener instalado 'uuid'

exports.procesarVenta = async (req, res) => {
    // Obtenemos los datos del frontend
    const { cliente, carrito, total, comprobante_sinpe } = req.body;

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Generar ID único para la venta pendiente
        const idVenta = uuidv4(); 
        
        // 2. Convertir el carrito a JSON para guardarlo en la columna 'detalle_productos'
        const detalleJson = JSON.stringify(carrito);

        // 3. Insertar en la tabla 'ventas_pendientes'
        // Nota: Ajustado a los nombres exactos de tu tabla
        await connection.query(
            `INSERT INTO ventas_pendientes 
             (id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe, estado, fecha_creacion) 
             VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', NOW())`,
            [idVenta, cliente.nombre, cliente.email, detalleJson, total, comprobante_sinpe]
        );

        // 4. (Opcional) Si decides rebajar stock aquí mismo al pedir:
        // for (const item of carrito) {
        //     await connection.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [item.cantidad, item.id_producto]);
        // }

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
