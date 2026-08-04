const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Necesario para las consultas directas
const { procesarVenta } = require('../controllers/ventaController'); 
const { Resend } = require('resend');

// Inicializar Resend usando la variable de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// RUTA ORIGINAL DE VENTAS CON INTERCEPTOR DE CORREO AUTOMÁTICO (RESEND)
router.post('/', async (req, res) => {
    const datosVenta = req.body;
    let ventaExitosa = false;

    // Interceptor para conocer si la venta se guardó correctamente (status 201)
    const resInterceptor = {
        status: function(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json: function(data) {
            if (this.statusCode === 201 && data.success) {
                ventaExitosa = true;
            }
            res.status(this.statusCode).json(data);
        }
    };

    // Ejecuta tu lógica intacta
    await procesarVenta(req, resInterceptor);

    // Si la venta se registró con éxito, enviamos el correo usando Resend sin afectar al cliente
    if (ventaExitosa && datosVenta.cliente) {
        try {
            // Formateamos el carrito limpiamente sin etiquetas repetidas
            const productosHtml = datosVenta.carrito ? datosVenta.carrito.map(item => 
                `<li>${item.nombre} - Cantidad: ${item.cantidad} - Precio: ₡${item.precio}</li>`
            ).join('') : '';

            const nombreCliente = datosVenta.cliente.nombre;
            const emailCliente = datosVenta.cliente.email;
            const totalVenta = datosVenta.total;
            const comprobanteSinpe = datosVenta.comprobante_sinpe || 'No adjunto';

            const contenidoHtml = `
                <h2>¡Gracias por tu compra, ${nombreCliente}!</h2>
                <p>Hemos recibido tu solicitud de pedido. Detalles:</p>
                <ul>
                    ${productosHtml}
                </ul>
                <p><strong>Total: ₡${totalVenta}</strong></p>
                <p>Comprobante adjunto: ${comprobanteSinpe}</p>
                <p>El pedido quedará en estado PENDIENTE hasta que sea verificado. Los envíos tardan de 3 a 5 días.</p>
            `;

            await resend.emails.send({
                from: 'Elo Joyería <info.joyeriaelo@gmail.com>', // O el correo remitente verificado en tu cuenta de Resend
                to: [emailCliente, 'info.joyeriaelo@gmail.com'],
                subject: 'Nueva solicitud de pedido - Elo Joyería',
                html: contenidoHtml
            });

            console.log('✅ Correo de notificación enviado exitosamente desde el backend vía Resend.');
        } catch (emailError) {
            console.error('⚠️ La venta se guardó pero falló el envío del correo:', emailError.message);
        }
    }
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

// 📧 RUTA DE PRUEBA: Envía correo desde el backend usando Resend
router.post('/enviar-correo-prueba', async (req, res) => {
    const { cliente_nombre, cliente_email, monto_total, productos, comprobante } = req.body;

    try {
        const data = await resend.emails.send({
            from: 'Elo Joyería <info.joyeriaelo@gmail.com>',
            to: [cliente_email || 'info.joyeriaelo@gmail.com', 'info.joyeriaelo@gmail.com'],
            subject: 'Prueba de Sistema - Elo Joyería',
            html: `
                <h3>Hola ${cliente_nombre || "Elo Joyería"}</h3>
                <p>Prueba de correo exitosa usando Resend.</p>
                <p><strong>Total:</strong> ₡${monto_total || '0'}</p>
                <p><strong>Productos:</strong> ${productos || 'Ninguno'}</p>
                <p><strong>Comprobante:</strong> ${comprobante || 'No adjunto'}</p>
            `
        });

        res.status(200).json({ success: true, mensaje: 'Correo enviado correctamente desde el backend con Resend', data });
    } catch (error) {
        console.error('Error enviando correo desde backend:', error.message);
        res.status(500).json({ error: 'No se pudo enviar el correo', details: error.message });
    }
});

module.exports = router;