import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  // 🕵️ Validación estricta: Solo mostramos la opción si el usuario actual tiene rol de cliente
  const esCliente = localStorage.getItem('usuarioRol') === 'cliente';

  const seccionesTienda = [
    {
      titulo: 'Acero', // Antes: 'ACERO'
      items: ['Anillos', 'Argollas', 'Aretes', 'Cadenas', 'Collares', 'Huggies', 'Dijes', 'Conjuntos', 'Pulseras', 'Rosarios', 'Tobilleras'] // Cambié 'Juegos de Acero' por 'Conjuntos' para que coincida con tu BD
    },
    {
      titulo: 'Pandora', // Antes: 'PANDORA'
      items: ['Anillos', 'Aretes', 'Cadenas de Seguridad', 'Charms', 'Pulseras', 'Cadenas']
    },
    {
      titulo: 'Plata', // Antes: 'PLATA 925' - Lo dejamos en 'Plata' como en la BD
      items: ['Anillos', 'Aretes', 'Cadenas', 'Dijes', 'Pulseras']
    },
    {
      titulo: 'Piercings', // Antes: 'PIERCINGS'
      items: ['Piercings'] // Cambiado para que cuando filtre busque exactamente 'Piercings' en tipo_producto
    }
  ];

  // 🔄 Limpia el almacenamiento local de sesión y redirige
  const manejarCerrarSesion = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminNombre');
    localStorage.removeItem('usuarioRol');
    navigate('/login');
  };

  return (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Cintillo Elegante Sutil */}
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

      {/* Navbar Principal */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #eaeaea',
        padding: '15px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', marginBottom: '15px' }}>
          <h1 style={{ color: '#b59410', fontSize: '2.4rem', fontWeight: '300', margin: 0, letterSpacing: '4px' }}>
            ELO JOYERÍA
          </h1>
        </Link>

        {/* Enlaces */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }} className="enlaces-container-elo">
          <Link to="/" style={estiloLink}>INICIO</Link>
          
          <div 
            onMouseEnter={() => setMenuAbierto(true)}
            onMouseLeave={() => setMenuAbierto(false)}
            onClick={() => setMenuAbierto(!menuAbierto)} // Habilita la apertura táctil en celulares
            style={{ position: 'relative', paddingBottom: '5px', cursor: 'pointer' }}
          >
            <span style={{ ...estiloLink, display: 'flex', alignItems: 'center', gap: '5px' }}>
              TIENDA <span style={{ fontSize: '0.7rem' }}>▼</span>
            </span>

            {/* Mega Menú - Añadimos una clase explícita para controlarlo sin romper cascadas */}
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

          {/* 🌟 Nueva Pestaña Nosotros Perfectamente Integrada */}
          <Link to="/nosotros" style={estiloLink}>NOSOTROS</Link>

          <Link to="/contacto" style={estiloLink}>CONTACTO</Link>

          {/* 🔐 Botón adaptado al diseño minimalista: Solo visible si es un Cliente autenticado */}
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

      {/* Styles inteligentes inyectados usando clases explícitas */}
      <style>{`
        @keyframes fadeInMenu {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        /* 📱 Modificaciones automáticas exclusivas para pantallas móviles */
        @media (max-width: 768px) {
          nav {
            padding: 12px 15px !important;
          }
          nav h1 {
            font-size: 1.8rem !important;
            letter-spacing: 2px !important;
          }
          .enlaces-container-elo {
            gap: 15px !important; 
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          
          /* Cambiamos el Mega menú flotante de la tienda a un bloque vertical desplegable idóneo para móviles */
          .mega-menu-desplegable-elo {
            position: absolute !important;
            top: 100% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 90vw !important;
            max-width: 320px !important;
            grid-template-columns: 1fr !important; /* Forza una sola columna vertical */
            gap: 20px !important;
            max-height: 380px !important;
            overflow-y: auto !important; /* Permite scroll si la pantalla es muy pequeña */
            padding: 20px !important;
            box-shadow: 0px 8px 25px rgba(0,0,0,0.15) !important;
            z-index: 99999 !important;
          }

          .seccion-columna-elo {
            width: 100% !important;
            text-align: left !important;
          }

          .seccion-columna-elo h4 {
            text-align: left !important;
            margin-top: 5px !important;
            margin-bottom: 8px !important;
            border-bottom: 1px solid #f0f0f0 !important;
          }

          .seccion-columna-elo ul {
            text-align: left !important;
            padding-left: 5px !important;
          }

          .seccion-columna-elo li {
            text-align: left !important;
          }
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