import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Configuración base para mantener el estilo de marca en todos los alerts
const swalStyled = Swal.mixin({
  confirmButtonColor: '#b59410',
  cancelButtonColor: '#333',
});

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

  const confirmarPedido = async (pedido) => {
    const isEnvio = pedido.tipo_entrega === 'ENVIO';
    let trackingCode = '';

    if (isEnvio) {
      const { value: codigoGuia } = await swalStyled.fire({
        title: 'Número de Guía (Correos de CR)',
        input: 'text',
        inputPlaceholder: 'Ingrese el número de tracking o guía',
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return '¡Debe ingresar el número de guía para continuar!';
          }
        }
      });

      if (!codigoGuia) return;
      trackingCode = codigoGuia;
    }

    const result = await swalStyled.fire({
      title: '¿Confirmar pedido?',
      text: isEnvio 
        ? `Se aprobará el pedido, se guardará la guía y se preparará el enlace de WhatsApp para el envío.` 
        : `Se aprobará el pedido como retiro en tienda (venta física) y se preparará el mensaje de WhatsApp.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(`${API_URL}/ventas/pendientes/${pedido.id_venta}/aprobar`, {
        tracking_correos: trackingCode
      }, getConfig());

      swalStyled.fire({
        title: 'Pedido aprobado',
        text: 'Stock actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Listo',
      });

      // Generar mensaje y abrir WhatsApp automáticamente
      try {
        const carrito = typeof pedido.detalle_productos === 'string' 
          ? JSON.parse(pedido.detalle_productos) 
          : pedido.detalle_productos;
        const listaProductos = carrito.map(item => `${item.nombre} (x${item.cantidad})`).join(', ');
        
        // Limpiar y asegurar formato correcto con código de país de Costa Rica (506)
        const telefonoLimpio = (pedido.telefono_cliente || '').replace(/\D/g, '');
        const telefonoWhatsApp = telefonoLimpio.startsWith('506') ? telefonoLimpio : `506${telefonoLimpio}`;

        let mensajeWA = '';
        if (isEnvio) {
          mensajeWA = `¡Hola ${pedido.nombre_cliente}! Su pedido de Elo Joyería ya fue enviado a través de Correos de Costa Rica. Su número de guía es: ${trackingCode}. Detalle: ${listaProductos}. Total pagado: ₡${Number(pedido.monto_total || 0).toLocaleString('es-CR')}. ¡Muchas gracias por su compra!`;
        } else {
          mensajeWA = `¡Hola ${pedido.nombre_cliente}! En Elo Joyería le informamos que su pedido ya está listo para ser retirado en tienda. Detalle: ${listaProductos}. Total: ₡${Number(pedido.monto_total || 0).toLocaleString('es-CR')}. ¡Le esperamos!`;
        }

        if (telefonoLimpio) {
          window.open(`https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensajeWA)}`, '_blank');
        }
      } catch (waErr) {
        console.error("Error al abrir WhatsApp:", waErr);
      }

      cargarPedidos();

      if (onPedidoConfirmado) onPedidoConfirmado();

    } catch (error) {
      console.error("Error al confirmar:", error);
      swalStyled.fire({
        title: 'Error',
        text: 'Error al procesar la aprobación.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
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
              <small style={{ color: '#666' }}>{p.email_cliente} {p.telefono_cliente ? `| 📱 ${p.telefono_cliente}` : ''}</small>
              <div style={{ marginTop: '5px' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: p.tipo_entrega === 'ENVIO' ? '#e3f2fd' : '#e8f5e9', color: p.tipo_entrega === 'ENVIO' ? '#1565c0' : '#2e7d32' }}>
                  {p.tipo_entrega === 'ENVIO' ? '📦 Envío Correos de CR' : '🛍️ Venta Física / Retiro'}
                </span>
              </div>
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
                onClick={() => confirmarPedido(p)}
                style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                ✅ Confirmar y Notificar
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
              <th style={estiloTh}>Tipo de Entrega</th>
              <th style={estiloTh}>Detalle Productos</th>
              <th style={estiloTh}>Total</th>
              <th style={estiloTh}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length > 0 ? pedidos.map((p) => (
              <tr key={p.id_venta} style={{ borderBottom: '1px solid #eee' }}>
                <td style={estiloTd}>
                  {p.nombre_cliente} <br/> 
                  <small style={{color: '#666'}}>{p.email_cliente}</small>
                  {p.telefono_cliente && <><br/><small style={{color: '#555'}}>📱 {p.telefono_cliente}</small></>}
                </td>
                <td style={estiloTd}>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: p.tipo_entrega === 'ENVIO' ? '#e3f2fd' : '#e8f5e9', color: p.tipo_entrega === 'ENVIO' ? '#1565c0' : '#2e7d32' }}>
                    {p.tipo_entrega === 'ENVIO' ? '📦 Envío' : '🛍️ Física'}
                  </span>
                </td>
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
                    onClick={() => confirmarPedido(p)}
                    style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ✅ Confirmar y Notificar
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay pedidos pendientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const estiloTh = { padding: '12px', fontSize: '0.85rem', textTransform: 'uppercase' };
const estiloTd = { padding: '12px', fontSize: '0.9rem', color: '#333' };

export default GestionPedidos;