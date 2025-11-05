import { useState } from "react";

export default function Login({ backendUrl, setUsuario, setSeccion }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <div className="seccion card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={iniciarSesion} className="auth-form">
        <label>Correo electrónico:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Contraseña:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Ingresar</button>
      </form>

      <p>
        ¿No tienes una cuenta?{" "}
        <button className="link-btn" onClick={() => setSeccion("registro")}>
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}
