import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Tienda() {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados para los productos del backend
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los filtros activos en pantalla
  const [materialFiltro, setMaterialFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [precioMaximo, setPrecioMaximo] = useState(200000);

  // 🌟 HOMOLOGADOS: Coinciden exactamente con la Base de Datos (MySQL)
  const materialesDisponibles = ['Acero', 'Pandora', 'Plata', 'Oro', 'Piercings'];
  const tiposDisponibles = ['Anillos', 'Argollas', 'Aretes', 'Cadenas', 'Collares', 'Huggies', 'Dijes', 'Pulseras', 'Tobilleras', 'Conjuntos'];

  // 🔄 Capturar cambios en la URL (cuando se hace clic en el Mega Menú o Filtros)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mat = params.get('material') || '';
    const tp = params.get('tipo') || '';
    
    setMaterialFiltro(mat);
    setTipoFiltro(tp);
    
    cargarProductos(mat, tp);
  }, [location.search]);

  // 📡 Llamar a la API de Node.js con filtros (URL limpia de producción)
  const cargarProductos = (material, tipo) => {
    setCargando(true);
    let url = 'https://elo-joyeria-backend.vercel.app/api/productos';
    
    const queryParams = [];
    if (material) queryParams.push(`material=${material}`);
    if (tipo) queryParams.push(`tipo=${tipo}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    axios.get(url)
      .then(response => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al filtrar productos:", error);
        setCargando(false);
      });
  };

  // ⚡ Aplicar filtros laterales e ir actualizando la URL
  const manejarFiltroLateral = (nuevoMaterial, nuevoTipo) => {
    let ruta = '/tienda';
    const queryParams = [];
    if (nuevoMaterial) queryParams.push(`material=${nuevoMaterial}`);
    if (nuevoTipo) queryParams.push(`tipo=${nuevoTipo}`);
    
    if (queryParams.length > 0) ruta += `?${queryParams.join('&')}`;
    navigate(ruta);
  };

  // 🔄 MODIFICACIÓN EN FILTRADO: Evaluar el precio real de venta (sea oferta o precio base)
  const productosFiltradosPorPrecio = productos.filter(p => {
    const precioEfectivo = (p.precio_oferta !== null && p.precio_oferta > 0) ? Number(p.precio_oferta) : Number(p.precio);
    return precioEfectivo <= precioMaximo;
  });

  return (
    <div style={{ display: 'flex', maxWidth: '1300px', margin: '0 auto', padding: '40px 20px', gap: '40px' }}>
      
      {/* 🛠️ PANEL LATERAL DE FILTROS */}
      <aside style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #eee', paddingRight: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '25px', color: '#222' }}>
          FILTRAR POR
        </h3>

        {/* Filtro: Material */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={estiloTituloFiltro}>Material</h4>
          {materialesDisponibles.map((mat) => (
            <div key={mat} style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  name="material" 
                  checked={materialFiltro === mat}
                  onChange={() => manejarFiltroLateral(mat, tipoFiltro)}
                />
                {mat}
              </label>
            </div>
          ))}
        </div>

        {/* Filtro: Tipo de Producto */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={estiloTituloFiltro}>Tipo de producto</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {tiposDisponibles.map((tipo) => (
              <div key={tipo} style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="radio" 
                    name="tipo" 
                    checked={tipoFiltro === tipo}
                    onChange={() => manejarFiltroLateral(materialFiltro, tipo)}
                  />
                  {tipo}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro: Precio Dinámico */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={estiloTituloFiltro}>Precio máximo</h4>
          <input 
            type="range" 
            min="0" 
            max="200000" 
            step="5000"
            value={precioMaximo} 
            onChange={(e) => setPrecioMaximo(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#b59410' }}
          />
          <p style={{ fontSize: '0.95rem', color: '#b59410', fontWeight: '500', marginTop: '10px' }}>
            Hasta: ₡{precioMaximo.toLocaleString('es-CR')}
          </p>
        </div>

        <button 
          onClick={() => { setPrecioMaximo(200000); navigate('/tienda'); }}
          style={{ width: '100%', background: '#eee', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Limpiar Filtros
        </button>
      </aside>

      {/* 🛍️ SECCIÓN DERECHA: GRILLA DE PRODUCTOS */}
      <section style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <p style={{ color: '#777', fontSize: '0.9rem' }}>
            {productosFiltradosPorPrecio.length} artículos encontrados
          </p>
        </div>

        {cargando ? (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '40px' }}>Cargando tienda...</p>
        ) : productosFiltradosPorPrecio.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>No hay productos disponibles con los filtros seleccionados.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px' }}>
            {productosFiltradosPorPrecio.map((producto) => {
              const tieneOferta = producto.precio_oferta !== null && producto.precio_oferta > 0;

              return (
                <div key={producto.id_producto} style={stiloTarjeta}>
                  
                  {/* Contenedor de la foto */}
                  <div style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: '4px', background: '#f9f9f9', marginBottom: '15px', position: 'relative' }}>
                    <img 
                      src={producto.imagen_url || 'https://via.placeholder.com/300'} 
                      alt={producto.nombre} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    
                    {/* Badge de oferta */}
                    {tieneOferta && (
                      <div style={estiloEtiquetaOfertaTienda}>
                        OFERTA
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: '400', margin: '0 0 5px 0', color: '#222' }}>
                    {producto.nombre}
                  </h3>

                  {/* Renderizado inteligente de precios según oferta */}
                  <div style={{ margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center', height: '42px' }}>
                    {tieneOferta ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem' }}>
                          ₡{Number(producto.precio).toLocaleString('es-CR')}
                        </span>
                        <strong style={{ color: '#c62828', fontWeight: '700', fontSize: '1.15rem' }}>
                          ₡{Number(producto.precio_oferta).toLocaleString('es-CR')}
                        </strong>
                      </>
                    ) : (
                      <strong style={{ color: '#b59410', fontWeight: '600', fontSize: '1.1rem' }}>
                        ₡{Number(producto.precio).toLocaleString('es-CR')}
                      </strong>
                    )}
                  </div>
                  
                  {/* Enlace dinámico limpio rodeando el botón */}
                  <Link to={`/producto/${producto.id_producto}`} style={{ textDecoration: 'none' }}>
                    <button style={estiloBotonCard}>VER DETALLES</button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const estiloTituloFiltro = { fontSize: '0.95rem', fontWeight: '500', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' };

const stiloTarjeta = { background: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '400px' };
const estiloBotonCard = { background: '#222', color: '#fff', border: 'none', padding: '10px', width: '100%', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px' };

const estiloEtiquetaOfertaTienda = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  backgroundColor: '#c62828',
  color: '#fff',
  padding: '4px 9px',
  fontSize: '0.7rem',
  fontWeight: '700',
  borderRadius: '3px',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
};

export default Tienda;