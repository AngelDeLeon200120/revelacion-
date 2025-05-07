import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PanelAdmin.css";

const PanelAdmin = () => {
  const [invitados, setInvitados] = useState([]);
  const [clave, setClave] = useState("");
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("autenticado") === "true"
  );
  const [stats, setStats] = useState({
    total: 0,
    confirmados: 0,
    noConfirmados: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const obtenerInvitados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(
        "https://revelacion-backend.onrender.com/api/invitados/listar",
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (data && data.success) {
        // Mapeamos los datos para mantener compatibilidad
        const invitadosFormateados = data.data.invitados.map(inv => ({
          ...inv,
          // Usamos fecha_confirmacion como created_at para mantener compatibilidad
          created_at: inv.fecha_confirmacion || inv.created_at
        }));
        
        setInvitados(invitadosFormateados);
        setStats(data.data.estadisticas || {
          total: 0,
          confirmados: 0,
          noConfirmados: 0
        });
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(data?.error || "Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("Error al obtener invitados:", error);
      setError(
        error.response?.data?.error ||
        error.message ||
        "Error al cargar los invitados. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const manejarAutenticacion = (e) => {
    e.preventDefault();
    if (clave === "admin123") {
      setAutenticado(true);
      localStorage.setItem("autenticado", "true");
      obtenerInvitados();
    } else {
      alert("Clave incorrecta");
      setClave("");
    }
  };

  useEffect(() => {
    if (autenticado) {
      obtenerInvitados();
      const interval = setInterval(obtenerInvitados, 60000);
      return () => clearInterval(interval);
    }
  }, [autenticado]);

  if (!autenticado) {
    return (
      <div className="admin-login-container">
        <form onSubmit={manejarAutenticacion} className="admin-login-form">
          <h2>Acceso Administrativo</h2>
          <input
            type="password"
            placeholder="Ingresa la clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString; // Si falla el parsing, devolver el string original
    }
  };

  return (
    <div className="panel-admin">
      <div className="admin-header">
        <h2>Panel de Confirmaciones</h2>
        <div className="last-updated">
          Última actualización: {lastUpdated || "Nunca"}
          <button 
            onClick={obtenerInvitados} 
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={obtenerInvitados} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      <div className="stats-container">
        <div className="stat-card total">
          <h3>Total Invitados</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card confirmed">
          <h3>Confirmados</h3>
          <p>{stats.confirmados}</p>
        </div>
        <div className="stat-card declined">
          <h3>No Confirmados</h3>
          <p>{stats.noConfirmados}</p>
        </div>
      </div>

      <div className="table-container">
        <table className="panel-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Asistencia</th>
              <th>Cantidad</th>
              <th>Fecha Confirmación</th>
            </tr>
          </thead>
          <tbody>
            {loading && invitados.length === 0 ? (
              <tr>
                <td colSpan="5" className="loading-row">
                  Cargando invitados...
                </td>
              </tr>
            ) : invitados.length > 0 ? (
              invitados.map((inv) => (
                <tr key={inv.id || inv.email}>
                  <td>{inv.nombre}</td>
                  <td>{inv.email}</td>
                  <td>
                    {inv.asistencia ? (
                      <span className="status-confirmed">✅ Confirmado</span>
                    ) : (
                      <span className="status-declined">❌ No asistirá</span>
                    )}
                  </td>
                  <td>{inv.cantidad || 1}</td>
                  <td>{formatDate(inv.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  {error ? "Error al cargar datos" : "No hay invitados registrados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("autenticado");
          setAutenticado(false);
          setInvitados([]);
          setStats({
            total: 0,
            confirmados: 0,
            noConfirmados: 0
          });
        }}
        className="logout-button"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default PanelAdmin;