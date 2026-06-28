import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

function Contacto() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState({ tipo: '', texto: '' });

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const enviarEmail = (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensajeEstado({ tipo: '', texto: '' });

    // Sincronizado perfectamente con los nombres de variables que pusimos en la plantilla de EmailJS
    const parametrosPlantilla = {
      nombre: formData.nombre,
      correo: formData.correo,
      mensaje: formData.mensaje,
    };

    // 🔐 LLAMADO SEGURO A LAS VARIABLES DE ENTORNO DE VITE
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, parametrosPlantilla, PUBLIC_KEY)
      .then(() => {
        setMensajeEstado({
          tipo: 'exito',
          texto: '✨ ¡Mensaje enviado con éxito! Nos pondremos en contacto con vos muy pronto.'
        });
        setFormData({ nombre: '', correo: '', mensaje: '' });
      })
      .catch((error) => {
        console.error('Error EmailJS:', error);
        setMensajeEstado({
          tipo: 'error',
          texto: '❌ Hubo un problema al enviar el mensaje. Por favor, intentá de nuevo o escribinos directamente.'
        });
      })
      .finally(() => {
        setEnviando(false);
      });
  };

  return (
    <section style={estiloSeccion}>
      <div style={estiloContenedor}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={estiloTitulo}>CONTACTO</h2>
          <div style={estiloLineaOro}></div>
          <p style={estiloSubtitulo}>
            ¿Tenés alguna duda o querés cotizar una pieza personalizada? Escribinos y nos comunicaremos con vos.
          </p>
        </div>

        {/* Alertas de Feedback */}
        {mensajeEstado.texto && (
          <div style={{
            ...estiloAlerta,
            backgroundColor: mensajeEstado.tipo === 'exito' ? '#1c3d27' : '#4d1c1c',
            borderColor: mensajeEstado.tipo === 'exito' ? '#2e7d32' : '#c62828',
            color: mensajeEstado.tipo === 'exito' ? '#a3cfbb' : '#f8d7da'
          }}>
            {mensajeEstado.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={enviarEmail} style={estiloFormulario}>
          <div style={estiloGrupoInput}>
            <label style={estiloLabel}>NOMBRE COMPLETO</label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={manejarCambio}
              placeholder="Ej. Ana Rodríguez"
              style={estiloInput}
            />
          </div>

          <div style={estiloGrupoInput}>
            <label style={estiloLabel}>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              name="correo"
              required
              value={formData.correo}
              onChange={manejarCambio}
              placeholder="ejemplo@correo.com"
              style={estiloInput}
            />
          </div>

          <div style={estiloGrupoInput}>
            <label style={estiloLabel}>¿EN QUÉ PODEMOS AYUDARTE?</label>
            <textarea
              name="mensaje"
              required
              rows="5"
              value={formData.mensaje}
              onChange={manejarCambio}
              placeholder="Escribí aquí los detalles de tu consulta o la joya que te interesa..."
              style={{ ...estiloInput, resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            style={{
              ...estiloBoton,
              backgroundColor: enviando ? '#333' : '#b59410',
              cursor: enviando ? 'not-allowed' : 'pointer'
            }}
          >
            {enviando ? 'ENVIANDO MENSAJE...' : 'ENVIAR CONSULTA'}
          </button>
        </form>

      </div>
    </section>
  );
}

// 🎨 ESTILOS EN LINEA 
const estiloSeccion = {
  backgroundColor: '#111111', 
  padding: '60px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'sans-serif',
  minHeight: '80vh'
};

const estiloContenedor = {
  width: '100%',
  maxWidth: '550px',
  backgroundColor: '#1a1a1a', 
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  border: '1px solid #2a2a2a'
};

const estiloTitulo = {
  color: '#ffffff',
  fontSize: '1.8rem',
  fontWeight: '400',
  letterSpacing: '3px',
  margin: '0 0 10px 0'
};

const estiloLineaOro = {
  width: '50px',
  height: '2px',
  backgroundColor: '#b59410', 
  margin: '0 auto 15px auto'
};

const estiloSubtitulo = {
  color: '#aaa',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  margin: 0
};

const estiloGrupoInput = {
  marginBottom: '20px'
};

const estiloLabel = {
  display: 'block',
  color: '#b59410',
  fontSize: '0.75rem',
  fontWeight: '600',
  letterSpacing: '1px',
  marginBottom: '8px'
};

const estiloInput = {
  width: '100%',
  padding: '12px 15px',
  backgroundColor: '#222222',
  border: '1px solid #333333',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const estiloFormulario = {
  display: 'flex',
  flexDirection: 'column'
};

const estiloBoton = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: '600',
  letterSpacing: '1px',
  transition: 'background-color 0.2s',
  marginTop: '10px'
};

const estiloAlerta = {
  padding: '12px',
  borderRadius: '4px',
  fontSize: '0.9rem',
  marginBottom: '20px',
  border: '1px solid',
  textAlign: 'center'
};

export default Contacto;