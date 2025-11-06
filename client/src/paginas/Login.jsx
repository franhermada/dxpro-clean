import { useState } from "react";
import "../estilos/Secciones.css";

export default function Login({ backendUrl, setUsuario, setSeccion }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ Bienvenido ${data.fullName}`);
        localStorage.setItem("usuario", JSON.stringify(data));
        setUsuario(data);
        setSeccion("inicio");
      } else {
        alert(`⚠️ ${data.error || "Error al iniciar sesión"}`);
      }
    } catch {
      alert("⚠️ No se pudo conectar con el servidor.");
    }
  };

  const solicitarRecuperacion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("📨 Se envió un enlace de recuperación a tu correo.");
        setShowModal(false);
        setRecoveryEmail("");
      } else {
        alert(`⚠️ ${data.error || "Error al enviar el correo"}`);
      }
    } catch {
      alert("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="seccion auth-bg">
      <div className="card auth-container">
        <h2 className="auth-title">INICIAR SESIÓN</h2>

        <form onSubmit={iniciarSesion} className="auth-form">
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-btn">Ingresar</button>
        </form>

        <div className="auth-links">
          <button className="link-btn" onClick={() => setShowModal(true)}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <p className="auth-switch">
          ¿No tienes una cuenta?{" "}
          <button className="link-btn" onClick={() => setSeccion("registro")}>
            Regístrate aquí
          </button>
        </p>
      </div>

      {/* Modal de recuperación */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Recuperar contraseña</h3>
            <p>Ingresá tu correo electrónico y te enviaremos un enlace de recuperación.</p>

            <form onSubmit={solicitarRecuperacion}>
              <input
                type="email"
                placeholder="usuario@correo.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit" className="auth-btn small">Enviar enlace</button>
                <button
                  type="button"
                  className="link-btn small"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
