const db = require('../config/db');
const { enviarCorreo } = require('../utils/emailService'); // 👈 Importamos el servicio de correo

// 1. Obtener todos los productos (Con filtros para la Tienda y validación de expiración corregida por zonas horarias)
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

        // CORRECCIÓN DE TIEMPO: 
        // Obtenemos los milisegundos puros de la hora actual del servidor para comparar directamente.
        const ahoraMs = Date.now();
        
        const productosProcesados = rows.map(prod => {
            if (prod.precio_oferta && prod.fecha_fin_oferta) {
                const fechaFinMs = new Date(prod.fecha_fin_oferta).getTime();
                
                // Si la fecha actual ya superó la fecha límite, limpiamos los campos visualmente
                if (ahoraMs > fechaFinMs) {
                    return { ...prod, precio_oferta: null, fecha_fin_oferta: null };
                }
            }
            return prod;
        });

        res.json(productosProcesados);

    } catch (error) {
        console.error('Error al obtener productos con filtros:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 2. Obtener un solo producto por su ID (Para la página de detalles con validación de expiración corregida)
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        const prod = rows[0];
        const ahoraMs = Date.now();
        
        // Si la oferta ya venció al entrar al detalle, se limpia dinámicamente usando milisegundos absolutos
        if (prod.precio_oferta && prod.fecha_fin_oferta) {
            const fechaFinMs = new Date(prod.fecha_fin_oferta).getTime();
            if (ahoraMs > fechaFinMs) {
                prod.precio_oferta = null;
                prod.fecha_fin_oferta = null;
            }
        }
        
        res.json(prod);
    } catch (error) {
        console.error('Error al obtener el detalle del producto:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 3. Obtener categorías dinámicas para la página de Inicio (Administrables)
exports.obtenerCategoriasHome = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias_home WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener categorías del home:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// ==========================================
// 🛠️ CONTROLADORES EXCLUSIVOS DEL ADMINISTRADOR
// ==========================================

// 4. Crear un nuevo producto con categorías dinámicas
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, imagen_url, stock, material_id, tipo_id } = req.body;
        
        const query = `
            INSERT INTO productos (nombre, descripcion, precio, imagen_url, stock, material_id, tipo_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(query, [nombre, descripcion, precio, imagen_url, stock, material_id, tipo_id]);
        
        res.status(201).json({ mensaje: 'Producto creado con éxito', id_producto: result.insertId });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ error: 'Error al insertar el producto en la base de datos' });
    }
};

// 5. Actualizar un producto existente por su ID (Se añade soporte completo a precio_oferta y fecha_fin_oferta)
exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, imagen_url, stock, material_id, tipo_id, precio_oferta, fecha_fin_oferta } = req.body;

        const query = `
            UPDATE productos 
            SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, stock = ?, material_id = ?, tipo_id = ?, precio_oferta = ?, fecha_fin_oferta = ?
            WHERE id_producto = ?
        `;

        const [result] = await db.query(query, [
            nombre, 
            descripcion, 
            precio, 
            imagen_url, 
            stock, 
            material_id, 
            tipo_id, 
            precio_oferta !== undefined ? precio_oferta : null, 
            fecha_fin_oferta !== undefined ? fecha_fin_oferta : null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El producto que deseas actualizar no fue encontrado' });
        }

        res.json({ mensaje: '¡Joya actualizada con éxito!' });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ error: 'Error al actualizar el producto en la base de datos' });
    }
};

// 6. Eliminar un producto físicamente por su ID
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El producto que deseas eliminar no existe' });
        }
        
        res.json({ mensaje: 'Producto eliminado correctamente del inventario' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        res.status(500).json({ error: 'Error al eliminar el producto de la base de datos' });
    }
};

// 7. Obtener la lista de Materiales dinámicos
exports.obtenerMaterialesForm = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materiales ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener materiales:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 8. Crear un nuevo Material
exports.crearMaterial = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const [result] = await db.query('INSERT INTO materiales (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        res.status(201).json({ mensaje: 'Nuevo material registrado', id_material: result.insertId });
    } catch (error) {
        console.error('Error al crear material:', error.message);
        res.status(500).json({ error: 'El material ya existe o hubo un error en la base de datos' });
    }
};

// 9. Obtener los Tipos de Producto dinámicos
exports.obtenerTiposForm = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tipos_producto ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tipos de productos:', error.message);
        res.status(500).json({ error: 'Error en la base de datos' });
    }
};

// 10. Actualizar exclusivamente el precio de oferta de un producto junto con su FECHA DE EXPIRACIÓN
exports.actualizarOferta = async (req, res) => {
    try {
        const { id } = req.params;
        const { precio_oferta, fecha_fin_oferta } = req.body; 

        const query = 'UPDATE productos SET precio_oferta = ?, fecha_fin_oferta = ? WHERE id_producto = ?';
        const [result] = await db.query(query, [
            precio_oferta, 
            fecha_fin_oferta ? fecha_fin_oferta : null, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'El producto no fue encontrado' });
        }

        res.json({ mensaje: '¡Precio de oferta y tiempo configurados con éxito!' });
    } catch (error) {
        console.error('Error al actualizar la oferta:', error.message);
        res.status(500).json({ error: 'Error al actualizar la oferta en la base de datos' });
    }
};

// 11. 📦 NUEVA FUNCIÓN: Rebajar el stock en tu MySQL local desde el Admin Panel
exports.rebajarStockLocal = async (req, res) => {
    try {
        const { id_producto, cantidadVendida } = req.body;

        const query = 'UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?';
        const [result] = await db.query(query, [cantidadVendida, id_producto, cantidadVendida]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'No hay suficiente stock disponible para rebajar o la joya no existe' });
        }

        res.json({ success: true, mensaje: '¡Stock rebajado con éxito en la base de datos local!' });
    } catch (error) {
        console.error('Error al rebajar el stock local:', error.message);
        res.status(500).json({ error: 'Error al actualizar el inventario en la base de datos' });
    }
};

// 12. 📈 NUEVA FUNCIÓN: Obtener reporte detallado de ventas desde la vista
exports.obtenerReporteVentas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reporte_ventas_pro');
        res.json(rows);
    } catch (error) {
        console.error('Error al generar el reporte de ventas:', error.message);
        res.status(500).json({ error: 'Error al obtener el reporte de ventas' });
    }
};

// 13. 💰 NUEVA FUNCIÓN: Registrar venta completa (Descuento stock + Registro histórico)
exports.registrarVentaCompleta = async (req, res) => {
    try {
        const { id_producto, cantidad } = req.body;

        // Validamos que exista el producto y haya stock
        const [producto] = await db.query('SELECT stock FROM productos WHERE id_producto = ?', [id_producto]);
        if (producto.length === 0 || producto[0].stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente o producto no encontrado' });
        }

        // Ejecutamos las dos operaciones necesarias para el reporte
        await db.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [cantidad, id_producto]);
        await db.query('INSERT INTO cotizaciones (id_producto, cantidad, fecha_solicitud) VALUES (?, ?, NOW())', [id_producto, cantidad]);

        res.json({ success: true, mensaje: 'Venta registrada y stock actualizado correctamente' });
    } catch (error) {
        console.error('Error al registrar la venta:', error.message);
        res.status(500).json({ error: 'Error interno al procesar la venta' });
    }
};

// 14. 🆕 NUEVA FUNCIÓN: Iniciar venta pendiente (Nuevo flujo automático para el Frontend)
exports.iniciarVentaPendiente = async (req, res) => {
    try {
        const { id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe } = req.body;
        
        // 1. Guardamos en la tabla de ventas_pendientes
        await db.query(
            'INSERT INTO ventas_pendientes (id_venta, nombre_cliente, email_cliente, detalle_productos, monto_total, comprobante_sinpe, estado) VALUES (?, ?, ?, ?, ?, ?, "PENDIENTE")',
            [id_venta, nombre_cliente, email_cliente, JSON.stringify(detalle_productos), monto_total, comprobante_sinpe]
        );

        // 2. Enviamos el correo de notificación automáticamente
        const mensajeHtml = `
            <h2>Nueva Venta Pendiente</h2>
            <p>Se ha recibido una nueva solicitud de compra.</p>
            <p><strong>ID Venta:</strong> ${id_venta}</p>
            <p><strong>Cliente:</strong> ${nombre_cliente} (${email_cliente})</p>
            <p><strong>Total:</strong> ₡${monto_total}</p>
            <p>Por favor, verifica el comprobante SINPE adjunto en el sistema.</p>
        `;

        await enviarCorreo(process.env.EMAIL_USER, 'Nueva venta pendiente en Joyería Elo', mensajeHtml);

        res.json({ success: true, mensaje: 'Venta registrada y notificación enviada.' });
    } catch (error) {
        console.error('Error al iniciar venta pendiente:', error);
        res.status(500).json({ error: 'No se pudo registrar la venta pendiente' });
    }
};