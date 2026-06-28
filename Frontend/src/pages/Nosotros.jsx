import React from 'react';

function Nosotros() {
  return (
    <div style={{ backgroundColor: '#fcfcfc', color: '#222' }}>
      
      {/* Banner Principal / Hero */}
      <div style={{ 
        position: 'relative', 
        height: '400px', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 20px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '300', letterSpacing: '4px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Nuestra Historia</h1>
          <p style={{ fontSize: '1.1rem', fontStyle: 'italic', letterSpacing: '1px', maxWidth: '600px', margin: '0 auto' }}>"Creando piezas eternas que celebran tus momentos más brillantes."</p>
        </div>
      </div>

      {/* Bloque 1: Quiénes Somos (Texto izquierda, Imagen derecha) */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px', display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 450px' }}>
          <span style={{ fontSize: '0.8rem', color: '#b59410', letterSpacing: '2px', fontWeight: '600', textTransform: 'uppercase' }}>CONÓCENOS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '300', margin: '10px 0 20px 0', letterSpacing: '0.5px' }}>Sobre Joyería Elo</h2>
          <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '15px' }}>
            Nacimos con la firme convicción de ofrecer joyería fina que combine la sofisticación moderna con la calidez del detalle artesanal. Cada una de nuestras piezas en Plata 925, Acero y colecciones seleccionadas está pensada para acompañarte en tus historias diarias y ocasiones memorables.
          </p>
          <p style={{ lineHeight: '1.8', color: '#555' }}>
            Nos inspira la perfección, el brillo auténtico y la satisfacción de nuestros clientes en cada rincón de Costa Rica. No solo distribuimos joyas; creamos conexiones brillantes.
          </p>
        </div>
        <div style={{ flex: '1 1 450px', height: '350px', overflow: 'hidden', borderRadius: '4px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80" alt="Taller de joyería" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Bloque de Valores Destacados (Tres Columnas) */}
      <div style={{ backgroundColor: '#f4f4f4', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          
          <div style={{ flex: '1 1 300px', textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '2rem', color: '#b59410' }}>✨</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '400', margin: '15px 0 10px 0', letterSpacing: '1px' }}>Calidad Garantizada</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>Materiales certificados como Plata 925 y Acero quirúrgico de alta durabilidad.</p>
          </div>

          <div style={{ flex: '1 1 300px', textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '2rem', color: '#b59410' }}>🇨🇷</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '400', margin: '15px 0 10px 0', letterSpacing: '1px' }}>Envíos Nacionales</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>Llegamos de forma segura a cualquier hogar de Costa Rica mediante Correos de CR.</p>
          </div>

          <div style={{ flex: '1 1 300px', textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '2rem', color: '#b59410' }}>🔒</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '400', margin: '15px 0 10px 0', letterSpacing: '1px' }}>Atención Cercana</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>Asesoría personalizada e inmediata por WhatsApp para asegurar la medida y pieza perfecta.</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Nosotros;