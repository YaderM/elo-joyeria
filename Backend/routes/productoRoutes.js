const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const ventaController = require('../controllers/ventaController'); // 👈 Importamos el nuevo controlador

// 🛒 RUTAS PÚBLICAS
router.get('/', productoController.obtenerProductos);
router.get('/categorias-home', productoController.obtenerCategoriasHome);

// 🗂️ RUTAS DE AUXILIARES
router.get('/aux/materiales', productoController.obtenerMaterialesForm);
router.get('/aux/tipos', productoController.obtenerTiposForm);

// 📈 RUTAS DE VENTAS (NUEVO FLUJO PROFESIONAL)
// Esta ruta reemplaza a las antiguas 'registrar-venta-completa' y 'rebajar-stock-local'
router.post('/procesar-venta', ventaController.procesarVenta); 
router.get('/reporte-ventas', productoController.obtenerReporteVentas);

// 🔐 RUTAS ADMINISTRATIVAS
router.post('/', productoController.crearProducto);
router.put('/:id', productoController.actualizarProducto);
router.delete('/:id', productoController.eliminarProducto);
router.post('/aux/materiales', productoController.crearMaterial);
router.put('/:id/oferta', productoController.actualizarOferta);

// 🔍 RUTA DINÁMICA (SIEMPRE AL FINAL)
router.get('/:id', productoController.obtenerProductoPorId);

module.exports = router;