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
    let connection;
    try {
        connection = await db.getConnection();
        // Filtramos por fecha (asumiendo que tu tabla tiene una columna 'fecha_registro' o similar)
        const query = "SELECT * FROM ventas_pendientes WHERE fecha_registro BETWEEN ? AND ?";
        const [rows] = await connection.query(query, [desde, hasta]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al filtrar ventas' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;