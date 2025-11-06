import { useState } from "react";
import "../estilos/Secciones.css";

export default function Registro({ backendUrl, setSeccion }) {
  const [universidad, setUniversidad] = useState("");

  const registrarUsuario = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Registro exitoso. Ya puedes iniciar sesión.");
        setSeccion("login");
      } else {
        alert(`⚠️ ${data.error || "Error al registrarse"}`);
      }
    } catch {
      alert("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="seccion card">
      <h2>Crear cuenta</h2>
      <form className="auth-form" onSubmit={registrarUsuario}>
        <label>Nombre completo:</label>
        <input name="fullName" required />

        <label>Correo electrónico:</label>
        <input type="email" name="email" required />

        <label>Contraseña:</label>
        <input type="password" name="password" required />

        <label>DNI:</label>
        <input name="dni" required />

        <label>Universidad:</label>
        <select
          name="universidad"
          required
          value={universidad}
          onChange={(e) => setUniversidad(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="UNCPBA">UNCPBA</option>
          <option value="OTRA">Otra</option>
        </select>

        {universidad === "UNCPBA" ? (
          <>
            <label>Certificado de alumno regular (PDF):</label>
            <input type="file" name="certificado" accept="application/pdf" required />
            <p>💸 Precio mensual: <b>$0</b> (convenio con UNCPBA)</p>
          </>
        ) : universidad === "OTRA" ? (
          <p>💸 Precio mensual: <b>$3000</b></p>
        ) : null}

        <button type="submit">Registrarme</button>
      </form>

      <p>
        ¿Ya tienes una cuenta?{" "}
        <button className="link-btn" onClick={() => setSeccion("login")}>
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
}
