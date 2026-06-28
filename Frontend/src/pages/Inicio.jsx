import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// ✅ Importación directa desde la misma carpeta 'pages'
import Contacto from './Contacto'; 

function Inicio() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productosOferta, setProductosOferta] = useState([]);
  
  // ✅ NUEVOS ESTADOS PARA LA BÚSQUEDA PROFESIONAL
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // 1. Cargar Categorías (Limpia de caracteres extraños de formato)
    axios.get('https://elo-joyeria-backend.vercel.app/api/productos/categorias-home')
      .then(response => {
        setCategorias(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al cargar las categorías del Home:", error);
        setCargando(false);
      });

    // 2. Traer productos generales y filtrar ofertas
    axios.get('https://elo-joyeria-backend.vercel.app/api/productos')
      .then(response => {
        // Guardamos todos los productos para la barra de búsqueda nativa
        setTodosLosProductos(response.data);

        // Mantenemos intacta tu lógica original de ofertas
        const enOferta = response.data.filter(prod => prod.precio_oferta !== null && prod.precio_oferta > 0);
        setProductosOferta(enOferta);
      })
      .catch(error => {
        console.error("Error al cargar productos para el Inicio:", error);
      });
  }, []);

  // ✅ LÓGICA DE FILTRADO EN TIEMPO REAL
  const productosFiltrados = todosLosProductos.filter((prod) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return false; // Si no hay búsqueda, no activa la grilla de resultados
    return (
      (prod.nombre && prod.nombre.toLowerCase().includes(termino)) ||
      (prod.categoria && prod.categoria.toLowerCase().includes(termino))
    );
  });

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      
      {/* 1. SECCIÓN HERO / BANNER PRINCIPAL */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1a1a1a',
        padding: '140px 20px',
        textAlign: 'center',
        color: '#fff',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ color: '#b59410', letterSpacing: '3px', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>Colecciones Exclusivas</span>
          <h2 style={{ color: '#d4af37', fontSize: '3.5rem', fontWeight: '300', letterSpacing: '3px', marginBottom: '25px', marginTop: '0' }}>
            Bienvenidos a Elo Joyería
          </h2>
          <p style={{ color: '#e0e0e0', fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '45px', fontWeight: '300' }}>
            Descubre piezas uniques diseñadas para capturar tus momentos más especiales. 
            Desde la finura de la plata hasta el brillo del acero, 
            ofrecemos exclusividad y elegancia inspirada en alta joyería.
          </p>
          <Link to="/tienda" style={estiloBotonHero}>
            Explorar Catálogo
          </Link>
        </div>
      </section>

      {/* ✅ SECCIÓN: BARRA DE BÚSQUEDA INTEGRADA */}
      <section style={{ backgroundColor: '#111', padding: '40px 20px', borderBottom: '2px solid #b59410' }}>
        <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <label htmlFor="buscador-inicio" style={{ color: '#d4af37', display: 'block', marginBottom: '12px', fontSize: '0.95rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '400' }}>
            ¿Buscas una pieza en especial?
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '20px', fontSize: '1.2rem' }}>🔍</span>
            <input
              id="buscador-inicio"
              type="text"
              placeholder="Escribe aquí... (ej. anillo, cadena, plata, oro)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={estiloInputBuscador}
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')} 
                style={estiloBotonLimpiarBuscador}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ✅ CONTROL DE VISTA DINÁMICA */}
      {busqueda.trim() !== '' ? (
        <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '60px 20px' }}>
          <h3 style={estiloH3Seccion}>Resultados de la búsqueda</h3>
          <p style={estiloSubtituloSeccion}>Mostrando piezas que coinciden con "{busqueda}"</p>
          
          {productosFiltrados.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
              {productosFiltrados.map((prod) => (
                <Link key={prod.id_producto} to={`/producto/${prod.id_producto}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={estiloTarjetaCategoria}>
                    <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={prod.imagen_url || 'https://via.placeholder.com/300x300'} 
                        alt={prod.nombre} 
                        style={estiloImagen}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {prod.precio_oferta !== null && prod.precio_oferta > 0 && (
                        <div style={estiloEtiquetaOferta}>¡OFERTA!</div>
                      )}
                    </div>
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <h4 style={{ color: '#222', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                        {prod.nombre}
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', margin: '15px 0' }}>
                        {prod.precio_oferta !== null && prod.precio_oferta > 0 ? (
                          <>
                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                              Antes: ₡{Number(prod.precio).toLocaleString('es-CR')}
                            </span>
                            <strong style={{ color: '#c62828', fontSize: '1.25rem', fontWeight: '700' }}>
                              Oferta: ₡{Number(prod.precio_oferta).toLocaleString('es-CR')}
                            </strong>
                          </>
                        ) : (
                          <strong style={{ color: '#222', fontSize: '1.25rem', fontWeight: '600' }}>
                            ₡{Number(prod.precio).toLocaleString('es-CR')}
                          </strong>
                        )}
                      </div>
                      <button style={estiloBotonVerDetalles}>VER DETALLES</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '15px' }}>💎❓</span>
              <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: '300' }}>
                No encontramos ninguna joya que coincida con "<strong>{busqueda}</strong>".
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '5px' }}>Intenta buscando otro término como 'anillo', 'plata' o 'cadena'.</p>
            </div>
          )}
        </section>
      ) : (
        /* 📦 ESTRUCTURA ORIGINAL EN CASO DE NO ESTAR BUSCANDO */
        <>
          {/* 2. BARRA DE VALOR / ICONOS DE CONFIANZA */}
          <section style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '30px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', textAlign: 'center' }}>
              <div style={estiloItemValor}>
                <span style={{ fontSize: '1.8rem', marginBottom: '10px' }}>📦</span>
                <h5 style={estiloTituloValor}>Envíos a toda CR</h5>
                <p style={estiloTextoValor}>Gratis en compras mayores a ₡45,000</p>
              </div>
              <div style={estiloItemValor}>
                <span style={{ fontSize: '1.8rem', marginBottom: '10px' }}>✨</span>
                <h5 style={estiloTituloValor}>Calidad Garantizada</h5>
                <p style={estiloTextoValor}>Piezas seleccionadas en Acero y Plata 925</p>
              </div>
              <div style={estiloItemValor}>
                <span style={{ fontSize: '1.8rem', marginBottom: '10px' }}>💬</span>
                <h5 style={estiloTituloValor}>Asesoría Personalizada</h5>
                <p style={estiloTextoValor}>Atención directa y segura por WhatsApp</p>
              </div>
            </div>
          </section>

          {/* 3. DIVISOR DE LUJO */}
          <div style={{ textAlign: 'center', padding: '60px 0 20px 0' }}>
            <span style={{ fontSize: '2rem', color: '#b59410', letterSpacing: '5px' }}>✨💎✨</span>
          </div>

          {/* 4. SECCIÓN DE CATEGORÍAS VISUALES */}
          <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
            <h3 style={estiloH3Seccion}>Explorar por Categoría</h3>
            <p style={estiloSubtituloSeccion}>Selecciona tu estilo favorito y descubre diseños exclusivos</p>
            
            {cargando ? (
              <p style={{ color: '#999', textAlign: 'center', marginTop: '40px', fontSize: '1.1rem' }}>Cargando colecciones...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '35px' }}>
                {categorias.map((cat) => (
                  <Link key={cat.id_categoria} to={cat.ruta_filtro} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={estiloTarjetaCategoria} className="tarjeta-categoria">
                      <div style={{ height: '360px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          src={cat.imagen_url || 'https://via.placeholder.com/400x500'} 
                          alt={cat.nombre} 
                          style={estiloImagen}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                        <div style={estiloBadge}>VER PIEZAS</div>
                      </div>
                      <div style={{ padding: '25px 20px', textAlign: 'center' }}>
                        <h4 style={{ color: '#222', margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '400', letterSpacing: '0.5px' }}>
                          {cat.nombre}
                        </h4>
                        <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', margin: '0', fontWeight: '300', height: '65px', overflow: 'hidden' }}>
                          {cat.descripcion}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 5. SECCIÓN: OFERTAS IMPRESIONANTES */}
          {productosOferta.length > 0 && (
            <section style={{ backgroundColor: '#fff', padding: '80px 20px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                <h3 style={{ ...estiloH3Seccion, color: '#c62828' }}>🏷️ Ofertas por Tiempo Limitado</h3>
                <p style={estiloSubtituloSeccion}>Aprovecha nuestros descuentos especiales en piezas seleccionadas</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
                  {productosOferta.map((prod) => (
                    <Link key={prod.id_producto} to={`/producto/${prod.id_producto}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ ...estiloTarjetaCategoria, backgroundColor: '#fafafa' }}>
                        <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                          <img 
                            src={prod.imagen_url || 'https://via.placeholder.com/300x300'} 
                            alt={prod.nombre} 
                            style={estiloImagen}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                          <div style={estiloEtiquetaOferta}>¡OFERTA!</div>
                        </div>
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                          <h4 style={{ color: '#222', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                            {prod.nombre}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', margin: '15px 0' }}>
                            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                              Antes: ₡{Number(prod.precio).toLocaleString('es-CR')}
                            </span>
                            <strong style={{ color: '#c62828', fontSize: '1.25rem', fontWeight: '700' }}>
                              Oferta: ₡{Number(prod.precio_oferta).toLocaleString('es-CR')}
                            </strong>
                          </div>
                          <button style={estiloBotonVerDetalles}>VER DETALLES</button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 6. BANNER INSPIRACIONAL DE MARCA */}
          <section style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))',
            backgroundColor: '#b59410',
            padding: '80px 20px',
            textAlign: 'center',
            color: '#fff',
            marginTop: '20px'
          }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '300', letterSpacing: '2px', marginBottom: '15px' }}>BRILLEMOS JUNTOS</h3>
              <p style={{ fontSize: '1rem', fontWeight: '300', lineHeight: '1.6', marginBottom: '30px', color: '#eaeaea' }}>
                Cada joya de nuestra colección pasa por un estricto control de calidad para asegurar que recibas un brillo duradero y un acabado perfecto. Redefine tu estilo diario con Joyería Elo.
              </p>
              <Link to="/tienda" style={{ ...estiloBotonHero, backgroundColor: '#fff', color: '#222', boxShadow: 'none' }}>
                Ver Nueva Colección
              </Link>
            </div>
          </section>
        </>
      )}

    </div>
  );
}

