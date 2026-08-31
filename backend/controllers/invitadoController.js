const db = require("../config/database.js");
const nodemailer = require("nodemailer");

// URL pública del backend (para imágenes embebidas en los correos).
const PUBLIC_URL = (process.env.API_PUBLIC_URL || "http://localhost:3001").replace(/\/$/, "");

const enviarConfirmacion = async (req, res) => {
  console.log(req.body);
  const { nombre, email, asistencia, cantidad } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO invitados (nombre, email, asistencia, cantidad) VALUES (?, ?, ?, ?)",
      [nombre, email, asistencia, cantidad]
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
        <li><a href="https://www.google.com/maps/place/Zool%C3%B3gico+La+Aurora/@14.5989504,-90.5284319,17z/data=!4m15!1m8!3m7!1s0x8589a162b49a51fd:0x179ee84e18f07f06!2sZool%C3%B3gico+La+Aurora!8m2!3d14.5989452!4d-90.525857!10e8!16s%2Fm%2F03nwgf6!3m5!1s0x8589a162b49a51fd:0x179ee84e18f07f06!8m2!3d14.5989452!4d-90.525857!16s%2Fm%2F03nwgf6?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D" target="_blank">Google Maps — Zoológico La Aurora</a></li>
        <li><a href="https://www.waze.com/es/live-map/directions/zoologico-la-aurora-parqueo-zoologico-la-aurora-zona-13,-guatemala?to=place.w.176619666.1766000052.408455" target="_blank">Waze</a></li>
      </ul>
      `
      : "";

    const mensajeHTML = `
      <h2>Hola ${nombre},</h2>
      <p>${
        asistencia
          ? `¡Nos alegra muchísimo que puedas acompañarnos a celebrar el <strong>primer cumpleaños de Juan Ignacio</strong>! 🎂🦁<br><br>
             Te esperamos el <strong>Domingo 27 de Septiembre de 2026</strong> a las <strong>3:00 PM</strong> en el
             <strong>Zoológico La Aurora, salón La Colmena</strong> Ciudad de Guatemala.<br><br>
             ¡Será una celebración llena de alegría y amor! 💙`
          : "Lamentamos que no puedas asistir. Gracias por avisarnos, te tendremos presente 💔"
      }</p>
      <img src="${PUBLIC_URL}/assets/bb2.jpg" alt="Juan Ignacio" style="width: 100%; max-width: 400px; border-radius: 10px; margin: 20px 0;" />
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
      "SELECT id, nombre, email, asistencia, cantidad, fecha_confirmacion " +
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