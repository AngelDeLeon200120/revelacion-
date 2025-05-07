import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ConfirmacionForm.css";
import IMGLugar from "../assets/image.png";
import { useNavigate } from "react-router-dom";

const ConfirmacionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asistencia: true,
    cantidad: 1,
  });

  // const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "radio" ? value === "true" : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://revelacion-backend.onrender.com/api/invitados/confirmar",
        formData
      );
      // const numero = "50230268381";
      // const nombre = encodeURIComponent(formData.nombre);
      // const asistencia = formData.asistencia;
      // const ubicacion = "Ubicación del evento: https://waze.com/ul?ll=14.6070221,-90.5214354&navigate=yes";

      // const mensaje = asistencia
      // //   ? `¡Hola! Soy ${nombre} y sí asistiré a la revelación de género 💙💗 con ${formData.cantidad} persona(s). ${ubicacion}`
      //   : `Hola, soy ${nombre}, lamentablemente no podré asistir 😢`;

      // const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
      // window.open(url, "_blank");
    } catch (error) {
      alert("Error al enviar confirmación.", error);
    } finally {
      const confirmacion = {
        nombre: formData.nombre,
        asistencia: String(formData.asistencia),
        cantidad: formData.cantidad,
      };
      localStorage.setItem("confirmacion", JSON.stringify(confirmacion));
      navigate("/respuesta", { state: confirmacion });
    }
  };
  useEffect(() => {
    const confirmacion = localStorage.getItem("confirmacion");
    if (confirmacion) {
      navigate("/respuesta", { state: JSON.parse(confirmacion) });
    }
  }, []);
  // if (enviado)
  //   return (
  //     <div className="success-message">
  //       <h2>🎉 ¡Gracias por tu respuesta!</h2>
  //       <p>
  //         Si confirmaste tu asistencia, aquí tienes la ubicación del evento:
  //       </p>
  //       <ul>
  //         <li>
  //           <a
  //             href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!2sCdad.+de+Guatemala+01009!2m2!1d-90.5213375!2d14.607005!3m5!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!8m2!3d14.6070221!4d-90.5214354!16s%2Fg%2F11lkkbklz_?entry=ttu&g_ep=EgoyMDI1MDUwMy4wIKXMDSoASAFQAw%3D%3D"
  //             target="_blank"
  //             rel="noopener noreferrer"
  //           >
  //             Google Maps
  //           </a>
  //         </li>
  //         <li>
  //           <a
  //             href="https://www.waze.com/es-419/live-map/directions?locale=es-419&utm_campaign=share_drive&utm_source=waze_app&utm_medium=undefined&to=ll.14.5293312%2C-90.5773056&from=place.w.176619666.1766065589.28314770"
  //             target="_blank"
  //             rel="noopener noreferrer"
  //           >
  //             Waze
  //           </a>
  //         </li>
  //       </ul>
  //       <p className="invitacion-subtext">
  //         Te esperamos el 8 de Junio en Apartamentos Cendana. 5 Av. 08‐06 Zona 9,
  //         Salón Celebraciones. Evento a nombre de Sara De Leon, para compartir
  //         esta gran sorpresa con nosotros. ¡No faltes, tu presencia es muy
  //         importante!
  //       </p>
  //       <img src={IMGLugar} alt="Imagen del lugar" />
  //     </div>
  //   );

  return (
    <form onSubmit={handleSubmit}>
      <h2>¿Nos acompañas?</h2>

      <input
        type="text"
        name="nombre"
        placeholder="Tu nombre"
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Tu correo"
        onChange={handleChange}
        required
      />

      <label className="radio-label">¿Cuántas personas asistirán?</label>
      <label className="radio-text-familia">Recuerda solo miembros de la familia</label>
      <input
        type="number"
        name="cantidad"
        min="1"
        value={formData.cantidad}
        onChange={handleChange}
        required
      />

      <div className="radio-container">
        <label className="radio-label">
          <input
            type="radio"
            name="asistencia"
            value="true"
            checked={formData.asistencia === true}
            onChange={handleChange}
          />
          Sí asistiré
        </label>

        <label className="radio-label">
          <input
            type="radio"
            name="asistencia"
            value="false"
            checked={formData.asistencia === false}
            onChange={handleChange}
          />
          No podré asistir
        </label>
      </div>

      <button type="submit" className="boton-confirmar">
        Confirmar
      </button>
    </form>
  );
};

export default ConfirmacionForm;
