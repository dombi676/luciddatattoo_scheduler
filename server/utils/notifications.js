const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const db = require('../config/database');

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send confirmation email to client
async function sendConfirmationEmail(clientEmail, appointmentDetails) {
  const { clientName, tattooDescription, appointmentDate, startTime, endTime, duration } = appointmentDetails;
  
  const formattedDate = moment(appointmentDate).format('dddd, MMMM Do YYYY');
  const durationHours = Math.floor(duration / 60);
  const durationMins = duration % 60;
  const durationText = durationHours > 0 
    ? `${durationHours}h ${durationMins > 0 ? durationMins + 'm' : ''}`
    : `${durationMins}m`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Cita - Lucidda Tattoo</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; }
        .appointment-details { background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LUCIDDA TATTOO</div>
          <p>Jujuy, Argentina</p>
        </div>
        
        <h2>¡Hola ${clientName}!</h2>
        
        <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
        
        <div class="appointment-details">
          <div class="detail-row">
            <span class="label">Fecha:</span>
            <span>${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Hora:</span>
            <span>${startTime} - ${endTime}</span>
          </div>
          <div class="detail-row">
            <span class="label">Duración:</span>
            <span>${durationText}</span>
          </div>
          <div class="detail-row">
            <span class="label">Tatuaje:</span>
            <span>${tattooDescription}</span>
          </div>
        </div>
        
        <h3>Instrucciones importantes:</h3>
        <ul>
          <li>Llega 10 minutos antes de tu cita</li>
          <li>Trae tu DNI</li>
          <li>Asegúrate de haber comido antes de la sesión</li>
          <li>Usa ropa cómoda que permita acceso al área a tatuar</li>
        </ul>
        
        <p>Para cuidados post-tatuaje, visita: <a href="https://lucidda.tattoo/cuidados">lucidda.tattoo/cuidados</a></p>
        
        <p>Si necesitas cancelar o reprogramar, contacta a Lucia lo antes posible por WhatsApp.</p>
        
        <div class="footer">
          <p>Lucidda Tattoo Studio<br>
          Jujuy, Argentina<br>
          <a href="https://lucidda.tattoo">lucidda.tattoo</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Lucidda Tattoo" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `Confirmación de Cita - ${formattedDate} ${startTime}`,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to:', clientEmail);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

// Send push notification to artist
async function sendNotificationToArtist(userId, appointmentDetails, io) {
  const { clientName, tattooDescription, appointmentDate, startTime, clientEmail } = appointmentDetails;
  
  try {
    // Get user's push token
    const result = await db.query(
      'SELECT push_token, name FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];
    const formattedDate = moment(appointmentDate).format('dddd, DD/MM/YYYY');

    // Send real-time notification via Socket.io
    if (io) {
      io.emit('new-appointment', {
        userId,
        message: `Nueva cita: ${clientName} - ${formattedDate} ${startTime}`,
        appointmentDetails: {
          clientName,
          clientEmail,
          tattooDescription,
          appointmentDate,
          startTime
        }
      });
    }

    // TODO: Implement APNS push notification
    // if (user.push_token) {
    //   await sendAPNSNotification(user.push_token, {
    //     title: 'Nueva Cita Reservada',
    //     body: `${clientName} - ${formattedDate} ${startTime}`,
    //     data: appointmentDetails
    //   });
    // }

    console.log('✅ Notification sent to artist:', user.name);
  } catch (error) {
    console.error('❌ Artist notification failed:', error);
    throw error;
  }
}

// TODO: Implement APNS notification
async function sendAPNSNotification(pushToken, notification) {
  // This would require setting up Apple Push Notification service
  // For now, we'll just log what would be sent
  console.log('📱 APNS Notification (TODO):', {
    pushToken: pushToken.substring(0, 20) + '...',
    notification
  });
}

module.exports = {
  sendConfirmationEmail,
  sendNotificationToArtist,
  sendAPNSNotification
};
