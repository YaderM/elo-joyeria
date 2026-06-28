import React from 'react';

function WhatsAppButton() {
  // Reemplaza este número por el tuyo de Costa Rica (con el 506 adelante, sin espacios)
  const telefono = "50661130448"; 
  const mensaje = encodeURIComponent("¡Hola! Vengo de la página web de Joyería Elo y me gustaría obtener más información sobre sus joyas. ✨");
  const urlWhatsApp = `https://wa.me/${telefono}?text=${mensaje}`;

  return (
    <a 
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#25d366',
        color: '#fff',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 9999,
        textDecoration: 'none',
        fontSize: '2rem',
        transition: 'transform 0.2s, background-color 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
    >
      {/* Usamos un icono SVG nativo limpio para no tener que instalar librerías extras */}
      <svg width="35" height="35" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.907h.004c4.368 0 7.926-3.558 7.93-7.93a7.897 7.897 0 0 0-2.333-5.596zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-4.98c-.202-.101-1.194-.588-1.379-.653-.185-.065-.32-.097-.455.101-.135.198-.522.653-.64.791-.118.139-.235.156-.437.055-1.239-.62-2.13-1.077-2.977-2.531-.223-.383.223-.356.639-1.156.071-.143.036-.268-.018-.369-.054-.101-.456-1.1-.625-1.505-.164-.395-.329-.34-.455-.347-.118-.007-.254-.007-.39-.007a.729.729 0 0 0-.527.247c-.185.198-.708.692-.708 1.688 0 .996.723 1.956.825 2.092.101.139 1.423 2.17 3.447 3.04.482.208.859.332 1.151.425.485.154.927.132 1.277.08.39-.058 1.194-.488 1.362-.936.168-.448.168-.83.118-.912-.05-.083-.186-.133-.388-.234z"/>
      </svg>
    </a>
  );
}

export default WhatsAppButton;