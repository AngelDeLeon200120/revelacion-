import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import IMGLugar from "../assets/regalos.png";
import Leon from "../assets/leoncorona.jpeg";
// import osogirl from "../assets/osogirl.jpg";
import musica from "../assets/musica.mp3";

import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/Respuesta.css";

const Respuesta = () => {
  const location = useLocation();
  const { nombre, asistencia, cantidad } = location.state || {};

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    terminado: false,
  });

  useEffect(() => {
    AOS.init({ duration: 1000 });

    // Configuración del contador
    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const evento = new Date(añoActual, 7, 31); // 8 de junio
    if (ahora > evento) evento.setFullYear(añoActual + 1);

    const actualizarContador = () => {
      const ahora = new Date();
      const diferencia = evento - ahora;
      if (diferencia <= 0) {
        setTiempoRestante((prev) => ({ ...prev, terminado: true }));
        return;
      }
      const segundos = Math.floor(diferencia / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);
      setTiempoRestante({
        dias,
        horas: horas % 24,
        minutos: minutos % 60,
        segundos: segundos % 60,
        terminado: false,
      });
    };

    actualizarContador();
    const intervalo = setInterval(actualizarContador, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (!nombre) {
    return (
      <p className="acceso-denegado">
        Acceso no válido. Por favor confirma desde el formulario.
      </p>
    );
  }

  return (
    <div className="respuesta-container">
      <audio ref={audioRef} src={musica} loop />
      <button className="btn-musica" onClick={toggleAudio}>
        {isPlaying ? "🔊" : "🔈"}
      </button>

      {asistencia === "true" ? (
        <>
          <h2 className="titulo-confirmado" data-aos="fade-down">
            🎉 ¡Gracias {nombre} por confirmar!
          </h2>
          

          {tiempoRestante.terminado && (
            <div className="texto-final animate-pulse" data-aos="zoom-in">
              ¡Hoy es el gran día! 🎉
            </div>
          )}

          <div className="detalles-evento" data-aos="fade-up">
          <p>
              Acompáñanos al Baby Shower de <strong>Juan Ignacio</strong>💙 
            </p>
            <img
              src={Leon}
              alt="Niño"
              className="imagen-lugar"
              data-aos="zoom-in"
            />
            {/* <p>
              💖 Si crees que es <strong>princesa</strong>, vístete de rosado
            </p>
            <img
              src={osogirl}
              alt="Niña"
              className="imagen-lugar"
              data-aos="zoom-in"
            /> */}
            <p>🎁 Contribución: un regalo para bebé</p>
            <p>¡muchas gracias!</p>
            <img
            src={IMGLugar}
            alt="Lugar del evento"
            className="imagen-lugar"
            data-aos="zoom-in"
          />
            <p
              style={{
                fontSize: "1.5rem",
                lineHeight: "1.6",
                textAlign: "center",
                color: "#444",
              }}
            >
              🎉 <strong>¡Estás cordialmente invitado!</strong>
              <br />
              📅 <strong>Domingo 31 de Agosto</strong> a las{" "}
              <strong>2:00 PM</strong>
              <br />
              📍 <strong>Salón Celebraciones</strong>, Apartamentos Cendana
              <br />
              <em>(5ta. Av. 08-06, Zona 9)</em>
              <br />
              👶 Este evento especial está a nombre de{" "}
              <strong>Sara De León</strong>
              <br />
              💖 ¡Será un honor contar con tu presencia!
            </p>

          </div>

          <p className="detalle-asistencia" data-aos="fade-up">
            Asistirás con <strong>{cantidad}</strong> persona(s). Aquí tienes la
            ubicación:
          </p>
          <ul className="links-mapas" data-aos="zoom-in">
            <li>
              <a
                href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z/data=!4m16!1m9!4m8!1m0!1m6!1m2!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!2sCdad.+de+Guatemala+01009!2m2!1d-90.5213375!2d14.607005!3m5!1s0x8589a3ada5f98ed9:0x4848a3521f81dd2d!8m2!3d14.6070221!4d-90.5214354!16s%2Fg%2F11lkkbklz_"
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 Google Maps
              </a>
            </li>
            <li>
              <a
                href="https://www.waze.com/es-419/live-map/directions?locale=es-419&utm_campaign=share_drive&utm_source=waze_app&utm_medium=undefined&to=ll.14.5293312%2C-90.5773056&from=place.w.176619666.1766065589.28314770"
                target="_blank"
                rel="noopener noreferrer"
              >
                🚗 Waze
              </a>
            </li>
          </ul>

          <div className="contador-grid" data-aos="fade-up">
            {["Días", "Horas", "Minutos", "Segundos"].map((etiqueta, i) => (
              <div className="contador-box" key={etiqueta}>
                <div className="valor">
                  {String(
                    [
                      tiempoRestante.dias,
                      tiempoRestante.horas,
                      tiempoRestante.minutos,
                      tiempoRestante.segundos,
                    ][i]
                  ).padStart(2, "0")}
                </div>
                <div className="etiqueta">{etiqueta}</div>
              </div>
            ))}
          </div>

          <p className="gmail">Recuerda revisar tu correo</p>
        </>
      ) : (
        <>
          <h2 className="titulo-noasiste" data-aos="fade-down">
            😢 Lamentamos que no puedas asistir, {nombre}
          </h2>
          <p className="detalle-noasiste" data-aos="fade-up">
            Gracias por hacérnoslo saber. ¡Te tendremos presente en espíritu!
          </p>
        </>
      )}
    </div>
  );
};

export default Respuesta;
