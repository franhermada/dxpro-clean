import { useState, useRef, useEffect } from "react";
import "../estilos/Casos.css";

export default function CasosBasicos({ backendUrl }) {
  const [sistemaSeleccionado, setSistemaSeleccionado] = useState(null);
  const [caso, setCaso] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [pregunta, setPregunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef(null);

  // 🔹 Estados adicionales
  const [fase, setFase] = useState("anamnesis");
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [diagnosticoInput, setDiagnosticoInput] = useState("");
  const [tratamientoInput, setTratamientoInput] = useState("");
  const [diagnosticosUsuario, setDiagnosticosUsuario] = useState([]);
  const chatEndRef = useRef(null);

  const sistemas = [
    { id: "todos", nombre: "Todos los sistemas" },
    { id: "cardiovascular", nombre: "Cardiovascular" },
    { id: "respiratorio", nombre: "Respiratorio" },
    { id: "digestivo", nombre: "Digestivo" },
    { id: "nervioso", nombre: "Nervioso" },
    { id: "renal", nombre: "Renal" },
    { id: "endocrino", nombre: "Endocrino" },
  ];

  // --- Cargar caso desde backend ---
  const seleccionarSistema = async (sistema) => {
    setSistemaSeleccionado(sistema);
    setMensajes([]);
    setPregunta("");
    setCaso(null);
    setCargando(true);
    setFase("anamnesis");
    setShowEvaluation(false);
    setEvaluationResult(null);
    setDiagnosticosUsuario([]);

    try {
      const res = await fetch(`${backendUrl}/api/caso?system=${sistema.id}`);
      const data = await res.json();

      if (res.ok && data.presentacion) {
        setCaso(data);
        setMensajes([{ texto: data.presentacion, emisor: "bot" }]);
      } else {
        alert("⚠️ No se pudo cargar el caso clínico.");
        setSistemaSeleccionado(null);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error al conectar con el servidor.");
      setSistemaSeleccionado(null);
    } finally {
      setCargando(false);
    }
  };

  // --- Enviar pregunta ---
  const enviarMensaje = async () => {
    if (!pregunta.trim()) return;
    const nuevoMensaje = { texto: pregunta, emisor: "usuario" };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setPregunta("");
    setEnviando(true);

    try {
      const res = await fetch(`${backendUrl}/casos/basicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });
      const data = await res.json();

      if (res.ok && data.respuesta) {
        setMensajes((prev) => [...prev, { texto: data.respuesta, emisor: "bot" }]);
      } else {
        setMensajes((prev) => [
          ...prev,
          { texto: "No entendí tu pregunta, podrías reformularla.", emisor: "bot" },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMensajes((prev) => [
        ...prev,
        { texto: "Error de conexión con el servidor.", emisor: "bot" },
      ]);
    } finally {
  setEnviando(false);

  // ✅ Espera un pequeño instante antes de reenfocar
  setTimeout(() => {
    inputRef.current?.focus();
  }, 50);
}
  };

  const manejarEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // --- Avanzar de fase ---
  const avanzarFase = (nuevaFase, mensaje) => {
    setFase(nuevaFase);
    setMensajes((prev) => [...prev, { texto: `➡️ ${mensaje}`, emisor: "bot" }]);

    // Evaluación automática al pasar de presuntivos a complementarios
    if (fase === "presuntivos" && nuevaFase === "complementarios") {
      const esperados = caso?.evaluacion?.diagnostico_presuntivo || [];
      const ingresados = diagnosticoInput
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter((d) => d.length > 0);

      const aciertos = ingresados.filter((d) =>
        esperados.some((e) => e.toLowerCase().includes(d))
      ).length;

      const porcentaje = esperados.length ? (aciertos / esperados.length) * 100 : 0;

      if (porcentaje >= 60) {
        setMensajes((prev) => [
          ...prev,
          {
            texto:
              "👏 Muy bien, tus diagnósticos presuntivos son adecuados. Podés avanzar a los estudios complementarios para confirmarlos.",
            emisor: "bot",
          },
        ]);
      } else {
        setMensajes((prev) => [
          ...prev,
          {
            texto:
              "🤔 Algunos diagnósticos presuntivos podrían no coincidir con el cuadro clínico. Revisá la anamnesis y el examen físico antes de avanzar.",
            emisor: "bot",
          },
        ]);
      }
    }
  };

  // --- Evaluación final ---
  const handleEvaluation = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/evaluar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnostico: diagnosticoInput,
          tratamiento: tratamientoInput,
          sistema: sistemaSeleccionado?.id,
        }),
      });

      const data = await res.json();

      // --- Feedback adicional por fases ---
      const preguntasUsuario = mensajes
        .filter((m) => m.emisor === "usuario")
        .map((m) => m.texto.toLowerCase());

      const cuenta = (palabras) =>
        preguntasUsuario.filter((p) => palabras.some((w) => p.includes(w))).length;

      const anamnesisScore = cuenta(["dolor", "inicio", "contexto", "alivia", "factores"]);
      const examenScore = cuenta(["pulmon", "corazon", "abdomen", "pierna", "signos"]);
      const estudioScore = cuenta(["ecg", "laboratorio", "rx", "eco", "analisis"]);

      const feedback = {
        anamnesis: anamnesisScore >= 3 ? "✅ Buena anamnesis" : "⚠️ Anamnesis incompleta",
        examen: examenScore >= 2 ? "✅ Examen físico adecuado" : "⚠️ Examen físico escaso",
        estudios:
          estudioScore >= 2
            ? "✅ Buen abordaje complementario"
            : "⚠️ Faltaron estudios relevantes",
      };

      setEvaluationResult({ ...data, feedback });
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor para evaluación.");
    }
  };

  // --- Scroll automático controlado ---
  useEffect(() => {
  const chatContainer = document.querySelector(".chat-mensajes");
  if (!chatContainer) return;

  const ultimo = mensajes[mensajes.length - 1];
  if (ultimo && !ultimo.texto.startsWith("➡️ ")) {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }
}, [mensajes]);

  return (
    <div className="seccion casos-basicos">
      <div className="card">
        <h2 className="titulo-seccion">CASOS BÁSICOS</h2>
        <p className="descripcion-seccion">
          Casos clínicos de baja complejidad, ideales para estudiantes que están comenzando su formación en Medicina.
          Permiten desarrollar una buena anamnesis, exploración física y razonamiento clínico básico. Cuando se solicitan
          estudios complementarios, el sistema devuelve el informe correspondiente.
        </p>

        {/* === SELECCIÓN DE SISTEMA === */}
        {!sistemaSeleccionado && !cargando && (
          <div className="sistemas-container">
            <h3>Seleccioná un sistema:</h3>
            <div className="botones-sistemas">
              {sistemas.map((s) => (
                <button key={s.id} className="boton-sistema" onClick={() => seleccionarSistema(s)}>
                  {s.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === CARTEL DE CARGA === */}
        {cargando && (
          <div className="cargando-caso">
            <div className="spinner"></div>
            <p>⏳ Espere mientras cargamos su caso clínico...</p>
          </div>
        )}

        {/* === CHAT === */}
        {sistemaSeleccionado && caso && !cargando && (
          <div className="caso-chat">
            <div className="chat-mensajes">
              {mensajes.map((msg, i) => {
                const esEtapa = msg.texto.startsWith("➡️ ");
                return (
                  <div
                    key={i}
                    className={
                      esEtapa
                        ? "mensaje-etapa"
                        : `mensaje ${msg.emisor === "usuario" ? "mensaje-usuario" : "mensaje-bot"}`
                    }
                  >
                    {esEtapa ? msg.texto.replace("➡️ ", "") : msg.texto}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            {!showEvaluation && !evaluationResult && (
              <div className="chat-input">
                <input
                ref={inputRef}
                  type="text"
                  placeholder="Escribí tu pregunta al paciente..."
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  onKeyDown={manejarEnter}
                  disabled={enviando}
                />
                <button onClick={enviarMensaje} disabled={enviando}>
                  {enviando ? "..." : "Enviar"}
                </button>
              </div>
            )}

            {/* FASES */}
            {!showEvaluation && !evaluationResult && (
              <div className="fase-buttons">
                {fase === "anamnesis" && (
                  <button onClick={() => avanzarFase("examen", "Inicio del Examen Físico")}>
                    Avanzar a Examen Físico
                  </button>
                )}
                {fase === "examen" && (
                  <button onClick={() => avanzarFase("presuntivos", "Diagnósticos Presuntivos")}>
                    Avanzar a Diagnósticos Diferenciales
                  </button>
                )}
                {fase === "presuntivos" && (
                  <button onClick={() => avanzarFase("complementarios", "Estudios Complementarios")}>
                    Avanzar a Estudios Complementarios
                  </button>
                )}
                {fase === "complementarios" && (
                  <button className="finalizar-btn" onClick={() => setShowEvaluation(true)}>
                    Finalizar Caso
                  </button>
                )}
              </div>
            )}

            {/* FORMULARIO DE EVALUACIÓN */}
            {showEvaluation && !evaluationResult && (
              <div className="evaluacion-form">
                <h3>Evaluación del Caso</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const lista = diagnosticoInput
                      .split(",")
                      .map((d) => d.trim())
                      .filter((d) => d.length > 0);
                    setDiagnosticosUsuario(lista);
                    handleEvaluation();
                  }}
                >
                  <label>Diagnóstico Presuntivo:</label>
                  <input
                    type="text"
                    value={diagnosticoInput}
                    onChange={(e) => setDiagnosticoInput(e.target.value)}
                    placeholder="Coloque aquí su diagnóstico..."
                  />

                  <label>Tratamiento Inicial:</label>
                  <textarea
                    rows="3"
                    value={tratamientoInput}
                    onChange={(e) => setTratamientoInput(e.target.value)}
                    placeholder="Coloque los tratamientos separados por comas..."
                  />

                  <button type="submit">Enviar</button>
                </form>
              </div>
            )}

            {/* RESULTADOS */}
            {evaluationResult && (
              <div className="evaluacion-resultado">
                <h3>Resultados</h3>
                <p>
                  <strong>Diagnóstico:</strong>{" "}
                  {evaluationResult.diagnosticoOk ? "✅ Correcto" : "❌ Incorrecto"}
                </p>
                <p><strong>Tratamiento:</strong></p>
                <ul>
                  {evaluationResult.correctos?.length > 0 && (
                    <li>✅ Correctos: {evaluationResult.correctos.join(", ")}</li>
                  )}
                  {evaluationResult.faltantes?.length > 0 && (
                    <li>⚠️ Faltaron: {evaluationResult.faltantes.join(", ")}</li>
                  )}
                  {evaluationResult.incorrectos?.length > 0 && (
                    <li>❌ Incorrectos: {evaluationResult.incorrectos.join(", ")}</li>
                  )}
                </ul>

                <h4>🧩 Feedback adicional</h4>
                <ul>
                  <li>{evaluationResult.feedback.anamnesis}</li>
                  <li>{evaluationResult.feedback.examen}</li>
                  <li>{evaluationResult.feedback.estudios}</li>
                </ul>
                <button onClick={() => setSistemaSeleccionado(null)}>Volver a sistemas</button>
              </div>
            )}

            {/* BOTÓN VOLVER (durante el caso) */}
            {!showEvaluation && (
              <button
                className="volver-btn"
                onClick={() => {
                  setSistemaSeleccionado(null);
                  setCaso(null);
                }}
              >
                ← Volver a los sistemas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
