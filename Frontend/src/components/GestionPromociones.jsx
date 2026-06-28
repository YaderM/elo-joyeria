import React, { useState } from 'react';
import axios from 'axios';

function GestionPromociones({ productos, cargarProductos }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [descuento, setDescuento] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  // 🕒 NUEVO DATO: Estado para capturar el tiempo límite de la rebaja
  const [fechaFin, setFechaFin] = useState('');

  // Filtrar productos para la búsqueda rápida dentro de promociones
  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setDescuento(0); // Reiniciar el contador de descuento para el nuevo producto
    setFechaFin(''); // Limpiar la fecha vieja al cambiar de joya
  };

  const calcularPrecioFinal = (precio, pctDescuento) => {
    const precioNum = Number(precio);
    return precioNum - (precioNum * (pctDescuento / 100));
  };

  const aplicarOferta = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return;

    // Si el descuento es mayor a 0, se calcula el valor; de lo contrario, vuelve a NULL en MySQL
    const precioOfertaFinal = descuento > 0 
      ? calcularPrecioFinal(productoSeleccionado.precio, descuento) 
      : null;

    // ✨ CAMBIO AQUÍ: Formatear la fecha para que MySQL no la rechace ni desfase
    // Convierte "2026-06-24T15:30" en "2026-06-24 15:30:00"
    const fechaFormateada = descuento > 0 && fechaFin 
      ? fechaFin.replace('T', ' ') + ':00' 
      : null;

    try {
      // ACTUALIZADO: Pasamos la fecha formateada de manera limpia al servidor
      const respuesta = await axios.patch(`[https://elo-joyeria-backend.vercel.app](https://elo-joyeria-backend.vercel.app)/api/productos/${productoSeleccionado.id_producto}/oferta`, {
        precio_oferta: precioOfertaFinal,
        fecha_fin_oferta: fechaFormateada
      });

      alert(respuesta.data.mensaje || '¡Precio de oferta actualizado con éxito!');
      
      // Limpiar estados y refrescar la lista global del panel
      setProductoSeleccionado(null);
      setDescuento(0);
      setFechaFin('');
      cargarProductos();
      
    } catch (error) {
      console.error("Error al aplicar la promoción:", error);
      alert('Hubo un error de conexión al intentar guardar la oferta en el servidor.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
      
      {/* COLUMNA IZQUIERDA: LISTA DE PRODUCTOS PARA SELECCIONAR */}
      <div>
        <h3 style={estiloSubtitulo}>🎯 Seleccione un producto para aplicar oferta</h3>
        <input 
          type="text" 
          placeholder="🔍 Filtrar joya por nombre..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={estiloInputBusqueda}
        />

        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Joya</th>
                <th style={{ padding: '10px' }}>Precio Base</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(prod => (
                <tr key={prod.id_producto} style={{ borderBottom: '1px solid #eee', backgroundColor: productoSeleccionado?.id_producto === prod.id_producto ? '#fffbe6' : 'transparent' }}>
                  <td style={{ padding: '10px', fontWeight: '500' }}>{prod.nombre}</td>
                  <td style={{ padding: '10px', color: '#2e7d32' }}>₡{Number(prod.precio).toLocaleString('es-CR')}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button 
                      onClick={() => seleccionarProducto(prod)}
                      style={{ ...estiloBotonAccion, backgroundColor: productoSeleccionado?.id_producto === prod.id_producto ? '#b59410' : '#f0f0f0', color: productoSeleccionado?.id_producto === prod.id_producto ? '#fff' : '#333' }}
                    >
                      {productoSeleccionado?.id_producto === prod.id_producto ? 'Seleccionado' : '⚡ Gestionar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLUMNA DERECHA: CALCULADORA Y APLICACIÓN DE DESCUENTOS */}
      <div style={{ backgroundColor: '#fdfdfd', border: '1px solid #e9e9e9', padding: '25px', borderRadius: '8px' }}>
        <h3 style={estiloSubtitulo}>🏷️ Calculadora de Rebajas</h3>
        
        {productoSeleccionado ? (
          <form onSubmit={aplicarOferta}>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Producto Elegido</p>
              <strong style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{productoSeleccionado.nombre}</strong>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#666', textTransform: 'uppercase' }}>Precio Actual</p>
              <strong style={{ fontSize: '1.2rem', color: '#c62828' }}>₡{Number(productoSeleccionado.precio).toLocaleString('es-CR')}</strong>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', color: '#555' }}>Porcentaje de Descuento</label>
              <select 
                value={descuento} 
                onChange={(e) => setDescuento(Number(e.target.value))} 
                style={estiloSelectForm}
              >
                <option value="0">0% (Sin Descuento / Precio Normal)</option>
                <option value="5">5% de Descuento</option>
                <option value="10">10% de Descuento</option>
                <option value="15">15% de Descuento</option>
                <option value="20">20% de Descuento</option>
                <option value="25">25% de Descuento</option>
                <option value="30">30% de Descuento</option>
                <option value="50">50% de Descuento (Mitad de Precio)</option>
              </select>
            </div>

            {/* 📅 NUEVO ELEMENTO FORMULARIO: Se muestra únicamente si se asigna un rebajo mayor a 0% */}
            {descuento > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', color: '#555' }}>
                  📅 ¿Cuándo termina la oferta? (Opcional)
                </label>
                <input 
                  type="datetime-local" 
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  style={{ ...estiloSelectForm, boxSizing: 'border-box' }} 
                />
              </div>
            )}

            {descuento > 0 && (
              <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #c8e6c9' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#2e7d32', fontWeight: '600', textTransform: 'uppercase' }}>Precio Final de Oferta</p>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1b5e20' }}>
                  ₡{calcularPrecioFinal(productoSeleccionado.precio, descuento).toLocaleString('es-CR')}
                </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#4caf50' }}>Ahorro directo de: ₡{(Number(productoSeleccionado.precio) * (descuento / 100)).toLocaleString('es-CR')}</p>
              </div>
            )}

            <button type="submit" style={estiloBotonOroGrande}>
              ACTUALIZAR PRECIO OFICIAL
            </button>
          </form>
        ) : (
          <p style={{ color: '#888', textAlign: 'center', paddingTop: '40px', fontSize: '0.95rem' }}>Selecciona una joya de la lista de la izquierda para configurar su oferta.</p>
        )}
      </div>

    </div>
  );
}

const estiloSubtitulo = { fontWeight: '400', color: '#b59410', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' };
const estiloInputBusqueda = { padding: '10px 15px', width: '100%', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem', boxSizing: 'border-box', marginBottom: '15px' };
const estiloBotonAccion = { border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s' };
const estiloSelectForm = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' };
const estiloBotonOroGrande = { width: '100%', backgroundColor: '#b59410', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', letterSpacing: '0.5px' };

export default GestionPromociones;