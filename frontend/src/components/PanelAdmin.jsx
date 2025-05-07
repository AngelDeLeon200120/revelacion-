import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PanelAdmin.css";

const PanelAdmin = () => {
  const [invitados, setInvitados] = useState([]);
  const [clave, setClave] = useState("");
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("autenticado") === "true"
  );
  const [totalConfirmados, setTotalConfirmados] = useState(0);
  const [totalNoConfirmados, setTotalNoConfirmados] = useState(0);
  const [totalInvitados, setTotalInvitados] = useState(0);
  const [cargando, setCargando] = useState(false);

  const obtenerInvitados = async () => {
    try {
      setCargando(true);
      const { data } = await axios.get(
        "http://localhost:3001/api/invitados/listar"
      );
      setInvitados(data);

      let confirmados = 0;
      let noConfirmados = 0;
      let totalTodos = 0;

      data.forEach((inv) => {
        const cantidad = parseInt(inv.cantidad) || 0;
        totalTodos += cantidad;
        if (inv.asistencia) {
          confirmados += cantidad;
        } else {
          noConfirmados += cantidad;
        }
      });

      setTotalConfirmados(confirmados);
      setTotalNoConfirmados(noConfirmados);
      setTotalInvitados(totalTodos);
    } catch (error) {
      console.error("Error al obtener invitados:", error);
    } finally {
      setCargando(false);
    }
  };

  const manejarAutenticacion = (e) => {
    e.preventDefault();
    if (clave === "admin123") {
      setAutenticado(true);
      localStorage.setItem("autenticado", "true"); // 👈 guardar en localStorage
    } else {
      alert("Clave incorrecta");
      setClave("");
    }
  };

  useEffect(() => {
    if (autenticado) {
      obtenerInvitados();
    }
  }, [autenticado]);

  if (!autenticado) {
    return (
      <div className="admin-login-container">
        <form onSubmit={manejarAutenticacion} className="admin-login-form">
          <h2>Acceso Privado</h2>
          <input
            type="password"
            placeholder="Ingresa la clave"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="panel-admin">
      <h2>Panel de Confirmaciones</h2>
      <div className="table-container">
        <table className="panel-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>¿Asistirá?</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {invitados.length > 0 ? (
              <>
                {invitados.map((inv, idx) => (
                  <tr key={idx}>
                    <td>{inv.nombre}</td>
                    <td>{inv.email}</td>
                    <td>{inv.asistencia ? "✅ Sí" : "❌ No"}</td>
                    <td>{inv.cantidad || 0}</td>
                  </tr>
                ))}
                <tr className="total-general">
                  <td colSpan="3">Total General</td>
                  <td>{totalInvitados}</td>
                </tr>
                <tr className="total-confirmados">
                  <td colSpan="3">Total Confirmados</td>
                  <td>{totalConfirmados}</td>
                </tr>
                <tr className="total-no-confirmados">
                  <td colSpan="3">Total No Confirmados</td>
                  <td>{totalNoConfirmados}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="4">
                  {cargando
                    ? "Cargando invitados..."
                    : "No hay invitados registrados"}
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
        }}
        className="logout-button"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default PanelAdmin;
