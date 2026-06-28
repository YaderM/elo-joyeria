import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState(''); // Cambiado a email
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // 🔄 Nuevos estados para controlar el flujo de restablecimiento funcional
  const [modoRestablecer, setModoRestablecer] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [exito, setExito] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    
    try {
      // Petición real al backend adaptada a tu tabla
      const respuesta = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        contrasena
      });

      // Si el backend responde con éxito, guardamos el token firmado y los datos del usuario
      if (respuesta.data.token) {
        localStorage.setItem('adminToken', respuesta.data.token);
        localStorage.setItem('adminNombre', respuesta.data.usuario.nombre);
        localStorage.setItem('usuarioRol', respuesta.data.usuario.rol); // 👈 Guardamos el rol para las rutas protegidas

        // 🔀 Redirección condicional según el rol real de la base de datos
        const rol = respuesta.data.usuario.rol;
        if (rol === 'admin') {
          navigate('/admin/panel'); // Si es admin, va al Panel de Control de Inventario
        } else if (rol === 'cliente') {
          navigate('/'); // Si es cliente, va a la página de Inicio pública
        } else {
          setError('El rol asignado no cuenta con accesos configurados.');
        }
      }
    } catch (err) {
      console.error("Error en login:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo conectar con el servidor de seguridad.');
      }
    } finally {
      setCargando(false);
    }
  };

  // ♻️ Nueva función conectada al endpoint de tu backend real
  const manejarRestablecer = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      const respuesta = await axios.post('http://localhost:3000/api/auth/restablecer', {
        email,
        nuevaContrasena
      });

      setExito(respuesta.data.mensaje || 'Contraseña actualizada con éxito.');
      setContrasena('');
      setNuevaContrasena('');
      
      // Regresa automáticamente al login tras 2.5 segundos para que pruebe la nueva clave
      setTimeout(() => {
        setModoRestablecer(false);
        setExito('');
      }, 2500);

    } catch (err) {
      console.error("Error al restablecer:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('No se pudo conectar con la base de datos.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#fafafa', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', border: '1px solid #eee' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '300', color: '#222', letterSpacing: '2px', margin: '0 0 10px 0' }}>ELO JOYERÍA </h2>
          {/* Textos y subtítulos neutralizados para ambos roles */}
          <p style={{ color: '#777', fontSize: '0.9rem', fontWeight: '300', margin: 0 }}>
            {modoRestablecer ? 'Restablecer Clave de Usuario' : 'Acceso al Sistema Autenticado'}
          </p>
          <div style={{ fontSize: '1.5rem', color: '#b59410', marginTop: '10px' }}>
            {modoRestablecer ? '🔄 🔧 🔄' : '✨ 🔐 ✨'}
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fdf2f2', color: '#ec5b5b', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Alerta de éxito al actualizar la Base de Datos */}
        {exito && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            {exito}
          </div>
        )}

        {/* FORMULARIO CONDICIONAL SEGÚN EL MODO */}
        {!modoRestablecer ? (
          <form onSubmit={manejarLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@joyeriaelo.com" // Placeholder genérico amigable
                required
                disabled={cargando}
                style={estiloInput}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contraseña</label>
              <input 
                type="password" 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                required
                disabled={cargando}
                style={estiloInput}
              />
            </div>

            {/* Link para abrir la sección de restablecer contraseña */}
            <div style={{ textAlign: 'right', marginBottom: '25px' }}>
              <span 
                onClick={() => { setModoRestablecer(true); setError(''); }}
                style={{ color: '#b59410', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            {/* 🏷️ Botón corregido a un texto limpio y universal */}
            <button type="submit" style={estiloBotonLogin} disabled={cargando}>
              {cargando ? 'VERIFICANDO...' : 'INGRESAR'}
            </button>
          </form>
        ) : (
          <form onSubmit={manejarRestablecer}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirmar Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@joyeriaelo.com"
                required
                disabled={cargando}
                style={estiloInput}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#444', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nueva Contraseña</label>
              <input 
                type="password" 
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                placeholder="Escribe tu nueva contraseña"
                required
                disabled={cargando}
                style={estiloInput}
              />
            </div>

            <button type="submit" style={{ ...estiloBotonLogin, backgroundColor: '#b59410' }} disabled={cargando}>
              {cargando ? 'ACTUALIZANDO BD...' : 'RESTABLECER EN BASE DE DATOS'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span 
                onClick={() => { setModoRestablecer(false); setError(''); }}
                style={{ color: '#666', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Volver al inicio de sesión
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const estiloInput = {
  width: '100%',
  padding: '12px 15px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '0.95rem',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.3s',
  backgroundColor: '#fbfbfb'
};

const estiloBotonLogin = {
  width: '100%',
  backgroundColor: '#222',
  color: '#fff',
  border: 'none',
  padding: '14px',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: '500',
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

export default Login;