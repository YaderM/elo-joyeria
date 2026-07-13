import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';

function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const total = getCartTotal();

  const [paso, setPaso] = useState('RESUMEN');
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', direccion: '', email: '', notas: '', comprobante: null });

  const handleChange = (e) => {
    if (e.target.name === 'comprobante') {
      setFormData({ ...formData, comprobante: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFinalizar = async (e) => {
    e.preventDefault();
    if (!formData.comprobante) {
        alert("Por favor selecciona un comprobante de pago.");
        return;
    }
    
    setCargando(true);
    
    try {
      // 1. Subir imagen a ImgBB
      const imageData = new FormData();
      imageData.append('image', formData.comprobante);
      const resImg = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, imageData);
      const comprobanteUrl = resImg.data.data.url;

      // 1.5. Registrar en la base de datos (Backend con URL fija)
      await axios.post('https://elo-joyeria-backend.vercel.app/api/ventas', {
        cliente: { nombre: formData.nombre, email: formData.email },
        carrito: cart,
        total: total,
        comprobante_sinpe: comprobanteUrl
      });

      // 2. Preparar datos para comunicación
      const listaProductos = cart.map(i => `${i.nombre} (x${i.cantidad})`).join(', ');

      // 3. Disparador WhatsApp
      const mensajeWA = `Hola Elo Joyería, nuevo pedido de: ${formData.nombre}. Total: ₡${total}. Productos: ${listaProductos}. Comprobante: ${comprobanteUrl}`;
      window.open(`https://wa.me/50661130448?text=${encodeURIComponent(mensajeWA)}`, '_blank');

      // 4. Disparador Correo (EmailJS)
      const templateParams = {
        to_name: "Elo Joyería",
        cliente_nombre: formData.nombre,
        cliente_email: formData.email,
        total: total,
        productos: listaProductos,
        comprobante: comprobanteUrl
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        'template_0cflqo3',
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      alert('¡Pedido enviado con éxito!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error("Error en proceso:", error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  if (cart.length === 0) return <div style={{textAlign: 'center', padding: '60px'}}><h2>Carrito vacío</h2><button onClick={() => navigate('/')} style={estiloBoton}>Volver</button></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: '#161616', color: '#fff', borderRadius: '12px' }}>
      {paso === 'RESUMEN' ? (
        <div>
          <h2 style={{color: '#b59410'}}>Resumen de Factura</h2>
          {cart.map(item => (
            <div key={item.id} style={estiloItem}><span>{item.nombre} x{item.cantidad}</span> <span>₡{item.precio * item.cantidad}</span></div>
          ))}
          <div style={{...estiloItem, fontWeight: 'bold', fontSize: '1.2rem'}}><span>TOTAL</span> <span>₡{total}</span></div>
          <button onClick={() => setPaso('DATOS')} style={estiloBoton}>Continuar con los datos</button>
        </div>
      ) : (
        <form onSubmit={handleFinalizar}>
          <h2 style={{color: '#b59410'}}>Datos de Entrega</h2>
          <input name="nombre" placeholder="Nombre" required onChange={handleChange} style={estiloInput} />
          <input name="telefono" placeholder="Teléfono" required onChange={handleChange} style={estiloInput} />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange} style={estiloInput} />
          <textarea name="direccion" placeholder="Dirección" required onChange={handleChange} style={estiloInput} />
          <input type="file" name="comprobante" accept="image/*" required onChange={handleChange} style={estiloInput} />
          <div style={{display: 'flex', gap: '10px'}}>
            <button type="button" onClick={() => setPaso('RESUMEN')} style={{...estiloBoton, background: '#333'}}>Atrás</button>
            <button type="submit" disabled={cargando} style={estiloBoton}>{cargando ? 'Procesando...' : 'Confirmar Compra'}</button>
          </div>
        </form>
      )}
    </div>
  );
}

const estiloItem = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #333' };
const estiloInput = { width: '100%', padding: '15px', margin: '10px 0', background: '#222', border: '1px solid #333', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' };
const estiloBoton = { background: '#b59410', color: '#000', padding: '15px', border: 'none', width: '100%', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px', marginTop: '10px' };

export default Checkout;