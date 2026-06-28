import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Estados de interacción
  const [cantidad, setCantidad] = useState(1);
  const [medidaSeleccionada, setMedidaSeleccionada] = useState('');
  
  // Estados de los acordeones colapsables
  const [infoAbierta, setInfoAbierta] = useState(true);
  const [envioAbierto, setEnvioAbierto] = useState(false);

  useEffect(() => {
    axios.get(`[https://elo-joyeria-backend.vercel.app](https://elo-joyeria-backend.vercel.app)/api/productos/${id}`)
      .then(response => {
        setProducto(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al cargar el detalle del producto:", error);
        setCargando(false);
      });
  }, [id]);

  if (cargando) return <p style={{ textAlign: 'center', padding: '100px', color: '#666', fontStyle: 'italic' }}>Cargando detalles de la joya...</p>;
  if (!producto) return <p style={{ textAlign: 'center', padding: '100px', color: '#666' }}>La joya solicitada no está disponible.</p>;

  const esAnillo = producto.tipo_producto?.toLowerCase().includes('anillo');
  const tallasDisponibles = ['6', '7', '8', '9', '10'];

  // 🌟 VALIDACIÓN: Verificamos si el producto cuenta con un descuento válido
  const tieneOferta = producto.precio_oferta !== null && producto.precio_oferta > 0;
  // Determinamos el precio final de cobro basándonos en la oferta
  const precioFinalEfectivo = tieneOferta ? Number(producto.precio_oferta) : Number(producto.precio);

  const gestionarPedidoWhatsApp = () => {
    if (esAnillo && !medidaSeleccionada) {
      alert('Por favor, selecciona una medida para tu anillo antes de solicitarlo por WhatsApp.');
      return;
    }

    const telefono = "50661130448"; // WhatsApp real de Joyería Elo
    const detalleMedida = esAnillo ? ` (Talla: ${medidaSeleccionada})` : '';
    
    const totalCalculado = precioFinalEfectivo * cantidad;
    
    // ✨ Formato limpio sin emojis conflictivos para evitar caracteres rotos en navegadores y apps
    const texto = `¡Hola! Me interesa comprar esta joya desde la página web:\n\n` +
                  `* Detalle del Producto:* ${producto.nombre}${detalleMedida}\n` +
                  `* Cantidad:* ${cantidad}\n` +
                  `* Precio Total:* ₡${totalCalculado.toLocaleString('es-CR')}\n\n` +
                  `> Método de pago deseado: Sinpe Móvil\n\n` +
                  `¿Me podrían confirmar la disponibilidad para proceder? ¡Muchas gracias!`;
                  
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '30px', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}
      >
        ← Volver a la galería
      </button>

      <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
        
        {/* Imagen */}
        <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
          <div style={{ width: '100%', height: '520px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #f0f0f0', background: '#fff' }}>
            <img 
              src={producto.imagen_url || 'https://via.placeholder.com/500'} 
              alt={producto.nombre} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Datos y Formulario */}
        <div style={{ flex: '1 1 450px', minWidth: '300px' }}>
          <span style={{ fontSize: '0.8rem', color: '#b59410', letterSpacing: '2px', fontWeight: '600', textTransform: 'uppercase' }}>
            {producto.material}
          </span>
          
          <h2 style={{ fontSize: '2.2rem', fontWeight: '300', color: '#222', margin: '10px 0 15px 0', letterSpacing: '0.5px' }}>
            {producto.nombre}
          </h2>
          
          {/* 🌟 BLOQUE DE PRECIO CORREGIDO: Renderizado condicional elegante para ofertas */}
          <div style={{ margin: '0 0 25px 0', display: 'flex', alignItems: 'baseline', gap: '15px' }}>
            {tieneOferta ? (
              <>
                <span style={{ fontSize: '1.8rem', color: '#d32f2f', fontWeight: '600' }}>
                  ₡{Number(producto.precio_oferta).toLocaleString('es-CR')}
                </span>
                <span style={{ fontSize: '1.2rem', color: '#a0a0a0', textDecoration: 'line-through', fontWeight: '400' }}>
                  ₡{Number(producto.precio).toLocaleString('es-CR')}
                </span>
                <span style={{ backgroundColor: '#eef9f1', color: '#2e7d32', fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  OFERTA ESPECIAL
                </span>
              </>
            ) : (
              <span style={{ fontSize: '1.6rem', color: '#b59410', fontWeight: '500' }}>
                ₡{Number(producto.precio).toLocaleString('es-CR')}
              </span>
            )}
          </div>

          <hr style={{ border: '0', height: '1px', background: '#eaeaea', marginBottom: '25px' }} />

          {/* 🌟 LOGICA MODIFICADA: El selector de medidas ahora depende estrictamente de que sea un anillo */}
          {esAnillo && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', letterSpacing: '1px', color: '#333' }}>
                MEDIDA DEL ANILLO
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {tallasDisponibles.map(talla => (
                  <button 
                    key={talla}
                    onClick={() => setMedidaSeleccionada(talla)}
                    style={{
                      padding: '10px 18px',
                      border: medidaSeleccionada === talla ? '2px solid #b59410' : '1px solid #cccccc',
                      background: '#fff',
                      color: medidaSeleccionada === talla ? '#b59410' : '#333',
                      fontWeight: medidaSeleccionada === talla ? '600' : '400',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {talla}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de Cantidad */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px', letterSpacing: '1px', color: '#333' }}>
              CANTIDAD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cccccc', width: '130px', borderRadius: '4px', background: '#fff' }}>
              <button onClick={() => cantidad > 1 && setCantidad(cantidad - 1)} style={estiloBotonCantidad}>-</button>
              <span style={{ flexGrow: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '500' }}>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)} style={estiloBotonCantidad}>+</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
              Unidades disponibles: {producto.stock}
            </p>
          </div>

          {/* Botón WhatsApp */}
          <button 
            onClick={gestionarPedidoWhatsApp}
            style={{
              width: '100%', background: '#222', color: '#fff', border: 'none', padding: '16px',
              fontSize: '0.95rem', letterSpacing: '2px', fontWeight: '500', borderRadius: '4px',
              cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '15px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b59410'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#222'}
          >
            SOLICITAR POR WHATSAPP
          </button>

          {/* 📱 BLOQUE DE MÉTODOS DE PAGO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '35px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px dashed #ddd' }}>
            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '500', letterSpacing: '0.5px' }}>
              💳 Aceptamos Sinpe Móvil y Transferencias Bancarias
            </span>
          </div>

          {/* Acordeones */}
          <div style={{ borderTop: '1px solid #eaeaea' }}>
            <div style={estiloHeaderAcordeon} onClick={() => setInfoAbierta(!infoAbierta)}>
              <span>DESCRIPCIÓN Y DETALLES</span>
              <span>{infoAbierta ? '−' : '+'}</span>
            </div>
            {infoAbierta && (
              <div style={estiloCuerpoAcordeon}>
                <p style={{ margin: 0, lineHeight: '1.6', color: '#555' }}>{producto.descripcion}</p>
              </div>
            )}

            <div style={estiloHeaderAcordeon} onClick={() => setEnvioAbierto(!envioAbierto)}>
              <span>POLÍTICAS DE ENVÍO Y CUIDADO</span>
              <span>{envioAbierto ? '−' : '+'}</span>
            </div>
            {envioAbierto && (
              <div style={estiloCuerpoAcordeon}>
                <p style={{ margin: 0, lineHeight: '1.6', color: '#555' }}>
                  Hacemos envíos rápidos y seguros a todo el país mediante Correos de Costa Rica. Para conservar la calidad impecable de tu pieza, sugerimos evitar el contacto prolongado con lociones, agua salada o químicos de limpieza.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const estiloBotonCantidad = { background: 'none', border: 'none', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', color: '#444' };
const estiloHeaderAcordeon = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #eaeaea', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', color: '#333' };
const estiloCuerpoAcordeon = { padding: '15px 0 25px 0', borderBottom: '1px solid #eaeaea', fontSize: '0.9rem' };

export default DetalleProducto;