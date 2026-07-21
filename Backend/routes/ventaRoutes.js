const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Necesario para las consultas directas
const { procesarVenta } = require('../controllers/ventaController'); 

// RUTA ORIGINAL
router.post('/', async (req, res) => {
    await procesarVenta(req, res);
});

// RUTAS DE GESTIÓN (Directas aquí para evitar errores de importación)
router.get('/pendientes', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [rows] = await connection.query("SELECT * FROM ventas_pendientes WHERE estado = 'PENDIENTE'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    } finally {
        if (connection) connection.release();
    }
});

router.put('/pendientes/:id/aprobar', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [pedidos] = await connection.query('SELECT * FROM ventas_pendientes WHERE id_venta = ?', [req.params.id]);
        if (pedidos.length === 0) throw new Error('Pedido no encontrado');
        
        const pedido = pedidos[0];
        const carrito = typeof pedido.detalle_productos === 'string' ? JSON.parse(pedido.detalle_productos) : pedido.detalle_productos;

        for (const item of carrito) {
            await connection.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [item.cantidad, item.id_producto]);
        }

        await connection.query("UPDATE ventas_pendientes SET estado = 'CONFIRMADA' WHERE id_venta = ?", [req.params.id]);
        await connection.commit();
        res.status(200).json({ success: true, mensaje: 'Pedido confirmado' });
    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

router.get('/ventas_pendientes', async (req, res) => {
    const { desde, hasta } = req.query;
    
    // Validación para evitar consultas con parámetros vacíos
    if (!desde || !hasta) {
        return res.status(400).json({ error: 'Parámetros de fecha incompletos' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        
        // Consulta usando el nombre real de columna: fecha_creacion
        const query = `
            SELECT * FROM ventas_pendientes 
            WHERE DATE(fecha_creacion) BETWEEN ? AND ?
        `;
        
        const [rows] = await connection.query(query, [desde, hasta]);
        res.json(rows);
    } catch (error) {
        console.error("Error SQL:", error);
        res.status(500).json({ error: 'Error en servidor: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
});

// 📧 NUEVA RUTA DE PRUEBA: Envía correo desde el backend usando fetch nativo para evitar dependencias
router.post('/enviar-correo-prueba', async (req, res) => {
    const { cliente_nombre, cliente_email, total, productos, comprobante } = req.body;

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: 'service_0xlqzaq',
                template_id: 'template_cy9a81x',
                user_id: 'ombe2_2NkrxCxincc',
                template_params: {
                    to_name: "Elo Joyería",
                    cliente_nombre: cliente_nombre,
                    cliente_email: cliente_email,
                    total: total,
                    productos: productos,
                    comprobante: comprobante
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error en la respuesta de EmailJS');
        }

        res.status(200).json({ success: true, mensaje: 'Correo enviado correctamente desde el backend' });
    } catch (error) {
        console.error('Error enviando correo desde backend:', error.message);
        res.status(500).json({ error: 'No se pudo enviar el correo', details: error.message });
    }
});

module.exports = router;