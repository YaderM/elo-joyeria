import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionPedidos = ({ onPedidoConfirmado }) => {
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
      await axios.put(`${API_URL}/ventas/pendientes/${idVenta}/aprobar`, {}, getConfig());
      alert("Pedido aprobado y stock actualizado.");
      
      cargarPedidos(); 
      
      if (onPedidoConfirmado) onPedidoConfirmado();
      
    } catch (error) {
      console.error("Error al confirmar:", error);
      alert("Error al procesar la aprobación.");
    }
  };

  if (cargando) return <p style={{ padding: '20px', textAlign: 'center' }}>Cargando pedidos pendientes...</p>;

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .tabla-pedidos-desktop { display: table; width: 100%; border-collapse: collapse; text-align: left; }
        .tarjeta-pedido-mobile { display: none; }
        @media (max-width: 768px) {
          .tabla-pedidos-desktop { display: none !important; }
          .tarjeta-pedido-mobile { display: flex !important; flex-direction: column; gap: 15px; }
        }
      `}</style>

      {/* Vista de Tarjetas para Celulares */}
      <div className="tarjeta-pedido-mobile">
        {pedidos.length > 0 ? pedidos.map((p) => (
          <div key={p.id_venta} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Cliente</span>
              <strong style={{ fontSize: '1rem', color: '#1a1a1a' }}>{p.nombre_cliente}</strong>
              <br/>
              <small style={{ color: '#666' }}>{p.email_cliente}</small>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Detalle de Productos</span>
              <span style={{ fontSize: '0.9rem', color: '#333' }}>
                {(() => {
                  try {
                    const carrito = typeof p.detalle_productos === 'string' 
                                  ? JSON.parse(p.detalle_productos) 
                                  : p.detalle_productos;
                    return carrito.map(item => `${item.nombre} (x${item.cantidad})`).join(', ');
                  } catch(e) { return "Error al leer productos"; }
                })()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Total</span>
                <strong style={{ fontSize: '1.1rem', color: '#2e7d32' }}>₡{Number(p.monto_total || 0).toLocaleString('es-CR')}</strong>
              </div>
              <button 
                onClick={() => confirmarPedido(p.id_venta)}
                style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        )) : <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No hay pedidos pendientes.</p>}
      </div>

      {/* Vista de Tabla Tradicional para Escritorio */}
      <div className="tabla-pedidos-desktop" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
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
    </div>
  );
};

const estiloTh = { padding: '12px', fontSize: '0.85rem', textTransform: 'uppercase' };
const estiloTd = { padding: '12px', fontSize: '0.9rem', color: '#333' };

export default GestionPedidos;