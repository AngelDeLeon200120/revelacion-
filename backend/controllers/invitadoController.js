const db = require("../config/database.js");
const nodemailer = require("nodemailer");

const enviarConfirmacion = async (req, res) => {
  console.log(req.body);
  const { nombre, email, asistencia, cantidad, placaVehiculo } = req.body;

  // Validación básica
  if (!nombre || !placaVehiculo) {
    return res.status(400).json({ error: "Nombre y email son requeridos" });
  }

  try {
    // Insertar en base de datos
    const [result] = await db.query(
      "INSERT INTO invitados (nombre, email, asistencia, cantidad, placaVehiculo) VALUES (?, ?, ?, ?, ?)",
      [nombre, email, asistencia, cantidad, placaVehiculo]
    );

    // Configurar transporte de email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Solo para desarrollo
      },
    });

    const asunto = asistencia
      ? "¡Gracias por confirmar tu asistencia! 🎉"
      : "Gracias por avisarnos 💌";

    const lugarHTML = asistencia
      ? `
      <p>📍 Ubicación del evento:</p>
      <ul>
        <li><a href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!2sCdad.+de+Guatemala+01009!2m2!1d-90.5213375!2d14.607005!3m5!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!8m2!3d14.6070221!4d-90.5214354!16s%2Fg%2F11lkkbklz_?entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D" target="_blank">Google Maps</a></li>
        <li><a href="https://www.waze.com/es-419/live-map/directions?locale=es-419&utm_campaign=share_drive&utm_source=waze_app&utm_medium=undefined&to=ll.14.5293312%2C-90.5773056&from=place.w.176619666.1766065589.28314770" target="_blank">Waze</a></li>
      </ul>
    `
      : "";

    const mensajeHTML = `
      <h2>Hola ${nombre},</h2>
      <p>${
        asistencia
          ? "¡Nos alegra que puedas acompañarnos para el baby shower!, recuerda. Los esperamos el domingo 31 de Agosto 📅 a las 2:00 PM en el Salón Celebraciones de Apartamentos Cendana (5ta. Av. 08-06, Zona 9). Este evento especial está a nombre de Sara De León. ¡Será un honor contar con tu presencia! 💙"
          : "Lamentamos que no puedas asistir. Gracias por avisarnos 💔"
      }</p>
      <img src="https://revelacion-backend.onrender.com/assets/bb2.jpg" alt="BabyShower" style="width: 100%; max-width: 400px; border-radius: 10px; margin: 20px 0;" />
      ${lugarHTML}
      <p>Con cariño,<br>Familia De Leon Méndez
    `;

    await transporter.sendMail({
      from: `"Revelación de Género" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: asunto,
      html: mensajeHTML,
    });

    res.json({
      success: true,
      message: "Confirmación enviada con éxito",
      data: {
        id: result.insertId,
        nombre,
        email,
        asistencia,
        cantidad,
      },
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
    // Consulta actualizada para usar fecha_confirmacion en lugar de created_at
    const [results] = await db.query(
  "SELECT id, nombre, email, asistencia, cantidad, placaVehiculo, fecha_confirmacion " +
  "FROM invitados ORDER BY fecha_confirmacion DESC"
);

    // Calcular totales
    const stats = results.reduce(
      (acc, inv) => {
        const cantidad = parseInt(inv.cantidad) || 1;
        acc.total += cantidad;
        if (inv.asistencia) {
          acc.confirmados += cantidad;
        } else {
          acc.noConfirmados += cantidad;
        }
        return acc;
      },
      { total: 0, confirmados: 0, noConfirmados: 0 }
    );

    // Formatear resultados para el frontend
    const invitadosFormateados = results.map((inv) => ({
      ...inv,
      // Mantener compatibilidad con frontend usando created_at
      created_at: inv.fecha_confirmacion,
    }));

    res.json({
      success: true,
      data: {
        invitados: invitadosFormateados,
        estadisticas: stats,
      },
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
