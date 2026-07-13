import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const API_URL = 'https://elo-joyeria-backend.vercel.app/api';
  const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      // AJUSTE: La ruta es /ventas/pendientes
      const res = await axios.get(`${API_URL}/ventas/pendientes`, getConfig());
      setPedidos(res.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setCargando(false);
    }
  };

  const confirmarPedido = async (idVenta) => {
    if (!window.confirm("¿Confirmar este pedido y rebajar el stock?")) return;
    
    try {
      // AJUSTE: La ruta es /ventas/pendientes/:id/aprobar
      await axios.put(`${API_URL}/ventas/pendientes/${idVenta}/aprobar`, {}, getConfig());
      alert("Pedido aprobado y stock actualizado.");
      cargarPedidos(); 
    } catch (error) {
      console.error("Error al confirmar:", error);
      alert("Error al procesar la aprobación.");
    }
  };

  if (cargando) return <p style={{ padding: '20px', textAlign: 'center' }}>Cargando pedidos pendientes...</p>;

  return (
    <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
            <th style={estiloTh}>Cliente</th>
            <th style={estiloTh}>Detalle Productos</th>
            <th style={estiloTh}>Total</th>
            <th style={estiloTh}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? pedidos.map((p) => (
            <tr key={p.id_venta} style={{ borderBottom: '1px solid #eee' }}>
              <td style={estiloTd}>{p.nombre_cliente} <br/> <small style={{color: '#666'}}>{p.email_cliente}</small></td>
              <td style={estiloTd}>
                {(() => {
                  try {
                    // Nota: Si el error persiste al leer, verifica si detalle_productos viene como objeto o string
                    const carrito = typeof p.detalle_productos === 'string' 
                                    ? JSON.parse(p.detalle_productos) 
                                    : p.detalle_productos;
                    return carrito.map(item => `${item.nombre} (x${item.cantidad})`).join(', ');
                  } catch(e) { return "Error al leer productos"; }
                })()}
              </td>
              <td style={estiloTd}>₡{Number(p.monto_total || 0).toLocaleString('es-CR')}</td>
              <td style={estiloTd}>
                <button 
                  onClick={() => confirmarPedido(p.id_venta)}
                  style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ✅ Confirmar
                </button>
              </td>
            </tr>
          )) : <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No hay pedidos pendientes.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

const estiloTh = { padding: '12px', fontSize: '0.85rem', textTransform: 'uppercase' };
const estiloTd = { padding: '12px', fontSize: '0.9rem', color: '#333' };

export default GestionPedidos;