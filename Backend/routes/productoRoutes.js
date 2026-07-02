const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// 🛒 RUTAS PÚBLICAS
router.get('/', productoController.obtenerProductos);
router.get('/categorias-home', productoController.obtenerCategoriasHome);

// 🗂️ RUTAS DE AUXILIARES
router.get('/aux/materiales', productoController.obtenerMaterialesForm);
router.get('/aux/tipos', productoController.obtenerTiposForm);

// 📈 RUTAS DE VENTAS Y REPORTES (Deben ir ANTES de las rutas con :id)
router.get('/reporte-ventas', productoController.obtenerReporteVentas);
router.post('/registrar-venta-completa', productoController.registrarVentaCompleta);
router.post('/rebajar-stock-local', productoController.rebajarStockLocal);

// 🔐 RUTAS ADMINISTRATIVAS
router.post('/', productoController.crearProducto);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);
router.post('/aux/materiales', productoController.crearMaterial);
router.patch('/:id/oferta', productoController.actualizarOferta);

// 🔍 RUTA DINÁMICA (SIEMPRE AL FINAL)
router.get('/:id', productoController.obtenerProductoPorId);

module.exports = router;