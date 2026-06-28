import React, { useState } from 'react';
import axios from 'axios';

function GestionInventario({ productos, materiales, tipos, cargarProductos, iniciarEdicion, iniciarCreacion, manejarEliminar }) {
  const [busqueda, setBusqueda] = useState('');

  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '15px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar joya por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={estiloInputBusqueda}
        />
        <button onClick={iniciarCreacion} style={estiloBotonOro}>
          ➕ AGREGAR PRODUCTO NUEVO
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea' }}>
              <th style={{ padding: '12px 15px' }}>Imagen</th>
              <th style={{ padding: '12px 15px' }}>Nombre</th>
              <th style={{ padding: '12px 15px' }}>Precio</th>
              <th style={{ padding: '12px 15px' }}>Stock</th>
              <th style={{ padding: '12px 15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((prod) => (
              <tr key={prod.id_producto} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 15px' }}>
                  <img src={prod.imagen_url || 'https://via.placeholder.com/50'} alt={prod.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                </td>
                <td style={{ padding: '12px 15px', fontWeight: '500' }}>{prod.nombre}</td>
                
                {/* CELDA DE PRECIO ACTUALIZADA: Valida si hay oferta activa */}
                <td style={{ padding: '12px 15px', fontWeight: '600' }}>
                  {prod.precio_oferta ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8rem', fontWeight: '400' }}>
                        Local: ₡{Number(prod.precio).toLocaleString('es-CR')}
                      </span>
                      <span style={{ color: '#d32f2f', fontSize: '0.95rem' }}>
                        Oferta: ₡{Number(prod.precio_oferta).toLocaleString('es-CR')}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#2e7d32' }}>
                      ₡{Number(prod.precio).toLocaleString('es-CR')}
                    </span>
                  )}
                </td>

                <td style={{ padding: '12px 15px' }}>{prod.stock} unids</td>
                <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                  <button onClick={() => iniciarEdicion(prod)} style={estiloBotonAccion}>✏️ Editar</button>
                  <button onClick={() => manejarEliminar(prod.id_producto, prod.nombre)} style={estiloBotonEliminar}>🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const estiloInputBusqueda = { padding: '10px 15px', width: '320px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' };
const estiloBotonOro = { backgroundColor: '#b59410', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' };
const estiloBotonAccion = { backgroundColor: '#f0f0f0', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer', fontSize: '0.85rem' };
const estiloBotonEliminar = { backgroundColor: '#fdf2f2', color: '#d32f2f', border: '1px solid #fde8e8', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' };

export default GestionInventario;