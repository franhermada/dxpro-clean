import { useState, useEffect, useRef } from "react";
import "../estilos/Secciones.css";
import "../estilos/Casos.css";

export default function CasosBasicos({ backendUrl }) {
  const [sistema, setSistema] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef(null);

  const SISTEMAS = ["Todos", "Cardiovascular", "Respiratorio", "Digestivo", "Renal", "Endocrino"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    if (!sistema) return;

    const cargarCaso = async () => {
      setCargando(true);
      try {
        const query = sistema === "Todos" ? "?system=all" : `?system=${sistema.toLowerCase()}`;
        const res = await fetch(`${backendUrl}/api/caso${query}`);
        const data = await res.json();
        setMensajes([{ autor: "bot", texto: data.presentacion || "Caso cargado correctamente." }]);
      } catch {
        setMensajes([{ autor: "bot", texto: "⚠️ Error al conectar con el servidor." }]);
      } finally {
        setCargando(false);
      }
    };
    cargarCaso();
  }, [sistema]);

  const handleEnviar = () => {
    if (!mensaje.trim()) return;
    setMensajes([...mensajes, { autor: "usuario", texto: mensaje }]);
    setMensaje("");
  };

  return (
    <div className="seccion casos-basicos">
      <div className="card">
        <h2>Casos Básicos</h2>
        <p>
          Casos clínicos de baja complejidad, ideales para estudiantes que están comenzando su formación en Medicina.
          Permite desarrollar una buena anamnesis, exploración física y razonamiento clínico básico.
          Cuando se solicitan estudios complementarios, el sistema devuelve el informe correspondiente.
        </p>
        {!sistema ? (
          <div className="sistemas-grid">
            <h3>Seleccioná un sistema</h3>
            <div className="botones-sistemas">
              {SISTEMAS.map((s) => (
                <button key={s} onClick={() => setSistema(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : cargando ? (
          <p>⏳ Cargando caso clínico...</p>
        ) : (
          <div className="chat-caso">
            <div className="chat-box">
              {mensajes.map((m, i) => (
                <div key={i} className={`message ${m.autor}`}>
                  {m.texto}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="input-area">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribí tu pregunta al paciente..."
              />
              <button onClick={handleEnviar}>Enviar</button>
            </div>

            <button onClick={() => setSistema(null)} className="volver-btn">
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
