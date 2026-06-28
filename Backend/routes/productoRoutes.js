const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// 🛒 RUTAS PÚBLICAS (Clientes y Tienda)
router.get('/', productoController.obtenerProductos);
router.get('/categorias-home', productoController.obtenerCategoriasHome);

// 🗂️ RUTAS DE AUXILIARES (Para cargar selects en formularios)
router.get('/aux/materiales', productoController.obtenerMaterialesForm);
router.get('/aux/tipos', productoController.obtenerTiposForm);

// 🔐 RUTAS ADMINISTRATIVAS (Manejo del panel)
router.post('/', productoController.crearProducto); // POST para insertar
router.put('/:id', productoController.actualizarProducto); // 👈 ¡FALTABA ESTA RUTA!
router.delete('/:id', productoController.eliminarProducto); // DELETE para borrar
router.post('/aux/materiales', productoController.crearMaterial); // POST para crear categorías nuevas como Oro
// En routes/productoRoutes.js
router.patch('/:id/oferta', productoController.actualizarOferta);

// 📦 NUEVA RUTA: Registrar despacho / venta desde el Admin Panel rebajando stock
router.post('/rebajar-stock-local', productoController.rebajarStockLocal);

// 🔍 Esta ruta dinámica va SIEMPRE al final
router.get('/:id', productoController.obtenerProductoPorId);

module.exports = router;