import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Componentes modulares
import GestionInventario from '../components/GestionInventario';
import GestionCategorias from '../components/GestionCategorias';
import GestionPromociones from '../components/GestionPromociones'; 
import GestionPedidos from '../components/GestionPedidos';
import ReporteManager from '../components/ReporteManager'; 

function AdminPanel() {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('inventario');
  
  const API_URL = 'https://elo-joyeria-backend.vercel.app/api';
  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const [productos, setProductos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [seccionActivaReporte, setSeccionActivaReporte] = useState('inventario');
  const [datosReporte, setDatosReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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
    }
  }, [navigate]);

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

  const manejarCambioTipoReporte = async (tipo) => {
    setSeccionActivaReporte(tipo);
    if (tipo === 'inventario' || tipo === 'productos') {
      setDatosReporte(productos);
    } else if (tipo === 'dia') {
      try {
        const hoy = new Date().toISOString().split('T')[0];
        const respuesta = await axios.get(`${API_URL}/ventas/ventas_pendientes`, {
            ...getConfig(),
            params: { desde: hoy, hasta: hoy }
        });
        setDatosReporte(respuesta.data);
      } catch (error) {
        console.error("Error al obtener ventas de hoy:", error);
        setDatosReporte([]);
      }
    } else {
      setDatosReporte([]);
    }
  };

  const procesarFiltroFechasVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas.');
      return;
    }
    try {
      const respuesta = await axios.get(`${API_URL}/ventas/ventas_pendientes`, {
          ...getConfig(),
          params: { desde: fechaInicio, hasta: fechaFin }
      });
      setDatosReporte(respuesta.data);
      setSeccionActivaReporte('rango');
    } catch (error) {
      console.error("Error al filtrar ventas:", error);
      setDatosReporte([]);
      alert('Error al obtener los datos de la base de datos.');
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
        alert('¡Joya actualizada con éxito!');
      } else {
        await axios.post(`${API_URL}/productos`, datosAEnviar, getConfig());
        alert('¡Producto agregado con éxito!');
      }
      setMostrarModal(false);
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert('Hubo un error al guardar el producto.');
    }
  };

  const manejarEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      try {
        await axios.delete(`${API_URL}/productos/${id}`, getConfig());
        alert('Producto eliminado.');
        cargarProductos();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', backgroundColor: '#f4f6f8', margin: 0 }}>
      <aside style={estiloSidebar}>
        <div>
          <div style={estiloBrand}>
            <h3 style={{ color: '#d4af37', fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1.5px', margin: '0 0 5px 0' }}>ELO CONTROL</h3>
            <p style={{ color: '#888', fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Administrador</p>
          </div>
          <nav style={{ marginTop: '30px' }}>
            <button onClick={() => setSeccionActiva('inventario')} style={seccionActiva === 'inventario' ? estiloBotonActivo : estiloBotonSidebar}>📦 Gestión de Inventario</button>
            <button onClick={() => setSeccionActiva('categorias')} style={seccionActiva === 'categorias' ? estiloBotonActivo : estiloBotonSidebar}>🗂️ Categorías y Tipos</button>
            <button onClick={() => setSeccionActiva('promociones')} style={seccionActiva === 'promociones' ? estiloBotonActivo : estiloBotonSidebar}>🏷️ Precios y Ofertas</button>
            <button onClick={() => setSeccionActiva('pedidos')} style={seccionActiva === 'pedidos' ? estiloBotonActivo : estiloBotonSidebar}>🛒 Gestión de Pedidos</button>
            <button onClick={() => setSeccionActiva('reportes')} style={seccionActiva === 'reportes' ? estiloBotonActivo : estiloBotonSidebar}>📊 Reportes PDF</button>
          </nav>
        </div>
        <div style={{ padding: '0 20px' }}>
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }} style={estiloBotonCerrar}>🚪 Cerrar Sesión</button>
        </div>
      </aside>

      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={estiloHeaderSeccion}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '400', color: '#222', textTransform: 'uppercase' }}>
            {seccionActiva === 'inventario' && '📦 Panel de Control de Inventario'}
            {seccionActiva === 'categorias' && '🗂️ Configuración de Materiales y Tipos'}
            {seccionActiva === 'promociones' && '🏷️ Campañas, Precios Especiales y Ofertas'}
            {seccionActiva === 'pedidos' && '🛒 Gestión de Pedidos'}
            {seccionActiva === 'reportes' && '📊 Generador de Reportes Analíticos'}
          </h2>
          <span style={estiloBadge}>🟢 Conexión Segura MySQL</span>
        </div>

        <div style={estiloContenedorBlanco}>
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
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button onClick={() => manejarCambioTipoReporte('inventario')} style={seccionActivaReporte === 'inventario' ? estiloBotonFiltroActivo : estiloBotonFiltro}>📋 Inventario</button>
                <button onClick={() => manejarCambioTipoReporte('productos')} style={seccionActivaReporte === 'productos' ? estiloBotonFiltroActivo : estiloBotonFiltro}>🛍️ Reporte Productos</button>
                <button onClick={() => manejarCambioTipoReporte('dia')} style={seccionActivaReporte === 'dia' ? estiloBotonFiltroActivo : estiloBotonFiltro}>📈 Ventas de Hoy</button>
                <button onClick={() => setSeccionActivaReporte('rango')} style={seccionActivaReporte === 'rango' ? estiloBotonFiltroActivo : estiloBotonFiltro}>🗓️ Rango de Fechas</button>
              </div>
              {seccionActivaReporte === 'rango' && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '15px 20px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '30px' }}>
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={estiloInputFecha} />
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={estiloInputFecha} />
                  <button onClick={procesarFiltroFechasVentas} style={{ padding: '10px 20px', backgroundColor: '#222', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>🔍 Consultar</button>
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', textAlign: 'center' }}>{editandoId ? '✏️ Editar Producto' : '✨ Nuevo Producto'}</h3>
            <form onSubmit={guardarProducto}>
              <input type="text" placeholder="Nombre" value={formProducto.nombre} onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})} style={estiloInputForm} required />
              <input type="text" placeholder="URL Imagen" value={formProducto.imagen_url} onChange={(e) => setFormProducto({...formProducto, imagen_url: e.target.value})} style={estiloInputForm} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="Precio" value={formProducto.precio} onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})} style={estiloInputForm} required />
                <input type="number" placeholder="Stock" value={formProducto.stock} onChange={(e) => setFormProducto({...formProducto, stock: e.target.value})} style={estiloInputForm} />
              </div>
              <textarea placeholder="Descripción" value={formProducto.descripcion} onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})} style={{...estiloInputForm, height: '70px'}}></textarea>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={formProducto.material_id} onChange={(e) => setFormProducto({...formProducto, material_id: e.target.value})} style={estiloInputForm}>
                  <option value="">Material</option>
                  {materiales.map(m => <option key={m.id_material} value={m.id_material}>{m.nombre}</option>)}
                </select>
                <select value={formProducto.tipo_id} onChange={(e) => setFormProducto({...formProducto, tipo_id: e.target.value})} style={estiloInputForm}>
                  <option value="">Tipo</option>
                  {tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                </select>
              </div>
              <button type="submit" style={estiloBotonDescargaPRO}>Guardar Cambios</button>
              <button type="button" onClick={() => setMostrarModal(false)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px', marginTop: '5px', cursor: 'pointer', color: '#888', fontSize: '0.9rem' }}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const estiloSidebar = { width: '260px', backgroundColor: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 0' };
const estiloBrand = { padding: '0 25px 25px 25px', borderBottom: '1px solid #333', textAlign: 'center' };
const estiloBotonSidebar = { width: '100%', textAlign: 'left', padding: '14px 25px', background: 'none', border: 'none', color: '#aaa', fontSize: '0.95rem', cursor: 'pointer', display: 'block' };
const estiloBotonActivo = { ...estiloBotonSidebar, color: '#fff', backgroundColor: '#b59410', borderLeft: '4px solid #fff', fontWeight: '500' };
const estiloBotonCerrar = { width: '100%', backgroundColor: '#333', color: '#ec5b5b', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const estiloHeaderSeccion = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' };
const estiloBadge = { fontSize: '0.9rem', color: '#666', backgroundColor: '#fff', padding: '6px 15px', borderRadius: '20px', border: '1px solid #ddd' };
const estiloContenedorBlanco = { backgroundColor: '#fff', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e6e6e6' };
const estiloOverlayModal = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const estiloCuerpoModal = { backgroundColor: '#fff', width: '90%', maxWidth: '450px', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' };
const estiloInputForm = { width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', fontSize: '0.95rem' };
const estiloBotonFiltro = { padding: '10px 20px', border: '1px solid #ccc', background: '#fff', color: '#555', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500' };
const estiloBotonFiltroActivo = { ...estiloBotonFiltro, background: '#222', color: '#fff', borderColor: '#222' };
const estiloInputFecha = { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', color: '#333' };
const estiloBotonDescargaPRO = { width: '100%', background: '#222', color: '#fff', border: 'none', padding: '14px', fontSize: '0.95rem', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' };
const estiloCeldaTh = { padding: '12px 15px', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase' };
const estiloCeldaTd = { padding: '12px 15px', color: '#333' };

export default AdminPanel;