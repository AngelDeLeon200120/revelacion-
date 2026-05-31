import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../styles/PanelAdmin.css";

const PanelAdmin = () => {
  const [invitados, setInvitados] = useState([]);
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("autenticado") === "true"
  );
  const [stats, setStats] = useState({ total: 0, confirmados: 0, noConfirmados: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [filtro, setFiltro] = useState("todos"); // todos | confirmados | no

  // Refs GSAP
  const loginRef = useRef(null);
  const panelRef = useRef(null);
  const statsRef = useRef(null);
  const tableRef = useRef(null);
  const gsapLoaded = useRef(false);

  const obtenerInvitados = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        "http://localhost:3001/api/invitados/listar",
        { timeout: 10000, headers: { "Content-Type": "application/json", Accept: "application/json" } }
      );
      if (data && data.success) {
        const formateados = data.data.invitados.map((inv) => ({
          ...inv,
          created_at: inv.fecha_confirmacion || inv.created_at,
        }));
        setInvitados(formateados);
        setStats(data.data.estadisticas || { total: 0, confirmados: 0, noConfirmados: 0 });
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error(data?.error || "Respuesta inválida del servidor");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al cargar invitados.");
    } finally {
      setLoading(false);
    }
  };

  const manejarAutenticacion = (e) => {
    e.preventDefault();
    if (clave === "admin123") {
      // Animación de salida del login
      if (window.gsap && loginRef.current) {
        window.gsap.to(loginRef.current, {
          opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.in",
          onComplete: () => {
            setAutenticado(true);
            localStorage.setItem("autenticado", "true");
          },
        });
      } else {
        setAutenticado(true);
        localStorage.setItem("autenticado", "true");
      }
    } else {
      // Shake en error
      if (window.gsap && loginRef.current) {
        window.gsap.to(loginRef.current, {
          x: -12, duration: 0.06, repeat: 6, yoyo: true, ease: "none",
          onComplete: () => window.gsap.set(loginRef.current, { x: 0 }),
        });
      }
      setClave("");
    }
  };

  const cerrarSesion = () => {
    if (window.gsap && panelRef.current) {
      window.gsap.to(panelRef.current, {
        opacity: 0, y: 20, duration: 0.35, ease: "power2.in",
        onComplete: () => {
          localStorage.removeItem("autenticado");
          setAutenticado(false);
          setInvitados([]);
          setStats({ total: 0, confirmados: 0, noConfirmados: 0 });
        },
      });
    } else {
      localStorage.removeItem("autenticado");
      setAutenticado(false);
      setInvitados([]);
      setStats({ total: 0, confirmados: 0, noConfirmados: 0 });
    }
  };

  useEffect(() => {
    if (autenticado) {
      obtenerInvitados();
      const interval = setInterval(obtenerInvitados, 60000);
      return () => clearInterval(interval);
    }
  }, [autenticado]);

  // Cargar GSAP e inicializar animaciones
  useEffect(() => {
    if (gsapLoaded.current) return;
    const init = async () => {
      try {
        const g = await import("gsap");
        window.gsap = g.gsap || g.default;
      } catch {
        await loadGSAPFromCDN();
      }
      if (!window.gsap) return;
      gsapLoaded.current = true;

      if (!autenticado && loginRef.current) {
        window.gsap.from(loginRef.current, {
          opacity: 0, y: 50, scale: 0.94, duration: 0.8, ease: "power3.out",
        });
      }
    };
    init();
  }, []);

  // Animar panel al autenticarse
  useEffect(() => {
    if (!autenticado || !gsapLoaded.current) return;
    const gsap = window.gsap;
    if (!gsap) return;

    if (panelRef.current) {
      gsap.from(panelRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" });
    }
    if (statsRef.current) {
      gsap.from(statsRef.current.querySelectorAll(".pa-stat-card"), {
        opacity: 0, y: 30, scale: 0.9, stagger: 0.12, duration: 0.6,
        ease: "back.out(1.5)", delay: 0.2,
      });
    }
    if (tableRef.current) {
      gsap.from(tableRef.current, {
        opacity: 0, y: 25, duration: 0.6, ease: "power2.out", delay: 0.5,
      });
    }
  }, [autenticado, invitados.length]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("es-GT", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch { return dateString; }
  };

  const invitadosFiltrados = invitados.filter((inv) => {
    if (filtro === "confirmados") return inv.asistencia;
    if (filtro === "no") return !inv.asistencia;
    return true;
  });

  // ── LOGIN ──
  if (!autenticado) {
    return (
      <div className="pa-login-page">
        <div className="pa-login-bg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`pa-login-orb pa-login-orb--${i + 1}`} />
          ))}
        </div>
        <div className="pa-login-card" ref={loginRef}>
          <div className="pa-login-icon">🔐</div>
          <h2 className="pa-login-title">Panel Administrativo</h2>
          <p className="pa-login-sub">Baby Shower · Juan Ignacio</p>
          <form onSubmit={manejarAutenticacion} className="pa-login-form">
            <div className="pa-login-field">
              <label className="pa-login-label" htmlFor="clave">Contraseña</label>
              <div className="pa-pw-wrap">
                <span className="pa-pw-icon">🔑</span>
                <input
                  id="clave"
                  type={mostrarClave ? "text" : "password"}
                  placeholder="Ingresa la clave"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  autoFocus
                  className="pa-login-input"
                />
                <button
                  type="button"
                  className="pa-pw-toggle"
                  onClick={() => setMostrarClave((p) => !p)}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {mostrarClave ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button type="submit" className="pa-login-btn">
              Entrar al panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── PANEL ──
  return (
    <div className="pa-panel" ref={panelRef}>

      {/* Header */}
      <div className="pa-header">
        <div className="pa-header-left">
          <span className="pa-header-icon">👶</span>
          <div>
            <h1 className="pa-header-title">Panel de Confirmaciones</h1>
            <p className="pa-header-sub">Baby Shower · Juan Ignacio</p>
          </div>
        </div>
        <div className="pa-header-right">
          <span className="pa-last-updated">
            {lastUpdated ? `Actualizado: ${lastUpdated}` : "Sin datos"}
          </span>
          <button
            onClick={obtenerInvitados}
            disabled={loading}
            className={`pa-btn pa-btn--refresh ${loading ? "pa-btn--loading" : ""}`}
          >
            {loading ? <><span className="pa-spinner" /> Actualizando</> : "↻ Actualizar"}
          </button>
          <button onClick={cerrarSesion} className="pa-btn pa-btn--logout">
            Salir
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="pa-error">
          <span>⚠️ {error}</span>
          <button onClick={obtenerInvitados} className="pa-error-retry">Reintentar</button>
        </div>
      )}

      {/* Stats */}
      <div className="pa-stats" ref={statsRef}>
        <div className="pa-stat-card pa-stat-card--total">
          <div className="pa-stat-icon">👥</div>
          <div className="pa-stat-body">
            <p className="pa-stat-label">Total personas</p>
            <p className="pa-stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="pa-stat-card pa-stat-card--confirmed">
          <div className="pa-stat-icon">✅</div>
          <div className="pa-stat-body">
            <p className="pa-stat-label">Confirmados</p>
            <p className="pa-stat-value">{stats.confirmados}</p>
          </div>
        </div>
        <div className="pa-stat-card pa-stat-card--declined">
          <div className="pa-stat-icon">❌</div>
          <div className="pa-stat-body">
            <p className="pa-stat-label">No asistirán</p>
            <p className="pa-stat-value">{stats.noConfirmados}</p>
          </div>
        </div>
        <div className="pa-stat-card pa-stat-card--pct">
          <div className="pa-stat-icon">📊</div>
          <div className="pa-stat-body">
            <p className="pa-stat-label">Tasa confirmación</p>
            <p className="pa-stat-value">
              {stats.total > 0
                ? `${Math.round((stats.confirmados / stats.total) * 100)}%`
                : "—"}
            </p>
          </div>
          {stats.total > 0 && (
            <div className="pa-stat-bar-wrap">
              <div
                className="pa-stat-bar"
                style={{ width: `${Math.round((stats.confirmados / stats.total) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="pa-filtros">
        {[
          { key: "todos", label: "Todos", count: invitados.length },
          { key: "confirmados", label: "Confirmados", count: invitados.filter((i) => i.asistencia).length },
          { key: "no", label: "No asisten", count: invitados.filter((i) => !i.asistencia).length },
        ].map((f) => (
          <button
            key={f.key}
            className={`pa-filtro-btn ${filtro === f.key ? "pa-filtro-btn--active" : ""}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
            <span className="pa-filtro-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="pa-table-wrap" ref={tableRef}>
        <table className="pa-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Asistencia</th>
              <th>Personas</th>
              <th>Fecha</th>
              <th>Placa</th>
            </tr>
          </thead>
          <tbody>
            {loading && invitados.length === 0 ? (
              <tr>
                <td colSpan="7" className="pa-table-empty">
                  <span className="pa-spinner pa-spinner--dark" /> Cargando...
                </td>
              </tr>
            ) : invitadosFiltrados.length > 0 ? (
              invitadosFiltrados.map((inv, idx) => (
                <tr key={inv.id || inv.email} className="pa-table-row">
                  <td className="pa-td-num">{idx + 1}</td>
                  <td className="pa-td-nombre">{inv.nombre}</td>
                  <td className="pa-td-email">{inv.email || "—"}</td>
                  <td>
                    {inv.asistencia ? (
                      <span className="pa-badge pa-badge--yes">✅ Confirmado</span>
                    ) : (
                      <span className="pa-badge pa-badge--no">❌ No asistirá</span>
                    )}
                  </td>
                  <td className="pa-td-center">{inv.cantidad || 1}</td>
                  <td className="pa-td-date">{formatDate(inv.created_at)}</td>
                  <td className="pa-td-center">{inv.placaVehiculo || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="pa-table-empty">
                  {error ? "Error al cargar datos" : "No hay registros"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="pa-footer-note">
        Actualización automática cada 60 segundos · {invitadosFiltrados.length} registro(s) mostrado(s)
      </p>
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

export default PanelAdmin;