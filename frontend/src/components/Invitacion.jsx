import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "../styles/Invitacion.css";
import Osos from "../assets/image.png";
import IMGLugar from "../assets/lugar.png";

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
    const evento = new Date(añoActual, 5, 8);
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

  if (!mostrarContenido) {
    return (
      <div className="pantalla-carga">
        <h1 className="revelacion-titulo animate-fade">¡Revelación!</h1>
      </div>
    );
  }

  return (
    <div className="invitacion-container">
      <h1 className="invitacion-title" data-aos="fade-up">
        ¡Estás invitado a nuestra revelación de género!
      </h1>
      <div className="elefantes-contenedor" data-aos="zoom-in">
        {/* <img src={babyBoy} alt="¿Maximiliano?" className="elefante" /> */}
        <img src={Osos} alt="¿Luna?" className="elefante" />
      </div>
      <p className="invitacion-subtext" data-aos="fade-up">
        Papá y mamá están felices por mi espera y te invitan descubrir si será 💙 Príncipe o 💖 Princesa
      </p>

      <div className="contador-grid" data-aos="fade-up">
        {["Días", "Horas", "Minutos", "Segundos"].map((etiqueta, i) => (
          <div className="contador-box" key={etiqueta}>
            <div className="valor">
              {String(
                [tiempoRestante.dias, tiempoRestante.horas, tiempoRestante.minutos, tiempoRestante.segundos][i]
              ).padStart(2, "0")}
            </div>
            <div className="etiqueta">{etiqueta}</div>
          </div>
        ))}
      </div>

      {tiempoRestante.terminado ? (
        <div className="texto-final animate-pulse" data-aos="zoom-in">¡Hoy es el gran día! 🎉</div>
      ) : (
        <p className="invitacion-subtext" data-aos="fade-up">
          Te esperamos el 8 de Junio a las 3:00 PM en Apartamentos Cendana, 5 Av. 08‐06 Zona 9, Salón Celebraciones.
          Evento a nombre de Sara De León. ¡No faltes!
        </p>
      )}

      <img src={IMGLugar} alt="Lugar del evento" className="img-lugar" data-aos="fade-up" />

      <button
        onClick={() => navigate("/confirmar")}
        className="boton-confirmar-invitacion"
        data-aos="zoom-in"
      >
        Confirmar asistencia
      </button>
      <div className="te-esperamos">Te esperamos</div>
    </div>
  );
};

export default Invitacion;