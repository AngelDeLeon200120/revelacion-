import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import IMGLugar from "../assets/lugar.jpg";
import bbeleon from "../assets/bb2.jpg";
import Musica from "../assets/musica.mp3";
import "../styles/Invitacion.css";

const Invitacion = () => {
  const navigate = useNavigate();
  const [mostrarContenido, setMostrarContenido] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState({
    dias: 0, horas: 0, minutos: 0, segundos: 0, terminado: false,
  });

  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const nombreRef = useRef(null);
  const section2Ref = useRef(null);
  const img2Ref = useRef(null);
  const section3Ref = useRef(null);
  const imgLugarRef = useRef(null);
  const contadorRef = useRef(null);
  const btnRef = useRef(null);
  const floatingStarsRef = useRef(null);
  const gsapLoaded = useRef(false);

  useEffect(() => {
    const confirmacion = localStorage.getItem("confirmacion");
    if (confirmacion) {
      navigate("/respuesta", { state: JSON.parse(confirmacion) });
    }

    // 27 de septiembre de 2026
    const evento = new Date(2026, 8, 27, 15, 30, 0);

    const actualizarContador = () => {
      const ahora = new Date();
      const diferencia = evento - ahora;
      if (diferencia <= 0) {
        setTiempoRestante((prev) => ({ ...prev, terminado: true }));
        return;
      }
      const seg = Math.floor(diferencia / 1000);
      const min = Math.floor(seg / 60);
      const hrs = Math.floor(min / 60);
      const dias = Math.floor(hrs / 24);
      setTiempoRestante({
        dias, horas: hrs % 24, minutos: min % 60, segundos: seg % 60, terminado: false,
      });
    };

    actualizarContador();
    const intervalo = setInterval(actualizarContador, 1000);
    return () => clearInterval(intervalo);
  }, [navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => setMostrarContenido(true), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const audio = new Audio(Musica);
    audio.loop = true;
    audio.volume = 0.5;
    const playAudio = () => audio.play().catch(() => {});
    document.addEventListener("click", playAudio, { once: true });
    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", playAudio);
    };
  }, []);

  useEffect(() => {
    if (!mostrarContenido || gsapLoaded.current) return;

    const initGSAP = async () => {
      let gsap, ScrollTrigger;
      try {
        const gsapModule = await import("gsap");
        const stModule = await import("gsap/ScrollTrigger");
        gsap = gsapModule.gsap || gsapModule.default;
        ScrollTrigger = stModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
      } catch {
        await loadGSAPFromCDN();
        gsap = window.gsap;
        ScrollTrigger = window.ScrollTrigger;
        if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
      }

      if (!gsap || !ScrollTrigger) return;
      gsapLoaded.current = true;

      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          scale: 1.18, y: 80, ease: "none",
          scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.2 },
        });
      }
      if (titleRef.current) gsap.from(titleRef.current, { opacity: 0, y: 60, duration: 1.4, ease: "power3.out", delay: 0.2 });
      if (subtitleRef.current) gsap.from(subtitleRef.current, { opacity: 0, y: 40, duration: 1.2, ease: "power3.out", delay: 0.6 });
      if (nombreRef.current) gsap.from(nombreRef.current, { opacity: 0, scale: 0.8, duration: 1.5, ease: "elastic.out(1, 0.5)", delay: 0.9 });

      if (img2Ref.current) {
        gsap.fromTo(img2Ref.current, { scale: 1.15, y: -40 }, {
          scale: 1, y: 40, ease: "none",
          scrollTrigger: { trigger: section2Ref.current, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      }
      if (section2Ref.current) {
        gsap.from(section2Ref.current.querySelectorAll(".reveal-text"), {
          opacity: 0, x: -60, stagger: 0.18, duration: 1, ease: "power2.out",
          scrollTrigger: { trigger: section2Ref.current, start: "top 75%" },
        });
      }
      if (imgLugarRef.current) {
        gsap.fromTo(imgLugarRef.current, { scale: 0.88, opacity: 0.4 }, {
          scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: section3Ref.current, start: "top 70%", end: "center center", scrub: 1 },
        });
      }
      if (contadorRef.current) {
        gsap.from(contadorRef.current.querySelectorAll(".contador-box"), {
          opacity: 0, y: 50, scale: 0.7, stagger: 0.12, duration: 0.8, ease: "back.out(1.7)",
          scrollTrigger: { trigger: contadorRef.current, start: "top 80%" },
        });
      }
      if (btnRef.current) {
        gsap.from(btnRef.current, {
          opacity: 0, scale: 0.6, duration: 1, ease: "elastic.out(1, 0.6)",
          scrollTrigger: { trigger: btnRef.current, start: "top 85%" },
        });
      }
      if (floatingStarsRef.current) {
        const stars = floatingStarsRef.current.querySelectorAll(".star");
        stars.forEach((star, i) => {
          gsap.to(star, {
            y: `${-30 - i * 10}px`, x: `${(i % 2 === 0 ? 1 : -1) * (10 + i * 5)}px`,
            rotation: 360, duration: 3 + i * 0.5, repeat: -1, yoyo: true,
            ease: "sine.inOut", delay: i * 0.2,
          });
        });
      }
    };

    initGSAP();
  }, [mostrarContenido]);

  if (!mostrarContenido) {
    return (
      <div className="pantalla-carga">
        <div className="carga-inner">
          <div className="carga-ring" />
          <h1 className="revelacion-titulo animate-fade">¡1 Añito! 🎂</h1>
          <p className="carga-sub animate-fade-delay">Cargando tu invitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invitacion-wrapper">

      {/* ── HERO ── */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-img-wrap" ref={heroImgRef}>
          <img src={bbeleon} alt="Juan Ignacio" className="hero-bg-img" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="floating-stars" ref={floatingStarsRef}>
            {["🎂","⭐","🎈","🦁","🌟","🎉"].map((s, i) => (
              <span key={i} className="star" style={{ "--i": i }}>{s}</span>
            ))}
          </div>
          <p className="hero-eyebrow" ref={titleRef}>Estás invitado a celebrar</p>
          <h1 className="hero-nombre" ref={nombreRef}>
            <span className="nombre-line">Juan Ignacio</span>
          </h1>
          <p className="hero-sub" ref={subtitleRef}>¡Su primer añito! 🎂 · 27 de Septiembre · 3:30 PM</p>
          <div className="hero-scroll-hint">
            <span className="scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: detalle + foto ── */}
      <section className="section-detalle" ref={section2Ref}>
        <div className="detalle-grid">
          <div className="detalle-text">
            <p className="reveal-text tag-label">🎈 Con mucho amor</p>
            <h2 className="reveal-text detalle-heading">
              ¡Cumple su primer año!
            </h2>
            <p className="reveal-text detalle-body">
              Nos llena de alegría compartir contigo que nuestro pequeño{" "}
              <strong>Juan Ignacio</strong> está cumpliendo su primer añito.
              Queremos celebrar este gran momento juntos en un lugar muy especial.
            </p>
            <p className="reveal-text detalle-body">
              🦁 ¡Lo celebraremos en el <strong>Zoológico La Aurora</strong>!
            </p>
            <div className="reveal-text detalle-detalles-box">
              <div className="detalle-item">
                <span className="detalle-icon">📅</span>
                <span><strong>Sábado 27 de Septiembre de 2026</strong></span>
              </div>
              <div className="detalle-item">
                <span className="detalle-icon">🕞</span>
                <span><strong>3:30 PM</strong></span>
              </div>
              <div className="detalle-item">
                <span className="detalle-icon">📍</span>
                <span>Zoológico La Aurora<br /><em>Ciudad de Guatemala, Guatemala</em></span>
              </div>
              <div className="detalle-item">
                <span className="detalle-icon">🎂</span>
                <span>¡Primer cumpleaños de <strong>Juan Ignacio</strong>!</span>
              </div>
            </div>
          </div>
          <div className="detalle-img-wrap" ref={img2Ref}>
            <img src={bbeleon} alt="Juan Ignacio" className="detalle-img" />
            <div className="img-frame-deco" />
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: contador ── */}
      <section className="section-contador">
        <div className="contador-bg-deco" />
        <h2 className="contador-title">Faltan...</h2>
        <div className="contador-grid" ref={contadorRef}>
          {["Días", "Horas", "Minutos", "Segundos"].map((etiqueta, i) => (
            <div className="contador-box" key={etiqueta}>
              <div className="valor">
                {String(
                  [tiempoRestante.dias, tiempoRestante.horas,
                   tiempoRestante.minutos, tiempoRestante.segundos][i]
                ).padStart(2, "0")}
              </div>
              <div className="etiqueta">{etiqueta}</div>
            </div>
          ))}
        </div>
        {tiempoRestante.terminado && (
          <div className="texto-final animate-pulse">¡Hoy es el gran día! 🎉</div>
        )}
      </section>

      {/* ── SECCIÓN 4: imagen lugar con parallax ── */}
      <section className="section-lugar" ref={section3Ref}>
        <div className="lugar-content">
          <h2 className="lugar-title">El lugar 🦁</h2>
          <div className="lugar-img-container" ref={imgLugarRef}>
            <img src={IMGLugar} alt="Zoológico La Aurora" className="lugar-img" />
          </div>
          <div className="lugar-links">
            <a
              href="https://www.google.com/maps/place/Zool%C3%B3gico+La+Aurora/@14.5989504,-90.5284319,17z/data=!4m15!1m8!3m7!1s0x8589a162b49a51fd:0x179ee84e18f07f06!2sZool%C3%B3gico+La+Aurora!8m2!3d14.5989452!4d-90.525857!10e8!16s%2Fm%2F03nwgf6!3m5!1s0x8589a162b49a51fd:0x179ee84e18f07f06!8m2!3d14.5989452!4d-90.525857!16s%2Fm%2F03nwgf6?entry=ttu&g_ep=EgoyMDI2MDUzMS4wIKXMDSoASAFQAw%3D%3D"
              target="_blank" rel="noopener noreferrer"
              className="mapa-btn"
            >
              📍 Google Maps
            </a>
            <a
              href="https://www.waze.com/es/live-map/directions/zoologico-la-aurora-parqueo-zoologico-la-aurora-zona-13,-guatemala?to=place.w.176619666.1766000052.408455"
              target="_blank" rel="noopener noreferrer"
              className="mapa-btn waze"
            >
              🚗 Waze
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="section-cta">
        <div className="cta-deco">🎂</div>
        <h2 className="cta-title">¿Nos acompañas?</h2>
        <p className="cta-sub">¡Será un honor celebrar juntos este primer añito!</p>
        <button
          ref={btnRef}
          onClick={() => navigate("/confirmar")}
          className="boton-confirmar-invitacion"
        >
          Confirmar asistencia ✉️
        </button>
        <p className="te-esperamos">Te esperamos con amor 🎈</p>
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

export default Invitacion;