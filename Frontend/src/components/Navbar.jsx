import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // 👈 Importación del contexto

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const { cart } = useCart(); // 👈 Acceso al estado del carrito

  // Calculamos la cantidad total de productos
  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const esCliente = localStorage.getItem('usuarioRol') === 'cliente';

  const seccionesTienda = [
    {
      titulo: 'Acero',
      items: ['Anillos', 'Argollas', 'Aretes', 'Cadenas', 'Collares', 'Huggies', 'Dijes', 'Conjuntos', 'Pulseras', 'Rosarios', 'Tobilleras']
    },
    {
      titulo: 'Pandora',
      items: ['Anillos', 'Aretes', 'Cadenas de Seguridad', 'Charms', 'Pulseras', 'Cadenas']
    },
    {
      titulo: 'Plata',
      items: ['Anillos', 'Aretes', 'Cadenas', 'Dijes', 'Pulseras']
    },
    {
      titulo: 'Piercings',
      items: ['Piercings']
    }
  ];

  const manejarCerrarSesion = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminNombre');
    localStorage.removeItem('usuarioRol');
    navigate('/login');
  };

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{
        backgroundColor: '#222',
        color: '#fff',
        textAlign: 'center',
        padding: '6px 10px',
        fontSize: '0.8rem',
        letterSpacing: '1px'
      }}>
        Envíos gratis a todo el país por compras mayores a ₡45,000 ✨
      </div>

      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #eaeaea',
        padding: '15px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        <Link to="/" style={{ textDecoration: 'none', marginBottom: '15px' }}>
          <h1 style={{ color: '#b59410', fontSize: '2.4rem', fontWeight: '300', margin: 0, letterSpacing: '4px' }}>
            ELO JOYERÍA
          </h1>
        </Link>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }} className="enlaces-container-elo">
          <Link to="/" style={estiloLink}>INICIO</Link>
          
          <div 
            onMouseEnter={() => setMenuAbierto(true)}
            onMouseLeave={() => setMenuAbierto(false)}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuAbierto(!menuAbierto); }} 
            style={{ position: 'relative', paddingBottom: '5px', cursor: 'pointer' }}
          >
            <span style={{ ...estiloLink, display: 'flex', alignItems: 'center', gap: '5px' }}>
              TIENDA <span style={{ fontSize: '0.7rem' }}>▼</span>
            </span>

            {menuAbierto && (
              <div className="mega-menu-desplegable-elo" style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.08)',
                border: '1px solid #eee',
                padding: '30px',
                display: 'grid',
                gridTemplateColumns: `repeat(${seccionesTienda.length}, 180px)`,
                gap: '20px',
                borderRadius: '4px',
                animation: 'fadeInMenu 0.2s ease-out'
              }}>
                {seccionesTienda.map((seccion, idx) => (
                  <div key={idx} className="seccion-columna-elo">
                    <h4 style={{ 
                      color: '#b59410', 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      borderBottom: '1px solid #f5f5f5', 
                      paddingBottom: '8px',
                      marginBottom: '10px',
                      letterSpacing: '1px'
                    }}>
                      {seccion.titulo}
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {seccionesTienda[idx].items.map((item, itemIdx) => (
                        <li key={itemIdx} style={{ marginBottom: '8px' }}>
                          <Link 
                            to={`/tienda?material=${seccion.titulo}&tipo=${item}`}
                            style={{ 
                              textDecoration: 'none', 
                              color: '#666', 
                              fontSize: '0.85rem',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#b59410'}
                            onMouseLeave={(e) => e.target.style.color = '#666'}
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/nosotros" style={estiloLink}>NOSOTROS</Link>
          <Link to="/contacto" style={estiloLink}>CONTACTO</Link>

          {/* Icono del Carrito */}
          <Link to="/checkout" style={{ ...estiloLink, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-10px', background: '#b59410', 
                color: '#fff', fontSize: '0.65rem', borderRadius: '50%', width: '16px', 
                height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {esCliente && (
            <button 
              onClick={manejarCerrarSesion} 
              style={estiloBotonCerrarSesion}
              onMouseEnter={(e) => e.target.style.color = '#b59410'}
              onMouseLeave={(e) => e.target.style.color = '#222'}
            >
              CERRAR SESIÓN
            </button>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeInMenu {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (max-width: 768px) {
          nav { padding: 12px 15px !important; }
          nav h1 { font-size: 1.8rem !important; letter-spacing: 2px !important; }
          .enlaces-container-elo { gap: 15px !important; flex-wrap: wrap !important; justify-content: center !important; }
          .mega-menu-desplegable-elo { position: fixed !important; top: 140px !important; left: 50% !important; transform: translateX(-50%) !important; width: 90vw !important; max-width: 320px !important; grid-template-columns: 1fr !important; max-height: 50vh !important; overflow-y: auto !important; padding: 20px !important; box-shadow: 0px 8px 25px rgba(0,0,0,0.15) !important; z-index: 99999 !important; }
          .seccion-columna-elo { width: 100% !important; text-align: left !important; }
          .seccion-columna-elo h4 { text-align: left !important; margin-top: 5px !important; margin-bottom: 8px !important; border-bottom: 1px solid #f0f0f0 !important; }
          .seccion-columna-elo ul { text-align: left !important; padding-left: 5px !important; }
          .seccion-columna-elo li { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}

const estiloLink = {
  textDecoration: 'none',
  color: '#222',
  fontSize: '0.9rem',
  fontWeight: '500',
  letterSpacing: '1.5px',
  transition: 'color 0.2s'
};

const estiloBotonCerrarSesion = {
  background: 'transparent',
  border: 'none',
  color: '#222',
  fontSize: '0.9rem',
  fontWeight: '500',
  letterSpacing: '1.5px',
  cursor: 'pointer',
  padding: 0,
  margin: 0,
  fontFamily: 'inherit',
  transition: 'color 0.2s'
};

export default Navbar;