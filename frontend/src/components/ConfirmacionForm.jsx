import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/ConfirmacionForm.css";

const ConfirmacionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asistencia: true,
    cantidad: 1,
    placaVehiculo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0); // para animar campos uno a uno

  // Refs para animaciones GSAP
  const formRef = useRef(null);
  const fieldsRef = useRef([]);
  const btnRef = useRef(null);
  const gsapLoaded = useRef(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "radio"
          ? value === "true"
          : type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Animación de botón al enviar
    if (window.gsap && btnRef.current) {
      window.gsap.to(btnRef.current, {
        scale: 0.96,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/invitados/confirmar",
        formData,
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        // Animación de salida antes de navegar
        if (window.gsap && formRef.current) {
          window.gsap.to(formRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              const confirmacion = {
                nombre: formData.nombre,
                asistencia: String(formData.asistencia),
                cantidad: formData.cantidad,
                placaVehiculo: formData.placaVehiculo,
              };
              localStorage.setItem("confirmacion", JSON.stringify(confirmacion));
              navigate("/respuesta", { state: confirmacion });
            },
          });
        } else {
          const confirmacion = {
            nombre: formData.nombre,
            asistencia: String(formData.asistencia),
            cantidad: formData.cantidad,
            placaVehiculo: formData.placaVehiculo,
          };
          localStorage.setItem("confirmacion", JSON.stringify(confirmacion));
          navigate("/respuesta", { state: confirmacion });
        }
      } else {
        throw new Error(response.data.error || "Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error("Error al enviar confirmación:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Ocurrió un error al enviar tu confirmación. Por favor intenta nuevamente."
      );
      setLoading(false);
    }
  };

  // Redirigir si ya confirmó
  useEffect(() => {
    const confirmacion = localStorage.getItem("confirmacion");
    if (confirmacion) {
      navigate("/respuesta", { state: JSON.parse(confirmacion) });
    }
  }, [navigate]);

  // Inicializar GSAP y animar entrada
  useEffect(() => {
  if (gsapLoaded.current) return;

  const initGSAP = async () => {
    let gsap;

    try {
      const g = await import("gsap");
      gsap = g.gsap || g.default;
    } catch (e) {
      await loadGSAPFromCDN();
      gsap = window.gsap;
    }

    if (!gsap) {
      console.warn("GSAP no se pudo cargar");
      gsapLoaded.current = true;
      return;
    }

    window.gsap = gsap;
    gsapLoaded.current = true;

    // === ANIMACIÓN DE ENTRADA ===
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { 
          opacity: 0, 
          y: 60, 
          scale: 0.96 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.9, 
          ease: "power3.out" 
        }
      );
    }

    // Stagger de campos
    const fields = fieldsRef.current.filter(Boolean);
    if (fields.length > 0) {
      gsap.fromTo(
        fields,
        { opacity: 0, y: 25 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1, 
          duration: 0.6, 
          ease: "power2.out", 
          delay: 0.2 
        }
      );
    }
  };

  initGSAP();
}, []);

  // helper para asignar refs a campos
  const setFieldRef = (el, i) => {
    fieldsRef.current[i] = el;
  };

  return (
    <div className="cf-page">
      {/* Burbujas decorativas de fondo */}
      <div className="cf-bubbles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cf-bubble cf-bubble--${i + 1}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="cf-form" ref={formRef}>
        {/* Encabezado */}
        <div className="cf-header">
          <div className="cf-header-icon">💙</div>
          <h2 className="cf-title">¿Nos acompañas?</h2>
          <p className="cf-subtitle">Baby Shower de Juan Ignacio · 31 de Agosto</p>
        </div>

        {error && (
          <div className="cf-error" role="alert">
            <span className="cf-error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Campo nombre */}
        <div className="cf-field" ref={(el) => setFieldRef(el, 0)}>
          <label className="cf-label" htmlFor="nombre">Nombre completo</label>
          <div className="cf-input-wrap">
            <span className="cf-input-icon">👤</span>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Tu nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
              minLength="3"
              className="cf-input"
            />
          </div>
        </div>

        {/* Campo email */}
        <div className="cf-field" ref={(el) => setFieldRef(el, 1)}>
          <label className="cf-label" htmlFor="email">Correo electrónico</label>
          <div className="cf-input-wrap">
            <span className="cf-input-icon">✉️</span>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="cf-input"
            />
          </div>
        </div>

        {/* Campo cantidad */}
        <div className="cf-field" ref={(el) => setFieldRef(el, 2)}>
          <label className="cf-label" htmlFor="cantidad">
            ¿Cuántas personas asistirán?
          </label>
          <p className="cf-hint">Solo miembros de la familia</p>
          <div className="cf-cantidad-wrap">
            <button
              type="button"
              className="cf-cantidad-btn"
              onClick={() =>
                setFormData((p) => ({ ...p, cantidad: Math.max(1, p.cantidad - 1) }))
              }
            >
              −
            </button>
            <input
              id="cantidad"
              type="number"
              name="cantidad"
              min="1"
              max="10"
              value={formData.cantidad}
              onChange={handleChange}
              required
              className="cf-input cf-input--cantidad"
            />
            <button
              type="button"
              className="cf-cantidad-btn"
              onClick={() =>
                setFormData((p) => ({ ...p, cantidad: Math.min(10, p.cantidad + 1) }))
              }
            >
              +
            </button>
          </div>
        </div>

        {/* Asistencia */}
        <div className="cf-field" ref={(el) => setFieldRef(el, 3)}>
          <label className="cf-label">¿Asistirás al evento?</label>
          <div className="cf-radio-group">
            <label className={`cf-radio-card ${formData.asistencia === true ? "cf-radio-card--active" : ""}`}>
              <input
                type="radio"
                name="asistencia"
                value="true"
                checked={formData.asistencia === true}
                onChange={handleChange}
                className="cf-radio-hidden"
              />
              <span className="cf-radio-emoji">🎉</span>
              <span className="cf-radio-text">Sí asistiré</span>
            </label>
            <label className={`cf-radio-card ${formData.asistencia === false ? "cf-radio-card--active cf-radio-card--no" : ""}`}>
              <input
                type="radio"
                name="asistencia"
                value="false"
                checked={formData.asistencia === false}
                onChange={handleChange}
                className="cf-radio-hidden"
              />
              <span className="cf-radio-emoji">😢</span>
              <span className="cf-radio-text">No podré asistir</span>
            </label>
          </div>
        </div>

        {/* Placa */}
        <div className="cf-field" ref={(el) => setFieldRef(el, 4)}>
          <label className="cf-label" htmlFor="placaVehiculo">
            Placa del vehículo <span className="cf-optional">(opcional)</span>
          </label>
          <div className="cf-input-wrap">
            <span className="cf-input-icon">🚗</span>
            <input
              id="placaVehiculo"
              type="text"
              name="placaVehiculo"
              placeholder="ABC-123"
              value={formData.placaVehiculo}
              onChange={handleChange}
              maxLength="20"
              className="cf-input"
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className={`cf-btn ${loading ? "cf-btn--loading" : ""}`}
          disabled={loading}
          ref={btnRef}
        >
          {loading ? (
            <span className="cf-btn-inner">
              <span className="cf-spinner" /> Enviando...
            </span>
          ) : (
            <span className="cf-btn-inner">
              Confirmar asistencia ✉️
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

function loadGSAPFromCDN() {
  return new Promise((resolve) => {
    if (window.gsap) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

export default ConfirmacionForm;