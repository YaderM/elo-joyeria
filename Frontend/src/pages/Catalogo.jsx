import React, { useState, useEffect } from 'react';
// 🌟 ADICIÓN: Importamos Link para permitir la navegación hacia la pantalla de detalle
import { Link } from 'react-router-dom';
import axios from 'axios';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 📡 Petición HTTP limpia sin enlaces duplicados del portapapeles
    axios.get('https://elo-joyeria-backend.vercel.app/api/productos')
      .then(response => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al conectar con el backend:", error);
        setCargando(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#b59410', fontSize: '2rem', fontWeight: '300', letterSpacing: '1px', margin: 0 }}>
          Nuestro Catálogo Exclusivo
        </h2>
        <hr style={{ border: '0', height: '1px', background: '#eaeaea', width: '100px', margin: '15px auto' }} />
      </header>

      {/* Contenedor de la grilla fijo desde el inicio para evitar saltos visuales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '30px',
        minHeight: '400px' /* Mantiene el espacio reservado */
      }}>
        
        {cargando ? (
          // Ocupa toda la fila horizontal mientras carga de forma ordenada
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '40px' }}>
            Cargando catálogo exclusivo...
          </p>
        ) : (
          productos.map((producto) => {
            // Validamos dinámicamente si el producto cuenta con descuento activo
            const tieneOferta = producto.precio_oferta !== null && producto.precio_oferta > 0;

            return (
              <div key={producto.id_producto} style={{
                background: '#fff',
                borderRadius: '8px',
                border: '1px solid #eee',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '420px', /* Altura fija para que todas las tarjetas sean idénticas */
                boxSizing: 'border-box',
                animation: 'fadeIn 0.5s ease-in-out' /* Entrada suave */
              }}>
                {/* Contenedor de la imagen con tamaño estricto y posición relativa para el listón */}
                <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '4px', background: '#f9f9f9', marginBottom: '15px', position: 'relative' }}>
                  <img 
                    src={producto.imagen_url || 'https://via.placeholder.com/300'} 
                    alt={producto.nombre} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* 🏷️ ADICIÓN: Listón rojo de Oferta posicionado elegantemente sobre la foto */}
                  {tieneOferta && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: '#d32f2f',
                      color: '#fff',
                      padding: '4px 9px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      borderRadius: '3px',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}>
                      OFERTA
                    </div>
                  )}
                </div>
                
                {/* Info del Producto */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '400', margin: '0 0 8px 0', color: '#222' }}>
                    {producto.nombre}
                  </h3>
                  <p style={{ color: '#777', fontSize: '0.88rem', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: '1.3' }}>
                    {producto.descripcion}
                  </p>
                </div>
                
                {/* Bloque de precio condicional para ofertas */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '5px 0 10px 0', minHeight: '44px' }}>
                  {tieneOferta ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#a0a0a0', fontSize: '0.85rem', fontWeight: '400' }}>
                        ₡{Number(producto.precio).toLocaleString('es-CR')}
                      </span>
                      <span style={{ color: '#d32f2f', fontWeight: '700', fontSize: '1.2rem', marginTop: '1px' }}>
                        ₡{Number(producto.precio_oferta).toLocaleString('es-CR')}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#b59410', fontWeight: '600', fontSize: '1.15rem' }}>
                      ₡{Number(producto.precio).toLocaleString('es-CR')}
                    </span>
                  )}
                </div>
                
                {/* 🔗 ADICIÓN: Enlace dinámico limpio rodeando el botón de acción */}
                <Link to={`/producto/${producto.id_producto}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#222',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    width: '100%',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    marginTop: 'auto'
                  }}>
                    VER DETALLES
                  </button>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Estilo rápido para la animación de entrada suave */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Catalogo;