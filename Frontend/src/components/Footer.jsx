import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#b3b3b3', padding: '50px 20px', fontSize: '0.9rem', borderTop: '4px solid #b59410' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
        
        {/* Columna 1: Marca */}
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '300', letterSpacing: '2px', margin: '0 0 15px 0' }}>JOYERÍA ELO</h3>
          <p style={{ lineHeight: '1.6', fontSize: '0.85rem' }}>Dedicados a resaltar tu brillo natural a través de colecciones exclusivas y atención personalizada.</p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div style={{ flex: '1 1 150px' }}>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '500', marginBottom: '15px', letterSpacing: '1px' }}>ENLACES</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/" style={estiloLink}>Inicio</Link></li>
            <li><Link to="/tienda" style={estiloLink}>Tienda</Link></li>
            <li><Link to="/nosotros" style={estiloLink}>Nosotros</Link></li>
          </ul>
        </div>

        {/* Columna 3: Ubicación y Contacto */}
        <div style={{ flex: '1 1 250px' }}>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '500', marginBottom: '15px', letterSpacing: '1px' }}>CONTACTO & DIRECCIÓN</h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>📍 Grecia Alajuela, Costa Rica</p>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>📦 Envíos a todo el país por Correos de Costa Rica</p>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>📱 WhatsApp: (+506) 6113-0448</p>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>🕒 Horario: Lunes a Sábado: 9:00 AM - 6:00 PM</p>
        </div>

      </div>

      <hr style={{ border: 0, height: '1px', background: '#333', margin: '30px 0' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center', fontSize: '0.8rem' }}>
        <span>© {new Date().getFullYear()} Elo Joyeria. Todos los derechos reservados.</span>
        <span style={{ color: '#888' }}>⚡ Conexión Segura vía SINPE Móvil</span>
      </div>
    </footer>
  );
}

const estiloLink = { color: '#b3b3b3', textDecoration: 'none', transition: 'color 0.2s' };

export default Footer;