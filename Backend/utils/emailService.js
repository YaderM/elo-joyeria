const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const enviarCorreo = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Joyería Elo" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log('✅ Correo enviado con éxito:', info.messageId);
        return true;
    } catch (error) {
        console.error('💥 Error al enviar el correo:', error.message);
        throw error;
    }
};

// Nueva función específica para tu pedido
const enviarNotificacionVenta = async (datosVenta) => {
    const { nombre, email, total, carrito, comprobante } = datosVenta;
    
    const html = `
        <h1>¡Gracias por tu compra, ${nombre}!</h1>
        <p>Hemos recibido tu solicitud de pedido. Detalles:</p>
        <ul>
            ${carrito.map(item => `<li>${item.nombre} - Cantidad: ${item.cantidad} - Precio: ₡${item.precio}</li>`).join('')}
        </ul>
        <p><strong>Total: ₡${total}</strong></p>
        <p>Comprobante adjunto: <a href="${comprobante}">Ver comprobante</a></p>
        <p>El pedido quedará en estado PENDIENTE hasta que sea verificado. Los envíos tardan de 3 a 5 días.</p>
    `;

    // Enviamos copia a ti (info.joyeriaelo@gmail.com) y al cliente
    await enviarCorreo(`${email}, info.joyeriaelo@gmail.com`, 'Nueva solicitud de pedido - Elo Joyería', html);
};

module.exports = { enviarCorreo, enviarNotificacionVenta };