// 🎨 OBJETOS DE ESTILOS
const estiloInputBuscador = {
  width: '100%',
  padding: '14px 50px 14px 50px',
  borderRadius: '30px',
  border: '1px solid #b59410',
  backgroundColor: '#1f1f1f',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '300',
  letterSpacing: '0.5px',
  outline: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease'
};

const estiloBotonLimpiarBuscador = {
  position: 'absolute',
  right: '20px',
  background: 'none',
  border: 'none',
  color: '#999',
  fontSize: '1rem',
  cursor: 'pointer',
  padding: '5px',
  transition: 'color 0.2s ease'
};

const estiloBotonHero = {
  backgroundColor: '#b59410',
  color: '#fff',
  padding: '14px 40px',
  fontSize: '1rem',
  textDecoration: 'none',
  borderRadius: '4px',
  letterSpacing: '1px',
  fontWeight: '500',
  display: 'inline-block',
  boxShadow: '0 4px 15px rgba(181,148,16,0.3)',
  transition: 'all 0.3s ease'
};

const estiloTarjetaCategoria = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
  transition: 'transform 0.3s ease, boxShadow 0.3s ease',
  cursor: 'pointer',
  border: '1px solid #f0f0f0'
};

const estiloImagen = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.5s ease'
};

const estiloBadge = {
  position: 'absolute',
  bottom: '15px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#222',
  padding: '8px 20px',
  fontSize: '0.75rem',
  fontWeight: '600',
  letterSpacing: '1px',
  borderRadius: '20px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
};

