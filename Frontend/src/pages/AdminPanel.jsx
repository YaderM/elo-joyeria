import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// Componentes modulares
import AdminDashboard from '../components/AdminDashboard';
import GestionInventario from '../components/GestionInventario';
import GestionCategorias from '../components/GestionCategorias';
import GestionPromociones from '../components/GestionPromociones'; 
import GestionPedidos from '../components/GestionPedidos';
import ReporteManager from '../components/ReporteManager';

// Configuración base para mantener el estilo de marca en todos los alerts
const swalStyled = Swal.mixin({
  confirmButtonColor: '#b59410',
  cancelButtonColor: '#333',
});

// Configuración de cierre de sesión automático por inactividad
const TIEMPO_INACTIVIDAD_MS = 15 * 60 * 1000; // 15 minutos sin actividad
const TIEMPO_AVISO_ANTES_MS = 60 * 1000; // avisa 1 minuto antes de cerrar la sesión

function AdminPanel() {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('inventario');
  
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Refs para el sistema de cierre de sesión por inactividad (no necesitan re-render)
  const timerAvisoRef = useRef(null);
  const timerCierreRef = useRef(null);
  const avisoMostradoRef = useRef(false);

  const API_URL = 'https://elo-joyeria-backend.vercel.app/api';

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const [productos, setProductos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [seccionActivaReporte, setSeccionActivaReporte] = useState('dashboard');
  const [datosReporte, setDatosReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Datos de ventas exclusivos para el Dashboard General (independientes de datosReporte,
  // que se usa solo dentro de la pestaña de Reportes/PDF)
  const [ventasDashboard, setVentasDashboard] = useState([]);
  const [cargandoDashboard, setCargandoDashboard] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', precio: '', imagen_url: '', stock: '1', material_id: '', tipo_id: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    } else {
      cargarProductos();
      cargarAuxiliares();
      cargarVentasDashboard();
    }
  }, [navigate]);

  // --- Cierre de sesión automático por inactividad ---
  const cerrarSesionPorInactividad = () => {
    clearTimeout(timerAvisoRef.current);
    clearTimeout(timerCierreRef.current);
    localStorage.removeItem('adminToken');
    Swal.fire({
      title: 'Sesión cerrada por inactividad',
      text: `Por seguridad, se cerró tu sesión luego de ${TIEMPO_INACTIVIDAD_MS / 60000} minutos sin actividad.`,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#b59410',
    });
    navigate('/');
  };

  const reiniciarTemporizadores = () => {
    avisoMostradoRef.current = false;
    clearTimeout(timerAvisoRef.current);
    clearTimeout(timerCierreRef.current);
    timerAvisoRef.current = setTimeout(mostrarAvisoInactividad, TIEMPO_INACTIVIDAD_MS - TIEMPO_AVISO_ANTES_MS);
    timerCierreRef.current = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
  };

  const mostrarAvisoInactividad = () => {
    avisoMostradoRef.current = true;
    Swal.fire({
      title: '¿Seguís ahí?',
      text: 'Tu sesión se va a cerrar en 1 minuto por inactividad.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Seguir conectado',
      cancelButtonText: 'Cerrar sesión ahora',
      confirmButtonColor: '#b59410',
      cancelButtonColor: '#333',
      timer: TIEMPO_AVISO_ANTES_MS,
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        reiniciarTemporizadores();
      } else {
        cerrarSesionPorInactividad();
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return; // sin sesión activa, no hay nada que temporizar

    const eventosDeActividad = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const manejarActividad = () => {
      // Mientras el aviso de "¿Seguís ahí?" está en pantalla, no reiniciamos el temporizador
      // solo por mover el mouse; el usuario tiene que responder explícitamente al aviso.
      if (!avisoMostradoRef.current) {
        reiniciarTemporizadores();
      }
    };

    eventosDeActividad.forEach((evento) => window.addEventListener(evento, manejarActividad));
    reiniciarTemporizadores(); // arranca el conteo apenas se monta el panel

    return () => {
      eventosDeActividad.forEach((evento) => window.removeEventListener(evento, manejarActividad));
      clearTimeout(timerAvisoRef.current);
      clearTimeout(timerCierreRef.current);
    };
  }, []);

  useEffect(() => {
    if (seccionActivaReporte === 'inventario' && productos.length > 0) {
      setDatosReporte(productos);
    }
  }, [productos, seccionActivaReporte]);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await axios.get(`${API_URL}/productos`, getConfig());
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error al traer productos:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setCargando(false);
    }
  };

  const cargarAuxiliares = async () => {
    try {
      const resMateriales = await axios.get(`${API_URL}/productos/aux/materiales`, getConfig());
      const resTipos = await axios.get(`${API_URL}/productos/aux/tipos`, getConfig());
      setMateriales(resMateriales.data);
      setTipos(resTipos.data);
    } catch (error) {
      console.error("Error al cargar datos auxiliares:", error);
    }
  };

  const cargarVentasDashboard = async () => {
    try {
      setCargandoDashboard(true);
      // NOTA: reusamos el endpoint de ventas por rango con una ventana amplia
      // porque es el único endpoint de ventas confirmado hasta ahora.
      // Si existe (o se crea) un endpoint tipo GET /api/ventas que devuelva
      // todo el historial sin filtrar por fecha, conviene reemplazar esta
      // llamada por esa ruta (más liviana para el backend).
      const hoyISO = new Date().toISOString().split('T')[0];
      const respuesta = await axios.get(`${API_URL}/ventas/ventas_pendientes`, {
        params: { desde: '2000-01-01', hasta: hoyISO },
        ...getConfig()
      });
      setVentasDashboard(respuesta.data);
    } catch (error) {
      console.error("Error al cargar ventas del dashboard:", error);
      setVentasDashboard([]);
    } finally {
      setCargandoDashboard(false);
    }
  };

  const manejarCambioTipoReporte = async (tipo) => {
    setSeccionActivaReporte(tipo);
    if (tipo === 'inventario' || tipo === 'productos') {
      setDatosReporte(productos);
    } else {
      setDatosReporte([]);
    }
  };

  const procesarFiltroFechasVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      swalStyled.fire({
        title: 'Faltan fechas',
        text: 'Por favor selecciona ambas fechas.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
      });
      return;
    }
    try {
      const respuesta = await axios.get(`${API_URL}/ventas/ventas_pendientes`, {
        params: { desde: fechaInicio, hasta: fechaFin },
        ...getConfig()
      });
      setDatosReporte(respuesta.data);
      setSeccionActivaReporte('rango');
    } catch (error) {
      console.error("Error al filtrar ventas:", error);
      setDatosReporte([]);
      swalStyled.fire({
        title: 'Error',
        text: 'Error al obtener los datos de la base de datos.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id_producto);
    setFormProducto({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio || '',
      imagen_url: producto.imagen_url || '',
      stock: producto.stock !== undefined ? producto.stock : '1',
      material_id: producto.material_id || producto.id_material || '',
      tipo_id: producto.tipo_id || producto.id_tipo || ''
    });
    setMostrarModal(true);
  };

  const iniciarCreacion = () => {
    setEditandoId(null);
    setFormProducto({ nombre: '', descripcion: '', precio: '', imagen_url: '', stock: '1', material_id: '', tipo_id: '' });
    setMostrarModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const datosAEnviar = {
        ...formProducto,
        precio: parseFloat(formProducto.precio),
        stock: parseInt(formProducto.stock, 10),
        material_id: parseInt(formProducto.material_id, 10) || null,
        tipo_id: parseInt(formProducto.tipo_id, 10) || null
      };

      if (editandoId) {
        await axios.put(`${API_URL}/productos/${editandoId}`, datosAEnviar, getConfig());
        swalStyled.fire({
          title: '¡Joya actualizada con éxito!',
          icon: 'success',
          confirmButtonText: 'Listo',
        });
      } else {
        await axios.post(`${API_URL}/productos`, datosAEnviar, getConfig());
        swalStyled.fire({
          title: '¡Producto agregado con éxito!',
          icon: 'success',
          confirmButtonText: 'Listo',
        });
      }
      setMostrarModal(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      swalStyled.fire({
        title: 'Error',
        text: 'Hubo un error al guardar el producto.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  const manejarEliminar = async (id, nombre) => {
    const result = await swalStyled.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/productos/${id}`, getConfig());
        swalStyled.fire({
          title: 'Producto eliminado.',
          icon: 'success',
          confirmButtonText: 'Listo',
        });
        cargarProductos();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const limpiarCacheYSalir = async () => {
    const result = await swalStyled.fire({
      title: '¿Borrar caché y cerrar sesión?',
      text: 'Esto va a limpiar los datos guardados de la sesión del admin en este navegador y vas a tener que iniciar sesión de nuevo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar todo',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    // Limpiamos puntualmente lo del admin, no todo localStorage,
    // para no afectar otros datos que el sitio pueda guardar en el mismo dominio
    // (por ejemplo, un carrito de compras de un cliente en el mismo navegador).
    localStorage.removeItem('adminToken');
    sessionStorage.clear();

    // Si el navegador tiene Cache API activa (service workers, PWA, assets cacheados), la limpiamos también
    if ('caches' in window) {
      try {
        const nombresCache = await caches.keys();
        await Promise.all(nombresCache.map((nombre) => caches.delete(nombre)));
      } catch (error) {
        console.error('No se pudo limpiar el Cache API:', error);
      }
    }

    await swalStyled.fire({
      title: 'Caché borrado',
      text: 'Vas a ser redirigido al login.',
      icon: 'success',
      confirmButtonText: 'Listo',
    });

    navigate('/');
  };

  return (
    <>
      <style>{`
        .btn-cerrar-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-main-container {
            flex-direction: column !important;
          }
          .admin-sidebar {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
            background-color: #1a1a1a !important;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .desktop-brand {
            display: none !important;
          }
          .admin-sidebar-content {
            display: none !important;
          }
          .admin-sidebar-content.open {
            display: flex !important;
            flex-direction: column;
            justify-content: flex-start;
            background-color: #1a1a1a;
            position: relative !important;
            width: 100%;
            z-index: 10;
            padding-bottom: 20px;
            box-shadow: none !important;
          }
          .admin-content-area {
            padding: 15px !important;
            width: 100% !important;
          }
          .admin-header-seccion {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px;
            margin-top: 25px !important;
          }
          .reporte-filtros-fechas {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .modal-formulario-filas {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .btn-cerrar-desktop {
            display: none !important;
          }
          .btn-cerrar-mobile {
            display: block !important;
            background-color: #333;
            color: #ec5b5b;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.8rem;
          }
        }
      `}</style>
      <div className="admin-main-container" style={{ display: 'flex', minHeight: '90vh', backgroundColor: '#f4f6f8', margin: 0, position: 'relative' }}>
        
        <aside className="admin-sidebar" style={estiloSidebar}>
          <div className="admin-mobile-header" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1a1a1a', width: '100%', boxSizing: 'border-box' }}>
            <div>
              <h3 style={{ color: '#d4af37', fontSize: '1.1rem', fontWeight: '400', letterSpacing: '1.5px', margin: '0' }}>ELO CONTROL</h3>
              <p style={{ color: '#888', fontSize: '0.7rem', margin: 0, textTransform: 'uppercase' }}>Administrador</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => { localStorage.removeItem('adminToken'); navigate('/'); }} 
                className="btn-cerrar-mobile"
              >
                🚪 Salir
              </button>
              <button onClick={() => setMenuAbierto(!menuAbierto)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.8rem', cursor: 'pointer', padding: '0 5px' }}>
                {menuAbierto ? '✕' : '☰'}
              </button>
            </div>
          </div>

          <div className={`admin-sidebar-content ${menuAbierto ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={estiloBrand} className="desktop-brand">
                <h3 style={{ color: '#d4af37', fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1.5px', margin: '0 0 5px 0' }}>ELO CONTROL</h3>
                <p style={{ color: '#888', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Administrador</p>
              </div>
              <nav style={{ marginTop: '10px' }}>
                <button onClick={() => { setSeccionActiva('dashboard'); setMenuAbierto(false); }} style={seccionActiva === 'dashboard' ? estiloBotonActivo : estiloBotonSidebar}>📊 Dashboard General</button>
                <button onClick={() => { setSeccionActiva('inventario'); setMenuAbierto(false); }} style={seccionActiva === 'inventario' ? estiloBotonActivo : estiloBotonSidebar}>📦 Gestión de Inventario</button>
                <button onClick={() => { setSeccionActiva('categorias'); setMenuAbierto(false); }} style={seccionActiva === 'categorias' ? estiloBotonActivo : estiloBotonSidebar}>🗂️ Categorías y Tipos</button>
                <button onClick={() => { setSeccionActiva('promociones'); setMenuAbierto(false); }} style={seccionActiva === 'promociones' ? estiloBotonActivo : estiloBotonSidebar}>🏷️ Precios y Ofertas</button>
                <button onClick={() => { setSeccionActiva('pedidos'); setMenuAbierto(false); }} style={seccionActiva === 'pedidos' ? estiloBotonActivo : estiloBotonSidebar}>🛒 Gestión de Pedidos</button>
                <button onClick={() => { setSeccionActiva('reportes'); setMenuAbierto(false); }} style={seccionActiva === 'reportes' ? estiloBotonActivo : estiloBotonSidebar}>📊 Reportes PDF</button>
              </nav>
            </div>
            <div style={{ padding: '20px 20px 0 20px' }} className="btn-cerrar-desktop">
              <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/'); }} style={estiloBotonCerrar}>🚪 Cerrar Sesión</button>
              <button onClick={limpiarCacheYSalir} style={{ ...estiloBotonCerrar, marginTop: '10px', backgroundColor: '#2a2a2a', color: '#d4af37' }}>🧹 Borrar Caché y Salir</button>
            </div>
          </div>
        </aside>

        <main className="admin-content-area" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', minWidth: 0, boxSizing: 'border-box' }}>
          <div className="admin-header-seccion" style={estiloHeaderSeccion}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '400', color: '#222', textTransform: 'uppercase', margin: 0 }}>
              {seccionActiva === 'dashboard' && '📊 Dashboard General'}
              {seccionActiva === 'inventario' && '📦 Panel de Control de Inventario'}
              {seccionActiva === 'categorias' && '🗂️ Configuración de Materiales y Tipos'}
              {seccionActiva === 'promociones' && '🏷️ Campañas, Precios Especiales y Ofertas'}
              {seccionActiva === 'pedidos' && '🛒 Gestión de Pedidos'}
              {seccionActiva === 'reportes' && '📊 Generador de Reportes Analíticos'}
            </h2>
            <span style={estiloBadge}>🟢 Conexión Segura MySQL</span>
          </div>

          <div style={estiloContenedorBlanco}>
            {seccionActiva === 'dashboard' && (
              <AdminDashboard 
                datosReporte={ventasDashboard}
                productosInventario={productos}
                cargando={cargandoDashboard}
                onRefrescar={cargarVentasDashboard}
                onCambiarSeccion={(seccion) => setSeccionActiva(seccion)}
              />
            )}
            {seccionActiva === 'inventario' && (
              cargando ? <p style={{ textAlign: 'center', color: '#777' }}>Consultando base de datos...</p> :
              <GestionInventario 
                productos={productos} materiales={materiales} tipos={tipos}
                cargarProductos={cargarProductos} iniciarEdicion={iniciarEdicion}
                iniciarCreacion={iniciarCreacion} manejarEliminar={manejarEliminar}
              />
            )}
            {seccionActiva === 'categorias' && <GestionCategorias materiales={materiales} tipos={tipos} cargarAuxiliares={cargarAuxiliares} />}
            {seccionActiva === 'promociones' && <GestionPromociones productos={productos} cargarProductos={cargarProductos} />}
            {seccionActiva === 'pedidos' && <GestionPedidos onPedidoConfirmado={() => cargarProductos()} />}
            {seccionActiva === 'reportes' && (
              <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                  <button onClick={() => manejarCambioTipoReporte('inventario')} style={seccionActivaReporte === 'inventario' ? estiloBotonFiltroActivo : estiloBotonFiltro}>📋 Inventario</button>
                  <button onClick={() => manejarCambioTipoReporte('productos')} style={seccionActivaReporte === 'productos' ? estiloBotonFiltroActivo : estiloBotonFiltro}>🛍️ Reporte Productos</button>
                  <button onClick={() => setSeccionActivaReporte('rango')} style={seccionActivaReporte === 'rango' ? estiloBotonFiltroActivo : estiloBotonFiltro}>🗓️ Rango de Fechas</button>
                </div>
                {seccionActivaReporte === 'rango' && (
                  <div className="reporte-filtros-fechas" style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '15px 20px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '30px' }}>
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={estiloInputFecha} />
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={estiloInputFecha} />
                    <button onClick={procesarFiltroFechasVentas} style={{ padding: '10px 20px', backgroundColor: '#222', color: '#fff', borderRadius: '4px', cursor: 'pointer', border: 'none' }}>🔍 Consultar</button>
                  </div>
                )}
                <ReporteManager 
                  seccionActivaReporte={seccionActivaReporte} datosReporte={datosReporte}
                  estiloBotonDescargaPRO={estiloBotonDescargaPRO} estiloCeldaTh={estiloCeldaTh} estiloCeldaTd={estiloCeldaTd}
                />
              </div>
            )}
          </div>
        </main>

        {mostrarModal && (
          <div style={estiloOverlayModal}>
            <div style={estiloCuerpoModal}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#d4af37' }}>✨ {editandoId ? 'EDITAR JOYA' : 'REGISTRAR NUEVA JOYA'}</h3>
                <button onClick={() => setMostrarModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-formulario-filas" style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Nombre de la Joya</label>
                    <input type="text" value={formProducto.nombre} onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})} style={estiloInputForm} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Precio (CRC)</label>
                    <input type="number" value={formProducto.precio} onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})} style={estiloInputForm} required />
                  </div>
                </div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>URL de la Imagen</label>
                <input type="text" value={formProducto.imagen_url} onChange={(e) => setFormProducto({...formProducto, imagen_url: e.target.value})} style={estiloInputForm} />
                <div className="modal-formulario-filas" style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Material</label>
                    <select value={formProducto.material_id} onChange={(e) => setFormProducto({...formProducto, material_id: e.target.value})} style={estiloInputForm}>
                      <option value="">-- Seleccione --</option>
                      {materiales.map(m => <option key={m.id_material} value={m.id_material}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Tipo de Joya</label>
                    <select value={formProducto.tipo_id} onChange={(e) => setFormProducto({...formProducto, tipo_id: e.target.value})} style={estiloInputForm}>
                      <option value="">-- Seleccione --</option>
                      {tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 0.5 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Stock</label>
                    <input type="number" value={formProducto.stock} onChange={(e) => setFormProducto({...formProducto, stock: e.target.value})} style={estiloInputForm} />
                  </div>
                </div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem' }}>Descripción</label>
                <textarea value={formProducto.descripcion} onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})} style={{...estiloInputForm, height: '80px'}}></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" style={{ padding: '10px 30px', background: '#b59410', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Estilos Constantes
const estiloSidebar = { width: '260px', backgroundColor: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 0', boxSizing: 'border-box' };
const estiloBrand = { padding: '0 25px 25px 25px', borderBottom: '1px solid #333', textAlign: 'center' };
const estiloBotonSidebar = { width: '100%', textAlign: 'left', padding: '14px 25px', background: 'none', border: 'none', color: '#aaa', fontSize: '0.95rem', cursor: 'pointer', display: 'block' };
const estiloBotonActivo = { ...estiloBotonSidebar, color: '#fff', backgroundColor: '#b59410', borderLeft: '4px solid #fff', fontWeight: '500' };
const estiloBotonCerrar = { width: '100%', backgroundColor: '#333', color: '#ec5b5b', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const estiloHeaderSeccion = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' };
const estiloBadge = { fontSize: '0.9rem', color: '#666', backgroundColor: '#fff', padding: '6px 15px', borderRadius: '20px', border: '1px solid #ddd' };
const estiloContenedorBlanco = { backgroundColor: '#fff', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e6e6e6' };
const estiloOverlayModal = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const estiloCuerpoModal = { backgroundColor: '#fff', width: '90%', maxWidth: '600px', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' };
const estiloInputForm = { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.95rem' };
const estiloBotonFiltro = { padding: '10px 20px', border: '1px solid #ccc', background: '#fff', color: '#555', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500' };
const estiloBotonFiltroActivo = { ...estiloBotonFiltro, background: '#222', color: '#fff', borderColor: '#222' };
const estiloInputFecha = { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', color: '#333' };
const estiloBotonDescargaPRO = { width: '100%', background: '#222', color: '#fff', border: 'none', padding: '14px', fontSize: '0.95rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' };
const estiloCeldaTh = { padding: '12px 15px', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' };
const estiloCeldaTd = { padding: '12px 15px', color: '#333' };

export default AdminPanel;