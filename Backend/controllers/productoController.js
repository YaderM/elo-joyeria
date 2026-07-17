const db = require('../config/db');
const { enviarCorreo } = require('../utils/emailService'); // 👈 Importamos el servicio de correo

// 1. Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        const { material, tipo } = req.query;
        let query = 'SELECT * FROM productos WHERE 1=1';
        const queryParams = [];

        if (material) {
            query += ' AND material = ?';
            queryParams.push(material);
        }

        if (tipo) {
            query += ' AND tipo_producto = ?';
            queryParams.push(tipo);
        }

        const [rows] = await db.query(query, queryParams);

        const ahoraMs = Date.now();
        
        const productosProcesados = rows.map(prod => {
            if (prod.precio_oferta && prod.fecha_fin_oferta) {
                const fechaFinMs = new Date(prod.fecha_fin_oferta).getTime();
                if (ahoraMs > fechaFinMs) {
                    return { ...prod, precio_oferta: null, fecha_fin_oferta: null };
                }
            }
            return prod;
        });

        res.json(productosProcesados);

    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }
};

// 2. Obtener un solo producto por su ID
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const prod = rows[0];
        const ahoraMs = Date.now();
        
        if (prod.precio_oferta && prod.fecha_fin_oferta) {
            const fechaFinMs = new Date(prod.fecha_fin_oferta).getTime();
            if (ahoraMs > fechaFinMs) {
                prod.precio_oferta = null;
                prod.fecha_fin_oferta = null;
            }
        }
        
        res.json(prod);
    } catch (error) {
        console.error('❌ Error al obtener el detalle:', error);
        res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }
};

// 3. Obtener categorías dinámicas
exports.obtenerCategoriasHome = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias_home WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }
};

// 4. Crear producto
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, imagen_url, stock, material, tipo_producto } = req.body;
        
        // AJUSTE: Mantenemos estructura, solo nos aseguramos de usar columnas reales
        const query = `
            INSERT INTO productos (nombre, descripcion, precio, imagen_url, stock, material, tipo_producto) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [nombre, descripcion, precio, imagen_url, stock, material, tipo_producto]);
        
        res.status(201).json({ mensaje: 'Producto creado con éxito', id_producto: result.insertId });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ error: 'Error al insertar el producto' });
    }
};

// 5. Actualizar producto
exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, imagen_url, stock, material, tipo_producto, precio_oferta, fecha_fin_oferta } = req.body;

        // AJUSTE: Mantenemos estructura, solo usamos columnas reales
        const query = `
            UPDATE productos 
            SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, stock = ?, material = ?, tipo_producto = ?, precio_oferta = ?, fecha_fin_oferta = ?
            WHERE id_producto = ?
        `;

        const [result] = await db.query(query, [
            nombre, descripcion, precio, imagen_url, stock, material, tipo_producto, 
            precio_oferta || null, fecha_fin_oferta || null, id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: '¡Joya actualizada con éxito!' });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// 6. Eliminar un producto
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El producto no existe' });
        }
        
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

// 7. Obtener Materiales
exports.obtenerMaterialesForm = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materiales ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener materiales:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 8. Crear Material
exports.crearMaterial = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const [result] = await db.query('INSERT INTO materiales (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        res.status(201).json({ mensaje: 'Nuevo material registrado', id_material: result.insertId });
    } catch (error) {
        console.error('Error al crear material:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 9. Obtener Tipos
exports.obtenerTiposForm = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tipos_producto ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tipos:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 10. Actualizar oferta
exports.actualizarOferta = async (req, res) => {
    try {
        const { id } = req.params;
        const { precio_oferta, fecha_fin_oferta } = req.body; 

        const query = 'UPDATE productos SET precio_oferta = ?, fecha_fin_oferta = ? WHERE id_producto = ?';
        const [result] = await db.query(query, [precio_oferta || null, fecha_fin_oferta || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El producto no fue encontrado' });
        }

        res.json({ mensaje: '¡Precio de oferta y tiempo configurados con éxito!' });
    } catch (error) {
        console.error('Error al actualizar oferta:', error.message);
        res.status(500).json({ error: 'Error al actualizar la oferta' });
    }
};

// 11. Rebajar stock
exports.rebajarStockLocal = async (req, res) => {
    try {
        const { id_producto, cantidadVendida } = req.body;
        const query = 'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?';
        const [result] = await db.query(query, [cantidadVendida, id_producto, cantidadVendida]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Stock insuficiente o producto no encontrado' });
        }

        res.json({ success: true, mensaje: '¡Stock rebajado con éxito!' });
    } catch (error) {
        console.error('Error al rebajar stock:', error.message);
        res.status(500).json({ error: 'Error al actualizar el inventario' });
    }
};

// 12. Reporte Ventas
exports.obtenerReporteVentas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reporte_ventas_pro');
        res.json(rows);
    } catch (error) {
        console.error('Error al generar reporte:', error.message);
        res.status(500).json({ error: 'Error al obtener reporte' });
    }
};

// 13. Registrar Venta
exports.registrarVentaCompleta = async (req, res) => {
    try {
        const { id_producto, cantidad } = req.body;
        const [producto] = await db.query('SELECT stock FROM productos WHERE id_producto = ?', [id_producto]);
        
        if (producto.length === 0 || producto[0].stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente' });
        }

        await db.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [cantidad, id_producto]);
        await db.query('INSERT INTO cotizaciones (id_producto, cantidad, fecha_solicitud) VALUES (?, ?, NOW())', [id_producto, cantidad]);

        res.json({ success: true, mensaje: 'Venta registrada' });
    } catch (error) {
        console.error('Error al registrar venta:', error.message);
        res.status(500).json({ error: 'Error interno al procesar venta' });
    }
};

// 14. Venta Pendiente
exports.iniciarVentaPendiente = async (req, res) => {
    try {
        const { id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe } = req.body;
        
        await db.query(
            'INSERT INTO ventas_pendientes (id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe) VALUES (?, ?, ?, ?, ?, ?)',
            [id_venta, nombre_cliente, email_cliente, JSON.stringify(detalle_productos), monto_total, comprobante_sinpe]
        );

        const mensajeHtml = `<h2>Nueva Venta Pendiente</h2><p>Cliente: ${nombre_cliente}</p><p>Total: ₡${monto_total}</p>`;
        await enviarCorreo(process.env.EMAIL_USER, 'Nueva venta pendiente', mensajeHtml);

        res.json({ success: true, mensaje: 'Venta registrada y notificada.' });
    } catch (error) {
        console.error('Error al iniciar venta pendiente:', error);
        res.status(500).json({ error: 'No se pudo registrar la venta pendiente' });
    }
};
// ... (al final de tu archivo, añade esto antes de cerrar las exportaciones)
// 15. Crear Tipo
exports.crearTipo = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre del tipo es obligatorio' });
        }
        const [result] = await db.query('INSERT INTO tipos_producto (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ mensaje: '¡Nuevo tipo registrado!', id_tipo: result.insertId });
    } catch (error) {
        console.error('Error al crear tipo:', error.message);
        res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
};

// 15. Prueba de conexión a la base de datos
exports.testDb = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        res.status(200).json({ success: true, message: 'Conectado a Aiven!', data: rows });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Fallo de conexión', 
            error: error.message 
        });
    }
};