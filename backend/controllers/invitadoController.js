const db = require("../config/database.js");
const nodemailer = require("nodemailer");

const enviarConfirmacion = async (req, res) => {
  const { nombre, email, asistencia, cantidad } = req.body;

  try {
    // Insertar en base de datos
    const sql = `INSERT INTO invitados (nombre, email, asistencia,cantidad) VALUES (?, ?, ?,?)`;
    db.query(
      sql,
      [nombre, email, asistencia, cantidad],
      async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Enviar correo al invitado
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        const asunto = asistencia
          ? "¡Gracias por confirmar tu asistencia! 🎉"
          : "Gracias por avisarnos 💌";
        const lugar = `
        <p>📍 Ubicación del evento:</p>
        <ul>
          <li><a href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!2sCdad.+de+Guatemala+01009!2m2!1d-90.5213375!2d14.607005!3m5!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!8m2!3d14.6070221!4d-90.5214354!16s%2Fg%2F11lkkbklz_?entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D" target="_blank">Google Maps</a></li>
          <li><a href="https://www.waze.com/es-419/live-map/directions?locale=es-419&utm_campaign=share_drive&utm_source=waze_app&utm_medium=undefined&to=ll.14.5293312%2C-90.5773056&from=place.w.176619666.1766065589.28314770" target="_blank">Waze</a></li>
        </ul>
      `;
        const mensajeHTML = `
  <h2>Hola ${nombre},</h2>
  <p>${
    asistencia
      ? "¡Nos alegra que puedas acompañarnos en la revelación de género! 💙💗"
      : "Lamentamos que no puedas asistir. Gracias por avisarnos 💔"
  }</p>
  ${asistencia ? lugar : ""}
  <p>Con cariño,<br>Los organizadores</p>
`;

        await transporter.sendMail({
          from: `"Revelación de Género" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: asunto,
          html: mensajeHTML,
        });

        res.json({ mensaje: "Confirmación enviada con éxito" });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar confirmación" });
  }
};

const obtenerInvitados = (req, res) => {
  const sql =
    "SELECT nombre, email, asistencia, cantidad FROM invitados ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { enviarConfirmacion, obtenerInvitados };