const estiloEtiquetaOferta = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  backgroundColor: '#c62828',
  color: '#fff',
  padding: '5px 12px',
  fontSize: '0.75rem',
  fontWeight: '700',
  borderRadius: '4px',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 8px rgba(198,40,40,0.3)'
};

const estiloBotonVerDetalles = {
  width: '100%',
  backgroundColor: '#222',
  color: '#fff',
  border: 'none',
  padding: '10px',
  borderRadius: '4px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.8rem',
  letterSpacing: '1px'
};

const estiloH3Seccion = {
  textAlign: 'center', 
  color: '#222', 
  fontSize: '2rem', 
  fontWeight: '300', 
  marginBottom: '15px', 
  letterSpacing: '2px', 
  textTransform: 'uppercase'
};

const estiloSubtituloSeccion = {
  textAlign: 'center', 
  color: '#777', 
  fontSize: '1rem', 
  marginBottom: '50px', 
  fontWeight: '300'
};

const estiloItemValor = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '10px'
};

// ✅ Nombre corregido de estiloTurloValor a estiloTituloValor
const estiloTituloValor = {
  margin: '5px 0',
  fontSize: '1rem',
  fontWeight: '500',
  color: '#222'
};

const estiloTextoValor = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#777',
  fontWeight: '300'
};

export default Inicio;