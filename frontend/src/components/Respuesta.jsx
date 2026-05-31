import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import IMGLugar from "../assets/regalos.png";
import Leon from "../assets/leoncorona.jpeg";
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
    dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: false,
  });

  // Refs GSAP
  const heroImgRef = useRef(null);
  const heroSectionRef = useRef(null);
  const leonImgRef = useRef(null);
  const leonSectionRef = useRef(null);
  const lugarImgRef = useRef(null);
  const lugarSectionRef = useRef(null);
  const contadorRef = useRef(null);
  const gsapLoaded = useRef(false);

  useEffect(() => {
    AOS.init({ duration: 900 });

    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    const evento = new Date(añoActual, 7, 31);
    if (ahora > evento) evento.setFullYear(añoActual + 1);

    const actualizarContador = () => {
      const ahora = new Date();
      const dif = evento - ahora;
      if (dif <= 0) { setTiempoRestante((p) => ({ ...p, terminado: true })); return; }
      const s = Math.floor(dif / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
      setTiempoRestante({ dias: d, horas: h % 24, minutos: m % 60, segundos: s % 60, terminado: false });
    };

    actualizarContador();
    const iv = setInterval(actualizarContador, 1000);
    return () => clearInterval(iv);
  }, []);

  // GSAP
useEffect(() => {
  if (gsapLoaded.current || asistencia !== "true") return;

  const init = async () => {
    let gsap, ScrollTrigger;

    try {
      const g = await import("gsap");
      const st = await import("gsap/ScrollTrigger");
      gsap = g.gsap || g.default;
      ScrollTrigger = st.ScrollTrigger;
    } catch {
      await loadGSAPFromCDN();
      gsap = window.gsap;
      ScrollTrigger = window.ScrollTrigger;
    }

    if (!gsap) {
      console.warn("GSAP no cargó correctamente");
      gsapLoaded.current = true;
      return;
    }

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    window.gsap = gsap;
    gsapLoaded.current = true;

    // === ANIMACIONES ===

    // Hero parallax
    if (heroImgRef.current && heroSectionRef.current) {
      gsap.to(heroImgRef.current, {
        scale: 1.15,
        y: 60,
        ease: "none",
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    // León image
    if (leonImgRef.current && leonSectionRef.current) {
      gsap.fromTo(
        leonImgRef.current,
        { scale: 0.9, opacity: 0.5 },
        {
          scale: 1.05,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: leonSectionRef.current,
            start: "top 80%",
            end: "center 40%",
            scrub: 1,
          },
        }
      );
    }

    // Regalos image
    if (lugarImgRef.current && lugarSectionRef.current) {
      gsap.fromTo(
        lugarImgRef.current,
        { y: 40, scale: 0.95 },
        {
          y: -40,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: lugarSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        }
      );
    }

    // === CONTADOR - ANIMACIÓN FIJA ===
    if (contadorRef.current) {
      const boxes = contadorRef.current.querySelectorAll(".r-contador-box");
      if (boxes.length > 0) {
        gsap.fromTo(
          boxes,
          { 
            opacity: 0, 
            y: 40, 
            scale: 0.7 
          },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            stagger: 0.1, 
            duration: 0.8, 
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: contadorRef.current,
              start: "top 85%",
            },
          }
        );
      }
    }
  };

  init();
}, [asistencia]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  if (!nombre) {
    return (
      <p className="acceso-denegado">
        Acceso no válido. Por favor confirma desde el formulario.
      </p>
    );
  }

  if (asistencia !== "true") {
    return (
      <div className="respuesta-no-asiste">
        <div className="no-asiste-card" data-aos="fade-up">
          <div className="no-asiste-emoji">😢</div>
          <h2>Lamentamos que no puedas asistir, {nombre}</h2>
          <p>Gracias por hacérnoslo saber. ¡Te tendremos presente en espíritu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="respuesta-wrapper">
      <audio ref={audioRef} src={musica} loop />

      <button className="btn-musica" onClick={toggleAudio} aria-label="Música">
        {isPlaying ? "🔊" : "🔈"}
      </button>

      {/* ── HERO ── */}
      <section className="r-hero-section" ref={heroSectionRef}>
        <div className="r-hero-img-wrap" ref={heroImgRef}>
          <img src={Leon} alt="Juan Ignacio" className="r-hero-img" />
          <div className="r-hero-overlay" />
        </div>
        <div className="r-hero-content" data-aos="fade-up">
          <p className="r-hero-eyebrow">¡Muchas gracias!</p>
          <h1 className="r-hero-title">
            🎉 {nombre}
          </h1>
          <p className="r-hero-sub">Tu asistencia ha sido confirmada con amor 💙</p>
        </div>
      </section>

      {/* ── DETALLES DEL EVENTO ── */}
      <section className="r-section-detalles">
        <div className="r-detalles-grid">
          <div className="r-detalles-text" data-aos="fade-right">
            <h2 className="r-section-title">El gran día 💙</h2>
            <p className="r-body-text">
              Acompáñanos al Baby Shower de <strong>Juan Ignacio</strong>
            </p>
            <div className="r-info-box">
              <div className="r-info-item">
                <span>📅</span>
                <span><strong>Domingo 31 de Agosto</strong></span>
              </div>
              <div className="r-info-item">
                <span>🕑</span>
                <span><strong>2:00 PM</strong></span>
              </div>
              <div className="r-info-item">
                <span>📍</span>
                <span>Salón Celebraciones, Apartamentos Cendana<br /><em>5ta. Av. 08-06, Zona 9</em></span>
              </div>
              <div className="r-info-item">
                <span>👥</span>
                <span>Asistirás con <strong>{cantidad}</strong> persona(s)</span>
              </div>
            </div>
            <div className="r-mapas">
              <a href="https://www.google.com/maps/place/Apartamentos+Cendana/@14.6070273,-90.5240103,17z" target="_blank" rel="noopener noreferrer" className="r-mapa-btn">📍 Google Maps</a>
              <a href="https://www.waze.com/es-419/live-map/directions?to=ll.14.5293312%2C-90.5773056" target="_blank" rel="noopener noreferrer" className="r-mapa-btn waze">🚗 Waze</a>
            </div>
          </div>

          <div className="r-leon-wrap" ref={leonSectionRef} data-aos="fade-left">
            <div className="r-leon-overflow">
              <img src={Leon} alt="Juan Ignacio" className="r-leon-img" ref={leonImgRef} />
            </div>
            <div className="r-leon-deco" />
          </div>
        </div>
      </section>

      {/* ── CONTADOR ── */}
      <section className="r-section-contador">
        <div className="r-contador-bg" />
        <h2 className="r-contador-title" data-aos="fade-up">Faltan solo...</h2>
        <div className="r-contador-grid" ref={contadorRef}>
          {["Días","Horas","Minutos","Segundos"].map((e, i) => (
            <div className="r-contador-box" key={e}>
              <div className="r-valor">
                {String([tiempoRestante.dias,tiempoRestante.horas,tiempoRestante.minutos,tiempoRestante.segundos][i]).padStart(2,"0")}
              </div>
              <div className="r-etiqueta">{e}</div>
            </div>
          ))}
        </div>
        {tiempoRestante.terminado && (
          <div className="r-texto-final">¡Hoy es el gran día! 🎉</div>
        )}
      </section>

      {/* ── REGALOS ── */}
      <section className="r-section-regalos" ref={lugarSectionRef}>
        <div className="r-regalos-content">
          <h2 className="r-section-title" data-aos="fade-up">Contribución 🎁</h2>
          <p className="r-body-text" data-aos="fade-up">Un regalo para el bebé será suficiente. ¡Muchas gracias!</p>
          <div className="r-regalos-img-wrap" data-aos="fade-up">
            <div className="r-img-overflow">
              <img src={IMGLugar} alt="Regalos" className="r-regalos-img" ref={lugarImgRef} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CORREO ── */}
      <section className="r-section-correo" data-aos="fade-up">
        <div className="r-correo-card">
          <span className="r-correo-icon">📧</span>
          <p className="r-correo-text">Recuerda revisar tu correo, te enviamos los detalles.</p>
        </div>
      </section>
    </div>
  );
};

function loadGSAPFromCDN() {
  return new Promise((resolve) => {
    if (window.gsap && window.ScrollTrigger) return resolve();
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
      s2.onload = resolve;
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
}

export default Respuesta;