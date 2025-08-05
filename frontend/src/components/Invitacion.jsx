import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/Invitacion.css";
import Osos from "../assets/invitacion.jpg";
import IMGLugar from "../assets/lugar.png";
import bbeleon from "../assets/bb2.jpg";

import Musica from "../assets/musica.mp3"; // archivo de música

const Invitacion = () => {
  const navigate = useNavigate();
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    terminado: false,
  });

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const confirmacion = localStorage.getItem("confirmacion");
    if (confirmacion) {
      navigate("/respuesta", { state: JSON.parse(confirmacion) });
    }

    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const evento = new Date(añoActual, 7, 31);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMostrarContenido(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const audio = new Audio(Musica);
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
      audio.play().catch(() => {
        console.warn(
          "El navegador bloqueó la reproducción automática de audio."
        );
      });
    };

    document.addEventListener("click", playAudio, { once: true });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", playAudio);
    };
  }, []);

  if (!mostrarContenido) {
    return (
      <div className="pantalla-carga">
        <h1 className="revelacion-titulo animate-fade">Baby Shower</h1>
        {/* <div>
          <h1 className="revelacion-titulo2 animate-fade">Baby Shower</h1>
        </div> */}
      </div>
    );
  }

  return (
    <div className="invitacion-container">
      <h1 className="invitacion-title" data-aos="fade-up">
        Estás invitado a nuestro Baby Shower De:
      </h1>
      {/* <div className="elefantes-contenedor" data-aos="zoom-in">
        <img src={Osos} alt="¿Luna?" className="elefante" />
      </div> */}
      <div className="nombres" data-aos="fade-up">
        <p>
          <span className="daniel">Juan Ignacio</span>
        </p>

        <img
        src={bbeleon}
        alt="Lugar del evento"
        className="img-lugar"
        data-aos="fade-up"
      />
        {/* <p className="y">y</p>
        <p>
          <span className="andrea">Andrea</span>
        </p> */}
      </div>
      <p className="invitacion-subtext" data-aos="fade-up">
        Nos llena de alegría compartir contigo que se acerca la llegada de
        nuestro pequeño <strong>Juan Ignacio</strong>. Por eso, queremos
        celebrar juntos.
      </p>

      {/* <p className="principes">
        <span className="Príncipe">💙Príncipe</span>
        <span>o</span> <span className="Princesa">Princesa💖</span>
      </p> */}

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

      {tiempoRestante.terminado ? (
        <div className="texto-final animate-pulse" data-aos="zoom-in">
          ¡Hoy es el gran día! 🎉
        </div>
      ) : (
        <p className="invitacion-subtext" data-aos="fade-up">
          🎉 <strong>¡Estás cordialmente invitado!</strong>
          <br />
          📅 <strong>Domingo 31 de Agosto</strong> a las <strong>2:00 PM</strong>
          <br />
          📍 <strong>Salón Celebraciones</strong>, Apartamentos Cendana
          <br />
          <em>(5ta. Av. 08-06, Zona 9)</em>
          <br />
          👶 Este evento especial está a nombre de <strong>Sara De León</strong>
          <br />
          💖 ¡Será un honor contar con tu presencia!
        </p>
      )}
      <button
        onClick={() => navigate("/confirmar")}
        className="boton-confirmar-invitacion"
        data-aos="zoom-in"
      >
        Confirmar asistencia
      </button>
      <img
        src={IMGLugar}
        alt="Lugar del evento"
        className="img-lugar"
        data-aos="fade-up"
      />

      <div className="te-esperamos" data-aos="fade-up">
        Te esperamos
      </div>
    </div>
  );
};

export default Invitacion;
