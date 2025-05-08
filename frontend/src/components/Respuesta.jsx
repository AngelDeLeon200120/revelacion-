// src/components/Respuesta.jsx
import { useLocation } from "react-router-dom";
import IMGLugar from "../assets/image.png";

const Respuesta = () => {
  const location = useLocation();
  const { nombre, asistencia, cantidad } = location.state || {};

  if (!nombre) {
    return <p>Acceso no válido. Por favor confirma desde el formulario.</p>;
  }

  return (
    <div className="success-message">
      {asistencia === "true" ? (
        <>
          <h2>🎉 ¡Gracias {nombre} por confirmar!</h2>
          <p>Asistirás con {cantidad} persona(s). Aquí tienes la ubicación:</p>
          <ul>
            <li>
              <a
                href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!2sCdad.+de+Guatemala+01009!2m2!1d-90.5213375!2d14.607005!3m5!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!8m2!3d14.6070221!4d-90.5214354!16s%2Fg%2F11lkkbklz_"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            </li>
            <li>
              <a
                href="https://www.waze.com/es-419/live-map/directions?locale=es-419&utm_campaign=share_drive&utm_source=waze_app&utm_medium=undefined&to=ll.14.5293312%2C-90.5773056&from=place.w.176619666.1766065589.28314770"
                target="_blank"
                rel="noopener noreferrer"
              >
                Waze
              </a>
            </li>
          </ul>
          <p className="invitacion-subtext">
          Te esperamos el 8 de Junio a las 3:00 PM en Apartamentos Cendana, 5 Av. 08‐06 Zona 9, Salón Celebraciones.
          Evento a nombre de Sara De León. ¡No faltes!
          </p>
          <img src={IMGLugar} alt="Lugar del evento" style={{ width: '100%' }} />
        </>
      ) : (
        <>
          <h2>😢 Lamentamos que no puedas asistir, {nombre}</h2>
          <p>Gracias por hacérnoslo saber. ¡Te tendremos presente en espíritu!</p>
        </>
      )}
    </div>
  );
};

export default Respuesta;
