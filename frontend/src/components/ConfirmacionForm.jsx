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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "radio" ? value === "true" : 
              type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        // https://revelacion-backend.onrender.com
        "https://revelacion-backend.onrender.com/api/invitados/confirmar",
        formData,
        {
          timeout: 10000, // 10 segundos timeout
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        const confirmacion = {
          nombre: formData.nombre,
          asistencia: String(formData.asistencia),
          cantidad: formData.cantidad,
        };
        
        localStorage.setItem("confirmacion", JSON.stringify(confirmacion));
        navigate("/respuesta", { state: confirmacion });
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const confirmacion = localStorage.getItem("confirmacion");
    if (confirmacion) {
      navigate("/respuesta", { state: JSON.parse(confirmacion) });
    }
  }, [navigate]);

  return (
    <form onSubmit={handleSubmit} className="confirmacion-form">
      <h2>¿Nos acompañas?</h2>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        name="nombre"
        placeholder="Tu nombre completo"
        value={formData.nombre}
        onChange={handleChange}
        required
        minLength="3"
      />
      
      <input
        type="email"
        name="email"
        placeholder="Tu correo electrónico"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label className="radio-label">¿Cuántas personas asistirán?</label>
      <label className="radio-text-familia">
        Recuerda solo miembros de la familia
      </label>
      <input
        type="number"
        name="cantidad"
        min="1"
        max="10"
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

      <button 
        type="submit" 
        className="boton-confirmar"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Confirmar"}
      </button>
    </form>
  );
};

export default ConfirmacionForm;