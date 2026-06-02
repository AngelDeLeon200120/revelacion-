const db = require("../config/database.js");
const nodemailer = require("nodemailer");

const enviarConfirmacion = async (req, res) => {
  console.log(req.body);
  const { nombre, email, asistencia, cantidad, placaVehiculo } = req.body;

  if (!nombre || !placaVehiculo) {
    return res.status(400).json({ error: "Nombre y placa son requeridos" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO invitados (nombre, email, asistencia, cantidad, placaVehiculo) VALUES (?, ?, ?, ?, ?)",
      [nombre, email, asistencia, cantidad, placaVehiculo]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const asunto = asistencia
      ? "¡Gracias por confirmar tu asistencia! 🎂🎉"
      : "Gracias por avisarnos 💌";

    const lugarHTML = asistencia
      ? `
      <p>📍 Ubicación del evento:</p>
      <ul>
        <li><a href="https://www.google.com/maps/place/Zoológico+La+Aurora/@14.5893,-90.5724,17z" target="_blank">Google Maps — Zoológico La Aurora</a></li>
        <li><a href="https://www.waze.com/es-419/live-map/directions?to=ll.14.5893%2C-90.5724" target="_blank">Waze</a></li>
      </ul>
      `
      : "";

    const mensajeHTML = `
      <h2>Hola ${nombre},</h2>
      <p>${
        asistencia
          ? `¡Nos alegra muchísimo que puedas acompañarnos a celebrar el <strong>primer cumpleaños de Juan Ignacio</strong>! 🎂🦁<br><br>
             Te esperamos el <strong>sábado 27 de Septiembre de 2026</strong> a las <strong>3:30 PM</strong> en el
             <strong>Zoológico La Aurora</strong>, Ciudad de Guatemala.<br><br>
             ¡Será una celebración llena de alegría y amor! 💙`
          : "Lamentamos que no puedas asistir. Gracias por avisarnos, te tendremos presente 💔"
      }</p>
      <img src="https://revelacion-backend.onrender.com/assets/bb2.jpg" alt="Juan Ignacio" style="width: 100%; max-width: 400px; border-radius: 10px; margin: 20px 0;" />
      ${lugarHTML}
      <p>Con mucho cariño,<br>Familia De León Méndez 💙</p>
    `;

    await transporter.sendMail({
      from: `"Cumpleaños Juan Ignacio 🎂" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: asunto,
      html: mensajeHTML,
    });

    res.json({
      success: true,
      message: "Confirmación enviada con éxito",
      data: { id: result.insertId, nombre, email, asistencia, cantidad },
    });
  } catch (error) {
    console.error("Error en enviarConfirmacion:", error);
    res.status(500).json({
      success: false,
      error: "Error al procesar la confirmación",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

const obtenerInvitados = async (req, res) => {
  try {
    const [results] = await db.query(
      "SELECT id, nombre, email, asistencia, cantidad, placaVehiculo, fecha_confirmacion " +
      "FROM invitados ORDER BY fecha_confirmacion DESC"
    );

    const stats = results.reduce(
      (acc, inv) => {
        const cantidad = parseInt(inv.cantidad) || 1;
        acc.total += cantidad;
        if (inv.asistencia) acc.confirmados += cantidad;
        else acc.noConfirmados += cantidad;
        return acc;
      },
      { total: 0, confirmados: 0, noConfirmados: 0 }
    );

    const invitadosFormateados = results.map((inv) => ({
      ...inv,
      created_at: inv.fecha_confirmacion,
    }));

    res.json({
      success: true,
      data: { invitados: invitadosFormateados, estadisticas: stats },
    });
  } catch (error) {
    console.error("Error en obtenerInvitados:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener la lista de invitados",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

module.exports = { enviarConfirmacion, obtenerInvitados };