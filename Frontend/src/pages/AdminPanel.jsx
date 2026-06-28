import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 🌟 ADICIONES: Herramienta de descarga y ambos moldes de PDF independientes
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReporteProductosPDF from '../components/ReporteProductosPDF'; // Mantiene tu inventario intacto
import ReporteVentasPDF from '../components/ReporteVentasPDF';       // Estructura financiera modular

// Componentes modulares
import GestionInventario from '../components/GestionInventario';
import GestionCategorias from '../components/GestionCategorias';
import GestionPromociones from '../components/GestionPromociones'; 

function AdminPanel() {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('inventario');
  
  // 📦 Estados Globales de Datos
  const [productos, setProductos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 📊 Estados del Módulo Profesional de Reportes Analíticos
  const [seccionActivaReporte, setSeccionActivaReporte] = useState('inventario');
  const [datosReporte, setDatosReporte] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // 🔮 Estados para el Modal de Producto Único
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formProducto, setFormProducto] = useState({
    nombre: '', descripcion: '', precio: '', imagen_url: '', stock: '1', material_id: '', tipo_id: ''
  });

  // 🛒 NUEVOS ESTADOS: Para el manejo del Formulario de Rebajo Local
  const [idProductoSeleccionado, setIdProductoSeleccionado] = useState('');
  const [cantidadRebajo, setCantidadRebajo] = useState(1);
  const [procesandoRebajo, setProcesandoRebajo] = useState(false);
  const [msgExitoRebajo, setMsgExitoRebajo] = useState('');
  const [msgErrorRebajo, setMsgErrorRebajo] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
    } else {
      cargarProductos();
      cargarAuxiliares();
    }
  }, [navigate]);

  // Sincroniza datos iniciales del inventario para la pestaña de reportes
  useEffect(() => {
    if (productos.length > 0 && datosReporte.length === 0 && seccionActivaReporte === 'inventario') {
      setDatosReporte(productos);
    }
  }, [productos, datosReporte, seccionActivaReporte]);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await axios.get('https://elo-joyeria-backend.vercel.app/api/productos');
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error al traer productos:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarAuxiliares = async () => {
    try {
      const resMateriales = await axios.get('https://elo-joyeria-backend.vercel.app/api/productos/aux/materiales');
      const resTipos = await axios.get('https://elo-joyeria-backend.vercel.app/api/productos/aux/tipos');
      setMateriales(resMateriales.data);
      setTipos(resTipos.data);
    } catch (error) {
      console.error("Error al cargar datos auxiliares:", error);
    }
  };

  // Lógica de carga asíncrona para Reportes de Ventas
  const manejarCambioTipoReporte = async (tipo) => {
    setSeccionActivaReporte(tipo);
    if (tipo === 'inventario') {
      setDatosReporte(productos);
    } else if (tipo === 'dia') {
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        const respuesta = await axios.get(`https://elo-joyeria-backend.vercel.app/api/ventas?fecha=${hoy}`);
        setDatosReporte(respuesta.data);
      } catch (error) {
        console.error("Error al obtener ventas diarias:", error);
        setDatosReporte([]); 
      }
    }
  };

  const procesarFiltroFechasVentas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas para efectuar el filtro analítico.');
      return;
    }
    try {
      const respuesta = await axios.get(`https://elo-joyeria-backend.vercel.app/api/ventas?desde=${fechaInicio}&hasta=${fechaFin}`);
      setDatosReporte(respuesta.data);
    } catch (error) {
      console.error("Error al filtrar rango de ventas:", error);
      setDatosReporte([]);
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
        material_id: parseInt(formProducto.material_id, 10),
        tipo_id: parseInt(formProducto.tipo_id, 10)
      };

      if (editandoId) {
        await axios.put(`https://elo-joyeria-backend.vercel.app/api/productos/${editandoId}`, datosAEnviar);
        alert('¡Joya actualizada con éxito!');
      } else {
        await axios.post('https://elo-joyeria-backend.vercel.app/api/productos', datosAEnviar);
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
        await axios.delete(`https://elo-joyeria-backend.vercel.app/api/productos/${id}`);
        alert('Producto eliminado.');
        cargarProductos();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 📥 NUEVA LÓGICA: Ejecutar el descuento de inventario consumiendo tu controlador 11
  const manejarRebajoInventario = async (e) => {
    e.preventDefault();
    setMsgExitoRebajo('');
    setMsgErrorRebajo('');

    if (!idProductoSeleccionado) {
      setMsgErrorRebajo("Por favor, seleccioná una joya de la lista.");
      return;
    }

    const producto = productos.find(p => p.id_producto === parseInt(idProductoSeleccionado, 10));
    if (!producto) return;

    if (cantidadRebajo > producto.stock) {
      setMsgErrorRebajo(`¡Acción denegada! No podés rebajar más unidades de las disponibles. Stock actual: ${producto.stock} pz.`);
      return;
    }

    setProcesandoRebajo(true);
    try {
      const respuesta = await axios.post('https://elo-joyeria-backend.vercel.app/api/productos/rebajar-stock-local', {
        id_producto: idProductoSeleccionado,
        cantidadVendida: cantidadRebajo
      });

      if (respuesta.data.success) {
        setMsgExitoRebajo(`📊 ¡Stock actualizado con éxito para: ${producto.nombre}!`);
        setIdProductoSeleccionado('');
        setCantidadRebajo(1);
        await cargarProductos(); // Sincroniza el inventario global inmediatamente
      }
    } catch (error) {
      const msgErr = error.response?.data?.error || "No se pudo conectar con el servidor local.";
      setMsgErrorRebajo("Error: " + msgErr);
    } finally {
      setProcesandoRebajo(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', backgroundColor: '#f4f6f8', margin: 0 }}>
      {/* SIDEBAR */}
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
            {/* 🛒 NUEVO BOTÓN EN MENU LATERAL */}
            <button onClick={() => setSeccionActiva('registrar_venta')} style={seccionActiva === 'registrar_venta' ? estiloBotonActivo : estiloBotonSidebar}>🛒 Registrar Venta</button>
            <button onClick={() => setSeccionActiva('reportes')} style={seccionActiva === 'reportes' ? estiloBotonActivo : estiloBotonSidebar}>📊 Reportes PDF</button>
          </nav>
        </div>
        <div style={{ padding: '0 20px' }}>
          <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }} style={estiloBotonCerrar}>🚪 Cerrar Sesión</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={estiloHeaderSeccion}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '400', color: '#222', textTransform: 'uppercase' }}>
            {seccionActiva === 'inventario' && '📦 Panel de Control de Inventario'}
            {seccionActiva === 'categorias' && '🗂️ Configuración de Materiales y Tipos'}
            {seccionActiva === 'promociones' && '🏷️ Campañas, Precios Especiales y Ofertas'}
            {seccionActiva === 'registrar_venta' && '🛒 Registrar Despacho Manual de Inventario'}
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

          {seccionActiva === 'categorias' && (
            <GestionCategorias materiales={materiales} tipos={tipos} cargarAuxiliares={cargarAuxiliares} />
          )}

          {seccionActiva === 'promociones' && (
            <GestionPromociones productos={productos} cargarProductos={cargarProductos} />
          )}

          {/* 🛒 NUEVA INTERFAZ: Formulario incrustado directamente para evitar archivos sueltos */}
          {seccionActiva === 'registrar_venta' && (
            <div style={{ maxWidth: '600px', margin: '10px auto', padding: '10px' }}>
              <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '25px' }}>
                Utilizá este formulario oficial para descontar stock de piezas vendidas directamente por WhatsApp, redes sociales o transferencias manuales (Sin pasar por pasarela).
              </p>

              {msgExitoRebajo && <div style={{ padding: '12px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{msgExitoRebajo}</div>}
              {msgErrorRebajo && <div style={{ padding: '12px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{msgErrorRebajo}</div>}

              <form onSubmit={manejarRebajoInventario}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={estiloLabel}>SELECCIONAR JOYA VENDIDA</label>
                  <select 
                    value={idProductoSeleccionado} 
                    onChange={(e) => setIdProductoSeleccionado(e.target.value)}
                    style={{ ...estiloInputForm, padding: '12px', backgroundColor: '#fafafa', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Seleccioná el producto del catálogo --</option>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre} (Stock actual: {p.stock} uds) — ₡{Number(p.precio).toLocaleString('es-CR')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={estiloLabel}>CANTIDAD A REBAJAR</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={cantidadRebajo} 
                    onChange={(e) => setCantidadRebajo(parseInt(e.target.value, 10) || 1)}
                    style={{ ...estiloInputForm, padding: '12px', fontSize: '0.9rem' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={procesandoRebajo}
                  style={estiloBotonDescargaPRO}
                >
                  {procesandoRebajo ? 'ACTUALIZANDO WORKBENCH...' : '💾 DESCONTAR DEL INVENTARIO LOCAL'}
                </button>
              </form>
            </div>
          )}

          {/* 📊 SECCIÓN DE REPORTES: VISTA PREVIA EN TABLA + DESCARGA DINÁMICA */}
          {seccionActiva === 'reportes' && (
            <div style={{ padding: '10px' }}>
              <p style={{ color: '#555', marginTop: 0, marginBottom: '25px', fontSize: '0.95rem' }}>
                Selecciona un módulo analítico para visualizar la información en tiempo real. Si los datos son correctos, genera el reporte oficial en PDF.
              </p>

              {/* Botones de Selección de Reporte */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button 
                  onClick={() => manejarCambioTipoReporte('inventario')}
                  style={seccionActivaReporte === 'inventario' ? estiloBotonFiltroActivo : estiloBotonFiltro}
                >
                  📋 Inventario y Stock
                </button>
                <button 
                  onClick={() => manejarCambioTipoReporte('dia')}
                  style={seccionActivaReporte === 'dia' ? estiloBotonFiltroActivo : estiloBotonFiltro}
                >
                  📈 Ventas de Hoy
                </button>
                <button 
                  onClick={() => setSeccionActivaReporte('rango')}
                  style={seccionActivaReporte === 'rango' ? estiloBotonFiltroActivo : estiloBotonFiltro}
                >
                  🗓️ Ventas por Rango de Fechas
                </button>
              </div>

              {/* Panel de Fechas Condicional si se elige Rango */}
              {seccionActivaReporte === 'rango' && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '15px 20px', borderRadius: '6px', border: '1px solid #eee', marginBottom: '30px', maxWidth: '600px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>DESDE</label>
                    <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={estiloInputFecha} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#555', marginBottom: '5px' }}>HASTA</label>
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={estiloInputFecha} />
                  </div>
                  <button onClick={procesarFiltroFechasVentas} style={{ padding: '10px 20px', border: 'none', backgroundColor: '#222', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '18px', fontWeight: '500' }}>
                    🔍 Consultar Ventas
                  </button>
                </div>
              )}

              {/* 🖥️ VISTA PREVIA EN TABLA (INTERFAZ EN PANTALLA) */}
              <div style={{ marginBottom: '30px', overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
                {datosReporte && datosReporte.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                        {seccionActivaReporte === 'inventario' ? (
                          <>
                            <th style={estiloCeldaTh}>ID</th>
                            <th style={estiloCeldaTh}>Nombre de la Joya</th>
                            <th style={estiloCeldaTh}>Precio Base</th>
                            <th style={{ ...estiloCeldaTh, textAlign: 'center' }}>Stock</th>
                          </>
                        ) : (
                          <>
                            <th style={estiloCeldaTh}>Factura / Ref</th>
                            <th style={estiloCeldaTh}>Joya Vendida</th>
                            <th style={{ ...estiloCeldaTh, textAlign: 'center' }}>Cantidad</th>
                            <th style={{ ...estiloCeldaTh, textAlign: 'right' }}>Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {datosReporte.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                          {seccionActivaReporte === 'inventario' ? (
                            <>
                              <td style={estiloCeldaTd}>#{item.id_producto}</td>
                              <td style={{ ...estiloCeldaTd, fontWeight: '500' }}>{item.nombre}</td>
                              <td style={estiloCeldaTd}>₡{Number(item.precio).toLocaleString('es-CR')}</td>
                              <td style={{ ...estiloCeldaTd, textAlign: 'center' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: item.stock > 0 ? '#e8f5e9' : '#ffebee', color: item.stock > 0 ? '#2e7d32' : '#c62828', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                  {item.stock} uds
                                </span>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={estiloCeldaTd}>#{item.id_venta || index + 1}</td>
                              <td style={{ ...estiloCeldaTd, fontWeight: '500' }}>{item.nombre_producto || 'Joya Personalizada'}</td>
                              <td style={{ ...estiloCeldaTd, textAlign: 'center' }}>{item.cantidad} u.</td>
                              <td style={{ ...estiloCeldaTd, textAlign: 'right', fontWeight: 'bold', color: '#b59410' }}>₡{Number(item.total).toLocaleString('es-CR')}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#777', fontStyle: 'italic' }}>
                    No hay registros cargados para mostrar en la tabla. Selecciona otra opción o rango de fechas.
                  </div>
                )}
              </div>

              {/* 📥 SECCIÓN COMPILADORA DE REPORTE PDF (SOLO SI HAY DATOS) */}
              {datosReporte && datosReporte.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px dashed #b59410' }}>
                  {seccionActivaReporte === 'inventario' ? (
                    <PDFDownloadLink
                      document={<ReporteProductosPDF productos={datosReporte} />}
                      fileName={`Inventario_Elo_${new Date().toISOString().slice(0,10)}.pdf`}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading }) => (
                        <button disabled={loading} style={estiloBotonDescargaPRO}>
                          {loading ? '⏳ COMPILANDO PDF...' : '💾 EXPORTAR ESTA TABLA A PDF'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <PDFDownloadLink
                      document={
                        <ReporteVentasPDF 
                          data={datosReporte} 
                          rangoFecha={seccionActivaReporte === 'dia' ? 'Hoy' : `${fechaInicio} al ${fechaFin}`} 
                        />
                      }
                      fileName={`Ventas_${seccionActivaReporte}_Elo_${new Date().toISOString().slice(0,10)}.pdf`}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading }) => (
                        <button disabled={loading} style={estiloBotonDescargaPRO}>
                          {loading ? '⏳ COMPILANDO BALANCE...' : '💾 EXPORTAR ESTAS VENTAS A PDF'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL GLOBAL PARA PRODUCTOS */}
      {mostrarModal && (
        <div style={estiloOverlayModal}>
          <div style={estiloCuerpoModal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontWeight: '400' }}>{editandoId ? '✏️ EDITAR DETALLES DE JOYERÍA' : '✨ REGISTRAR NUEVA JOYA'}</h3>
              <button onClick={() => setMostrarModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>
            <form onSubmit={guardarProducto}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={estiloLabel}>Nombre de la Joya</label>
                  <input type="text" required value={formProducto.nombre} onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})} style={estiloInputForm} />
                </div>
                <div>
                  <label style={estiloLabel}>Precio (CRC)</label>
                  <input type="number" required value={formProducto.precio} onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})} style={estiloInputForm} />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={estiloLabel}>URL de la Imagen</label>
                <input type="text" value={formProducto.imagen_url} onChange={(e) => setFormProducto({...formProducto, imagen_url: e.target.value})} style={estiloInputForm} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={estiloLabel}>Material</label>
                  <select required value={formProducto.material_id} onChange={(e) => setFormProducto({...formProducto, material_id: e.target.value})} style={estiloInputForm}>
                    <option value="">-- Seleccione --</option>
                    {materiales.map(mat => <option key={mat.id_material} value={mat.id_material}>{mat.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={estiloLabel}>Tipo de Joya</label>
                  <select required value={formProducto.tipo_id} onChange={(e) => setFormProducto({...formProducto, tipo_id: e.target.value})} style={estiloInputForm}>
                    <option value="">-- Seleccione --</option>
                    {tipos.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={estiloLabel}>Stock</label>
                  <input type="number" required min="0" value={formProducto.stock} onChange={(e) => setFormProducto({...formProducto, stock: e.target.value})} style={estiloInputForm} />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={estiloLabel}>Descripción</label>
                <textarea rows="3" value={formProducto.descripcion} onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})} style={{ ...estiloInputForm, resize: 'none' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: '10px 15px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#b59410', color: '#fff', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos de Maquetación e Interfaces de Filtro
const estiloSidebar = { width: '260px', backgroundColor: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 0' };
const estiloBrand = { padding: '0 25px 25px 25px', borderBottom: '1px solid #333', textAlign: 'center' };
const estiloBotonSidebar = { width: '100%', textAlign: 'left', padding: '14px 25px', background: 'none', border: 'none', color: '#aaa', fontSize: '0.95rem', cursor: 'pointer', display: 'block' };
const estiloBotonActivo = { ...estiloBotonSidebar, color: '#fff', backgroundColor: '#b59410', borderLeft: '4px solid #fff', fontWeight: '500' };
const estiloBotonCerrar = { width: '100%', backgroundColor: '#333', color: '#ec5b5b', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const estiloHeaderSeccion = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px' };
const estiloBadge = { fontSize: '0.9rem', color: '#666', backgroundColor: '#fff', padding: '6px 15px', borderRadius: '20px', border: '1px solid #ddd' };
const estiloContenedorBlanco = { backgroundColor: '#fff', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', border: '1px solid #e6e6e6' };
const estiloOverlayModal = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const estiloCuerpoModal = { backgroundColor: '#fff', width: '100%', maxWidth: '650px', padding: '30px', borderRadius: '8px' };
const estiloLabel = { display: 'block', fontSize: '0.8rem', color: '#555', fontWeight: '600', marginBottom: '6px' };
const estiloInputForm = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' };

// Nuevos Estilos del Centro Analítico
const estiloBotonFiltro = { padding: '10px 20px', border: '1px solid #ccc', background: '#fff', color: '#555', borderRadius: '4px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500', transition: 'all 0.2s' };
const estiloBotonFiltroActivo = { ...estiloBotonFiltro, background: '#222', color: '#fff', borderColor: '#222' };
const estiloInputFecha = { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', color: '#333' };
const estiloBotonDescargaPRO = { width: '100%', background: '#222', color: '#fff', border: 'none', padding: '14px', fontSize: '0.9rem', letterSpacing: '1px', fontWeight: '600', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' };

// 🎨 Estilos Adicionales para Tablas Interactivas en Pantalla
const estiloCeldaTh = { padding: '12px 15px', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const estiloCeldaTd = { padding: '12px 15px', color: '#333' };

export default AdminPanel;