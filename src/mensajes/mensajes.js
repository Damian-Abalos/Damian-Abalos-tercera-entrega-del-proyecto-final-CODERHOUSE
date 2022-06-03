const twilio = require("twilio");
require("nodemailer").createTransport;
require("dotenv").config();

const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const adminMail = process.env.ADMIN_MAIL;

const client = twilio(accountSid, authToken);

const enviarSms = async (to) => {
  try {
    const message = await client.messages.create({
      body: "Su pedido ha sido recibido y se encuentra en proceso.",
      from: "+19379362607",
      to: to,
    });
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};

const enviarWhatsapp = async (usuarioNombre, usuarioTelefono) => {
  try {
    const message = await client.messages.create({
      body: `nuevo pedido de ${usuarioNombre}`,
      mediaUrl: [
        "https://pymstatic.com/98912/conversions/cursos-motivacion-default.jpg",
      ],
      from: "whatsapp:+14155238886",
      to: `whatsapp:${usuarioTelefono}`,
    });
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};

const enviarMail = async (usuarioNombre, productosComprados) => {  
  const transporter = createTransport({
      service: 'gmail',
      port: 587,
      auth: {
          user: adminMail,
          pass: 'ofznioubsfoytlta'
      }
  });
  
  const mailOptions = {
      from: 'Tercera entrega backend',
      to: adminMail,
      subject: `Nuevo pedido de ${usuarioNombre}`,
      html: productosComprados
  }
  
  try {
      const info = await transporter.sendMail(mailOptions)
      console.log(info)
  } catch (error) {
      console.log(error)
  }
}

module.exports = {
  enviarSms,
  enviarWhatsapp,
  enviarMail
}
