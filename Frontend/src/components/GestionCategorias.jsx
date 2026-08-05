import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Configuración base para mantener el estilo de marca en todos los alerts
const swalStyled = Swal.mixin({
  confirmButtonColor: '#b59410',
  cancelButtonColor: '#333',
});

function GestionCategorias({ materiales, tipos, cargarAuxiliares }) {
  const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: '', descripcion: '' });
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: '' });

  const guardarMaterial = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('https://elo-joyeria-backend.vercel.app/api/productos/aux/materiales', nuevoMaterial);
      swalStyled.fire({
        title: '¡Material registrado!',
        text: respuesta.data.mensaje || 'Nuevo material registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Listo',
      });
      setNuevoMaterial({ nombre: '', descripcion: '' });
      cargarAuxiliares();
    } catch (error) {
      console.error(error);
      swalStyled.fire({
        title: 'Error',
        text: 'Hubo un error al crear el material.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  const guardarTipo = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await axios.post('https://elo-joyeria-backend.vercel.app/api/productos/aux/tipos', nuevoTipo);
      swalStyled.fire({
        title: '¡Tipo registrado!',
        text: respuesta.data.mensaje || 'Nuevo tipo registrado con éxito.',
        icon: 'success',
        confirmButtonText: 'Listo',
      });
      setNuevoTipo({ nombre: '' });
      cargarAuxiliares();
    } catch (error) {
      console.error(error);
      swalStyled.fire({
        title: 'Error',
        text: 'Hubo un error al crear el tipo.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <style>{`
        .grid-categorias {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .form-categoria-mobile {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .grid-categorias {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
          }
          .form-categoria-mobile {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .form-categoria-mobile input,
          .form-categoria-mobile button {
            width: 100% !important;
            flex: none !important;
          }
        }
      `}</style>

      <div className="grid-categorias">
        
        {/* SECCIÓN MATERIALES */}
        <div style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={estiloSubtitulo}>✨ Materiales Disponibles</h3>
          <form onSubmit={guardarMaterial} className="form-categoria-mobile">
            <input type="text" required placeholder="Ej: Oro Rosa" value={nuevoMaterial.nombre} onChange={(e) => setNuevoMaterial({...nuevoMaterial, nombre: e.target.value})} style={estiloInputForm} />
            <input type="text" placeholder="Descripción" value={nuevoMaterial.descripcion} onChange={(e) => setNuevoMaterial({...nuevoMaterial, descripcion: e.target.value})} style={estiloInputForm} />
            <button type="submit" style={estiloBotonNegro}>Añadir</button>
          </form>

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ ...estiloTabla, minWidth: '400px' }}>
              <thead>
                <tr style={estiloFilaHeader}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Nombre</th>
                  <th style={{ padding: '10px' }}>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {materiales.map(mat => (
                  <tr key={mat.id_material} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', color: '#888' }}>#{mat.id_material}</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{mat.nombre}</td>
                    <td style={{ padding: '10px', color: '#666' }}>{mat.descripcion || 'Sin descripción'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECCIÓN TIPOS */}
        <div style={{ width: '100%', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={estiloSubtitulo}>📿 Tipos de Producto</h3>
          <form onSubmit={guardarTipo} className="form-categoria-mobile">
            <input type="text" required placeholder="Ej: Pulseras" value={nuevoTipo.nombre} onChange={(e) => setNuevoTipo({ nombre: e.target.value })} style={estiloInputForm} />
            <button type="submit" style={estiloBotonNegro}>Añadir</button>
          </form>

          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ ...estiloTabla, minWidth: '300px' }}>
              <thead>
                <tr style={estiloFilaHeader}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Nombre de Tipo</th>
                </tr>
              </thead>
              <tbody>
                {tipos.map(t => (
                  <tr key={t.id_tipo} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', color: '#888' }}>#{t.id_tipo}</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{t.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

const estiloSubtitulo = { fontWeight: '400', color: '#b59410', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' };
const estiloInputForm = { padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', flex: 1, minWidth: '120px', boxSizing: 'border-box' };
const estiloBotonNegro = { backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' };
const estiloTabla = { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' };
const estiloFilaHeader = { backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea', textAlign: 'left' };

export default GestionCategorias;