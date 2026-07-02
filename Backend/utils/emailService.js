const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración del transportador usando las variables de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Función para enviar correos electrónicos
 * @param {string} to - Correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Cuerpo del mensaje en formato HTML
 */
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

module.exports = { enviarCorreo };