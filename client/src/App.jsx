import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./index.css";
import AtlasViewer from "./components/AtlasViewer.jsx";

const SYSTEMS = [
  { id: "todos", label: "Todos" },
  { id: "cardiovascular", label: "Cardiovascular" },
  { id: "respiratorio", label: "Respiratorio" },
  { id: "renal", label: "Renal" },
  { id: "digestivo", label: "Digestivo" },
  { id: "endocrino", label: "Endocrino" }
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const [section, setSection] = useState("inicio");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [caseId, setCaseId] = useState(null);
  const [caseData, setCaseData] = useState(null);

  // Estado de carga para el cartel de espera
  const [loadingCase, setLoadingCase] = useState(false);

  // Estados para evaluación
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [diagnosticoInput, setDiagnosticoInput] = useState("");
  const [tratamientoInput, setTratamientoInput] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);

  // --- Estados propios del Atlas ---
  const [atlasSystem, setAtlasSystem] = useState(null);
  const [atlasSearch, setAtlasSearch] = useState("");

  const [user, setUser] = useState(() => {
  // Recupera usuario desde localStorage (si estaba logueado)
  const saved = localStorage.getItem("user");
  return saved ? JSON.parse(saved) : null;
});
// Estado para detectar universidad elegida en el registro
const [selectedUniversity, setSelectedUniversity] = useState("");

  // >>> NUEVO: estado de la fase del caso
  const [fase, setFase] = useState("anamnesis");
  // fases: anamnesis → examen → presuntivos → complementarios → finalizar caso

  const BACKEND_URL = "https://dxproes-backend.onrender.com";

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

useEffect(() => {
  if (section === "casos-basicos" && selectedSystem) {
    const obtenerCaso = async () => {
      try {
        setLoadingCase(true);

        const qs =
          selectedSystem === "todos"
            ? "?system=all"
            : `?system=${encodeURIComponent(selectedSystem)}`;

        const res = await fetch(`${BACKEND_URL}/api/caso${qs}`);
        if (!res.ok) throw new Error("Error al cargar el caso desde el backend");
        const data = await res.json();

        if (!data || !data.presentacion) {
          throw new Error("El caso clínico no tiene una presentación válida");
        }

        setCaseId(data.casoId);
        setCaseData(data);
        setMessages([{ texto: data.presentacion, autor: "bot" }]);
        setFase("anamnesis");
      } catch (err) {
        console.error("❌ Error al cargar el caso clínico:", err);
        setMessages([
          {
            texto:
              "⚠️ Error al cargar el caso clínico. Verifique su conexión o intente nuevamente.",
            autor: "bot",
          },
        ]);
      } finally {
        setLoadingCase(false);
      }
    };

    obtenerCaso();
  } else {
    // 🔄 Reset de estados si cambia la sección
    setMessages([]);
    setCaseId(null);
    setCaseData(null);
    setShowEvaluation(false);
    setEvaluationResult(null);
    setLoadingCase(false);
    setFase("anamnesis");
  }
}, [section, selectedSystem]);

  const normalizeText = (s) => {
    if (!s && s !== "") return "";
    return String(s)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  };

  const splitUserEntries = (raw) => {
    if (!raw) return [];
    return raw
      .split(/[,;\n]+| y /i)
      .map((s) => s.trim())
      .filter(Boolean);
  };
  
  const evaluarDiferenciales = (entrada) => {
    if (!caseData || !caseData.evaluacion || !Array.isArray(caseData.evaluacion.diagnostico_presuntivo)) return;

    const esperadosRaw = caseData.evaluacion.diagnostico_presuntivo;
    const esperadosNorm = [];
    const seen = new Set();
    for (const e of esperadosRaw) {
      const n = normalizeText(e);
      if (!n) continue;
      if (!seen.has(n)) {
        seen.add(n);
        esperadosNorm.push(n);
      }
    }

    const userEntries = splitUserEntries(entrada);
    const matched = new Set();

    userEntries.forEach((entry) => {
      const en = normalizeText(entry);
      if (!en) return;
      for (let i = 0; i < esperadosNorm.length; i++) {
        if (matched.has(i)) continue;
        const expected = esperadosNorm[i];
        if (expected.includes(en) || en.includes(expected)) {
          matched.add(i);
          break;
        }
      }
    });

    const aciertos = matched.size;
    const totalEsperados = esperadosNorm.length || 1;
    const threshold = Math.ceil(totalEsperados * 0.6); // >=60% para feedback positivo

if (aciertos >= threshold) {
  setMessages((prev) => [
    ...prev,
    {
      texto: "✅ Excelente razonamiento clínico.",
      autor: "sistema",
    },
    {
      texto:
        "Coincidís con la mayoría de los diagnósticos diferenciales esperados.",
      autor: "sistema",
    },
    {
      texto:
        "Podés avanzar a la siguiente fase: *Estudios complementarios*. ¿Qué estudios solicitarías para confirmar o descartar tus diagnósticos?",
      autor: "sistema",
    },
  ]);

  // ✅ Avanza automáticamente de fase
  setTimeout(() => {
    setFase("complementarios");
    setMessages((prev) => [
      ...prev,
      { texto: "--- Estudios Complementarios ---", autor: "sistema" },
    ]);
  }, 3000); // 3 segundos después para dar tiempo a leer el mensaje
} else {
  setMessages((prev) => [
    ...prev,
    {
      texto:
        "⚠️ Has planteado algunos diagnósticos, pero faltan algunos importantes.",
      autor: "sistema",
    },
    {
      texto:
        "Revisá la información del caso e intentá agregar otras posibilidades clínicas antes de avanzar.",
      autor: "sistema",
    },
  ]);
}
  };

  // Enviar mensaje (mejorado: chequeo de fase presuntivos y estudios)
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { texto: input, autor: "usuario" }]);
    const pregunta = input;
    setInput("");

    // >>> NUEVO: chequeo de fase presuntivos
    if (fase === "presuntivos") {
      evaluarDiferenciales(pregunta);
      return;
    }

    // >>> NUEVO: chequeo de estudios complementarios
    if (fase === "complementarios" && caseData?.respuestas) {
      // Construimos un mapa de búsqueda: clave (nombre o variante) -> respuesta textual
      const respuestas = caseData.respuestas || {};
      const estudiosMap = {};

      // Si existe caseData.respuestas.estudios (forma alternativa), respetarla
      if (respuestas.estudios && typeof respuestas.estudios === "object") {
        const estObj = respuestas.estudios;
        for (const k of Object.keys(estObj)) {
          const v = estObj[k];
          if (v && typeof v === "object" && v.respuesta) {
            estudiosMap[normalizeText(k)] = v.respuesta;
            if (Array.isArray(v.variantes)) {
              v.variantes.forEach((varName) => {
                estudiosMap[normalizeText(varName)] = v.respuesta;
              });
            }
          } else if (typeof v === "string") {
            estudiosMap[normalizeText(k)] = v;
          }
        }
      }

      for (const key of Object.keys(respuestas)) {
        if (key === "estudios") continue; 
        const val = respuestas[key];
        if (typeof val === "string") {
          estudiosMap[normalizeText(key)] = val;
        } else if (val && typeof val === "object") {
          
          if (val.respuesta) {
            estudiosMap[normalizeText(key)] = val.respuesta;
          }
          if (Array.isArray(val.variantes)) {
            val.variantes.forEach((v) => {
              estudiosMap[normalizeText(v)] = val.respuesta || (typeof val === "string" ? val : "");
            });
          }
        }
      }

      // Intentamos encontrar una clave que aparezca en la pregunta del usuario (normalizada)
      const preguntaNorm = normalizeText(pregunta);
      let encontrado = null;
      // Buscamos coincidencia por substring (clave en pregunta) o pregunta en clave
      for (const k of Object.keys(estudiosMap)) {
        if (!k) continue;
        if (preguntaNorm.includes(k) || k.includes(preguntaNorm)) {
          encontrado = k;
          break;
        }
      }

      if (encontrado) {
        setMessages((prev) => [
          ...prev,
          { texto: estudiosMap[encontrado], autor: "bot" }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { texto: "Parámetros dentro de lo normal.", autor: "sistema" }
        ]);
      }
      return;
    }

    // Si no es presuntivos ni complementarios, hacemos la consulta normal al backend
    try {
      const respuesta = await fetch(`${BACKEND_URL}/api/preguntar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, caseId }),
      });
      const data = await respuesta.json();

      if (Array.isArray(data.respuestas)) {
        setMessages((prev) => [
          ...prev,
          ...data.respuestas.map((r) => ({ texto: r, autor: "bot" })),
        ]);
      } else if (data.respuesta) {
        setMessages((prev) => [...prev, { texto: data.respuesta, autor: "bot" }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { texto: "⚠️ Respuesta no válida", autor: "bot" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { texto: "⚠️ Error al conectar con el servidor", autor: "bot" },
      ]);
    }
  };

  // Volver a la selección de sistemas
  const handleBackToSystems = () => {
    setSelectedSystem(null);
    setMessages([]);
    setCaseId(null);
    setCaseData(null);
    setShowEvaluation(false);
    setEvaluationResult(null);
    setLoadingCase(false);
    setFase("anamnesis");
  };

  // >>> NUEVO: función para avanzar de fase con separador + mensaje opcional
  const avanzarFase = (nuevaFase, textoSeparador, mensajeExtra = null) => {
    setFase(nuevaFase);
    let nuevosMensajes = [
      { texto: `--- ${textoSeparador} ---`, autor: "sistema" }
    ];
    if (mensajeExtra) {
      nuevosMensajes.push({ texto: mensajeExtra, autor: "sistema" });
    }
    setMessages((prev) => [...prev, ...nuevosMensajes]);
  };

  // Evaluar respuestas (ahora sin evento como parámetro)
  const handleEvaluation = () => {
    if (!caseData || !caseData.evaluacion) return;

    const diagnosticosCorrectos = (caseData.evaluacion.diagnostico_presuntivo || []).map(d => normalizeText(d));
    const tratamientosCorrectos = (caseData.evaluacion.tratamiento_inicial_esperado || []).map(t => normalizeText(t));

    const diagnosticoUser = normalizeText(diagnosticoInput);
    const tratamientosUser = tratamientoInput.split(",").map(t => normalizeText(t));

    const diagnosticoOk = diagnosticosCorrectos.includes(diagnosticoUser);

    const correctos = tratamientosUser.filter(t => tratamientosCorrectos.includes(t) && t.length > 0);
    const faltantes = tratamientosCorrectos.filter(t => !tratamientosUser.includes(t));
    const incorrectos = tratamientosUser.filter(t => !tratamientosCorrectos.includes(t) && t.length > 0);

    setEvaluationResult({
      diagnosticoOk,
      correctos,
      faltantes,
      incorrectos,
    });
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
  <div className="navbar-inner">
    <div className="navbar-left">
      <img src="/otros/DxPro.png" alt="DxPro Logo" className="nav-logo" />
    </div>

    <div className="navbar-center">
      <button className="nav-btn" onClick={() => setSection("inicio")}>Inicio</button>
      <button className="nav-btn" onClick={() => setSection("tutorial")}>Tutorial</button>
      <button className="nav-btn" onClick={() => setSection("casos-basicos")}>Básico</button>
      <button className="nav-btn" onClick={() => setSection("casos-avanzados")}>Avanzado</button>
      <button className="nav-btn" onClick={() => setSection("atlas")}>Atlas Semiológico</button>
      <button className="nav-btn" onClick={() => setSection("sobre-dxpro")}>Sobre DxPro</button>
    </div>

    <div className="navbar-right">
  {user ? (
    <>
      <span className="user-info">👤 {user.fullName.split(" ")[0]}</span>
      <button
        className="nav-btn logout-btn"
        onClick={() => {
          localStorage.removeItem("user");
          setUser(null);
          alert("Sesión cerrada correctamente");
          setSection("inicio");
        }}
      >
        Cerrar sesión
      </button>
    </>
  ) : (
    <button
      className="nav-btn ingresar-btn"
      onClick={() => setSection("login")}
    >
      Ingresar
    </button>
  )}
</div>
  </div>
</nav>
      {/* --- SECCIONES --- */}
      {section === "inicio" && (
        <div className="section card">
          <h1>BIENVENIDO A DXPRO</h1>
          <p>
            "DxPro es un simulador virtual de casos clínicos diseñado para que puedas poner en práctica y fortalecer tus habilidades clínicas en un entorno interactivo. Forma parte de un proyecto de investigación sobre el uso de herramientas digitales —incluyendo inteligencia artificial— en la formación académica de estudiantes de Medicina y Enfermería. El desarrollo se lleva adelante en la Facultad de Ciencias de la Salud perteneciente a la Universidad Nacional del Centro de la Provincia de Buenos Aires."
          </p>
          <div className="logos-inicio">
            <img src="/otros/DxPro.png" alt="DxPro Logo" className="logo-principal" />
            <img src="/otros/logo facultad inicio.png" alt="Facultad Logo Inicio" className="logo-facultad" />
            <img src="/otros/unicen logo.png" alt="Universidad Logo Inicio" className="logo-universidad" />
          </div>
        </div>
      )}

      {section === "tutorial" && (
        <div className="section card">
          <h2>Tutorial</h2>
          <ol className="tutorial-list">
            <li>
              Se le presentará un paciente con un motivo de consulta inicial. 
              El primer paso será realizar una anamnesis completa, formulando preguntas que considere relevantes. 
              Cuando crea que la anamnesis está finalizada, deberá pulsar el botón <b>"Avanzar a Examen Físico"</b>.
            </li>
            <li>
              En la fase de examen físico, podrá indicar qué maniobras desea realizar 
              (ejemplo: auscultación cardíaca, palpación abdominal). 
              Una vez completada, deberá pulsar el botón <b>"Avanzar a Diagnósticos Diferenciales"</b>.
            </li>
            <li>
              En la etapa de diagnósticos diferenciales, deberá proponer las posibles causas del cuadro clínico en base a la información recogida. 
              Al enviar su listado, el sistema le dará feedback (positivo si acertó la mayoría, o una invitación a pensar otras posibilidades si faltaron diagnósticos). 
              Luego deberá pulsar <b>"Avanzar a Estudios Complementarios"</b>.
            </li>
            <li>
              En la fase de estudios complementarios, podrá solicitar los estudios que correspondan a cada diagnóstico diferencial. 
              En los casos básicos, el sistema mostrará directamente el resultado textual de cada estudio. 
              En los casos avanzados, el sistema devolverá únicamente el material (imagen, audio, etc.) y será el usuario quien deba interpretarlo. 
              Cuando finalice, deberá pulsar <b>"Finalizar caso"</b>.
            </li>
            <li>
              Finalmente, en la etapa de evaluación, podrá ingresar su diagnóstico principal y el tratamiento inicial que considere adecuado, 
              tras lo cual recibirá una retroalimentación formativa.
            </li>
          </ol>
        </div>
      )}

      {section === "casos-basicos" && (
        <div className="caso-section main-layout">
          <h2>Casos Básicos</h2>

          {!selectedSystem ? (
            <div className="systems-grid">
              <h3>Seleccioná un sistema</h3>
              <div className="systems-list">
                {SYSTEMS.map((s) => (
                  <button
                    key={s.id}
                    className="system-card"
                    onClick={() => setSelectedSystem(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : loadingCase ? (
            // <-- CARTEL DE ESPERA (se muestra mientras carga el caso)
            <div className="loading-card">
              <p>⏳ Espere mientras cargamos su caso clínico...</p>
            </div>
          ) : (
            <div className="chat-wrapper">
              <div className="chat-card">
                <div className="chat-header">
                  <img src="/otros/DxPro.png" alt="DxPro Logo" className="logo-chat" />
                  <h1 className="chat-title">Simulación de Caso</h1>
                  <button className="mini-btn" onClick={handleBackToSystems}>
                    ← Volver a sistemas
                  </button>
                </div>

                <div className="chat-box">
                  {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.autor}`}>
                      {msg.texto}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {!showEvaluation && !evaluationResult && (
                  <div className="input-area">
                    <input
                      type="text"
                      placeholder="Escribe tu pregunta al paciente..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Enviar</button>
                  </div>
                )}

                {/* >>> NUEVO BLOQUE DE FLUJO ESTRUCTURADO */}
                {caseData && !showEvaluation && !evaluationResult && (
                  <div className="fase-buttons">
                    {fase === "anamnesis" && (
                      <button onClick={() => avanzarFase("examen", "Inicio del Examen Físico")}>
                        Avanzar a Examen Físico
                      </button>
                    )}
                    {fase === "examen" && (
                      <button onClick={() => avanzarFase(
                        "presuntivos",
                        "Diagnósticos Diferenciales"
                        )}>
                        Avanzar a Diagnósticos Diferenciales
                      </button>
                    )}
                    {fase === "presuntivos" && (
                      <button onClick={() => avanzarFase(
                        "complementarios",
                        "Estudios Complementarios"
                      )}>
                        Avanzar a Estudios Complementarios
                      </button>
                    )}
                    {fase === "complementarios" && (
                      <button 
                        className="finalizar-btn" 
                        onClick={() => setShowEvaluation(true)}
                      >
                        Finalizar Caso
                      </button>
                    )}
                  </div>
                )}
                {/* <<< FIN NUEVO BLOQUE */}

                {showEvaluation && !evaluationResult && (
                  <div className="evaluacion-form">
                    <h3>Evaluación del Caso</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault(); // evita refrescar la página
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
                        placeholder="Coloque aquí los tratamientos separados por comas..."
                      />

                      <button type="submit">Enviar</button>
                    </form>
                  </div>
                )}

                {/* Resultados Evaluación */}
                {evaluationResult && (
                  <div className="evaluacion-resultado">
                    <h3>Resultados</h3>
                    <p><strong>Diagnóstico:</strong> {evaluationResult.diagnosticoOk ? "✅ Correcto" : "❌ Incorrecto"}</p>
                    <p><strong>Tratamiento:</strong></p>
                    <ul>
                      {evaluationResult.correctos.length > 0 && (
                        <li>✅ Correctos: {evaluationResult.correctos.join(", ")}</li>
                      )}
                      {evaluationResult.faltantes.length > 0 && (
                        <li>⚠️ Faltaron: {evaluationResult.faltantes.join(", ")}</li>
                      )}
                      {evaluationResult.incorrectos.length > 0 && (
                        <li>❌ Incorrectos: {evaluationResult.incorrectos.join(", ")}</li>
                      )}
                    </ul>
                    <button onClick={handleBackToSystems}>Volver a sistemas</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {section === "casos-avanzados" && (
  <div className="section card">
    <h2>Casos Avanzados</h2>
    <p>
      Casos de mayor complejidad que requieren un razonamiento clínico más profundo. 
      Aquí el usuario deberá interpretar directamente los estudios complementarios 
      (imágenes, audios de auscultación, registros) y tomar decisiones sin que el sistema 
      brinde explicaciones automáticas. Esta sección busca simular la práctica clínica real.
    </p>

    <div 
      style={{
        marginTop: "20px",
        padding: "12px 16px",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeeba",
        borderRadius: "8px",
        color: "#856404",
        fontWeight: "bold",
        textAlign: "center"
      }}
    >
      ⚠️ Sección en desarrollo. Pronto habrá más novedades.
    </div>
  </div>
)}

{section === "atlas" && (
  <div className="atlas-section main-layout">
    <h2>Atlas Semiológico</h2>
    <p>
      Explora los principales signos y maniobras semiológicas clasificados por sistema.
      Podés buscar por nombre o filtrar por sistema corporal.
    </p>

    {/* 🔍 Buscador */}
    <div className="atlas-search">
      <input
        type="text"
        placeholder="Buscar signo, soplo, maniobra..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>

    {/* 📚 Menú lateral */}
    <div className="atlas-layout">
      <aside className="atlas-sidebar">
        <h3>Sistemas</h3>
        <ul>
          {["Cardiovascular", "Respiratorio", "Abdomen", "Neurológico", "Otros"].map((s) => (
            <li
              key={s}
              className={selectedSystem === s ? "active" : ""}
              onClick={() => setSelectedSystem(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      </aside>

      {/* 🔊 Contenido del atlas */}
      <div className="atlas-content">
        {!selectedSystem && !input && (
          <p className="atlas-placeholder">
            Seleccioná un sistema o buscá un signo para comenzar.
          </p>
        )}

        {selectedSystem && (
          <AtlasViewer
            system={selectedSystem?.toLowerCase()}
            searchQuery={input}
            backendUrl={BACKEND_URL}
          />
        )}
      </div>
    </div>
  </div>
)}

{section === "sobre-dxpro" && (
  <div className="section card">
    <h2>Sobre DxPro</h2>
    <p>
      <b>DxPro</b> es una plataforma educativa desarrollada en la 
      Facultad de Ciencias de la Salud (UNCPBA) con el objetivo de 
      fortalecer la enseñanza del razonamiento clínico mediante 
      simulaciones interactivas, para favorecer la toma 
      de decisiones diagnósticas y terapéuticas.
      Los casos clínicos están diseñados por un equipo multidisciplinario 
      de docentes y estudiantes avanzados, asegurando rigurosidad científica 
      y relevancia pedagógica.
    </p>

    <h3>Aspectos legales</h3>
    <p>
      © 2025 DxPro — Todos los derechos reservados.  
      El uso de esta plataforma tiene fines exclusivamente educativos.  
      DxPro no reemplaza el juicio clínico profesional ni constituye 
      una herramienta de diagnóstico médico real.
    </p>

    <h3>Equipo de trabajo</h3>
<div className="equipo-carrusel">
  <div className="miembro">
    <img src="/equipo/juan.png" alt="Hermada, Juan Francisco" />
    <h4>Hermada, Juan Francisco</h4>
    <p>Idea, desarrollo web y soporte técnico del Proyecto</p>
    <small>Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

  <div className="miembro">
    <img src="/equipo/nico.png" alt="Pereyra Diaz, Nicolas" />
    <h4>Pereyra Diaz, Nicolas</h4>
    <p>Director del Proyecto</p>
    <small>Médico especialista en Medicina General y Familiar; Docente. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

  <div className="miembro">
    <img src="/equipo/pablito.png" alt="Guzman, Pablo" />
    <h4>Guzman, Pablo</h4>
    <p>Asesoría técnica en Simulación</p>
    <small>Encargado del área de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

  <div className="miembro">
    <img src="/equipo/rodri.png" alt="Rinomo Guzman, Rodrigo" />
    <h4>Rinomo Guzman, Rodrigo</h4>
    <p>Alfa tester de la plataforma, asistente de desarrollo de casos clínicos</p>
    <small>Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

<div className="miembro">
    <img src="/equipo/joaco.png" alt="Maldonado, Joaquín" />
    <h4>Maldonado, Joaquín</h4>
    <p>Asistencia en desarrollo web y soporte técnico; diseño visual y comunicación</p>
    <small>Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

  <div className="miembro">
    <img src="/equipo/resti.png" alt="Restivo, Franco Nicolas" />
    <h4>Restivo, Franco Nicolas</h4>
    <p>Alfa tester de la plataforma</p>
    <small>Estudiante avanzado de Medicina.  — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

  <div className="miembro">
    <img src="/equipo/fede.png" alt="Lencina, Federico" />
    <h4>Lencina, Federico</h4>
    <p>Asesoría en el armado, testeo y corrección de casos clínicos</p>
    <small>Médico Residente de Clínica Médica. — Hospital Héctor M. Cura</small>
  </div>

<div className="miembro">
    <img src="/equipo/vini.png" alt="De Oliveira Alves, Vinicius" />
    <h4>De Oliveira Alves, Vinicius</h4>
    <p>Asesoría en el armado, testeo y corrección de casos clínicos</p>
    <small>Médico Residente de Terapia Intensiva. — Hospital Héctor M. Cura</small>
  </div>

<div className="miembro">
    <img src="/equipo/arbi.png" alt="Arbillaga, Tomás" />
    <h4>Arbillaga, Tomás</h4>
    <p>Asesoría en el armado, testeo y corrección de casos clínicos</p>
    <small>Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

<div className="miembro">
    <img src="/equipo/ivo.png" alt="Hait, Ivo" />
    <h4>Hait, Ivo</h4>
    <p>Asistencia en desarrollo web y soporte técnico.</p>
    <small>Estudiante intermedio de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

<div className="miembro">
    <img src="/equipo/leo.png" alt="Martinez Binelli, Leonetto Agustín" />
    <h4>Martinez Binelli, Leonetto Agustín</h4>
    <p>Alfa tester de la plataforma</p>
    <small>Estudiante avanzado de Medicina.  — Facultad de Ciencias de la Salud (UNCPBA)</small>
  </div>

</div>

    <h3>Contacto</h3>
    <p>
      Para consultas, sugerencias o información institucional, 
      escribinos a: <b>dxproes@gmail.com</b>
    </p>
  </div>
)}
{section === "register" && (
  <div className="section card">
    <h2>CREAR CUENTA</h2>
    <form
  className="auth-form"
  onSubmit={async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
const payload = Object.fromEntries(formData.entries());
try {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registro exitoso. Ya podés iniciar sesión.");
        setSection("login");
      } else {
        alert("⚠️ " + (data.error || "Error al registrar usuario"));
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error al conectar con el servidor.");
    }
  }}
>
  <label>Nombre completo:</label>
  <input type="text" name="fullName" required />

  <label>Correo electrónico:</label>
  <input type="email" name="email" required />

  <label>Contraseña:</label>
  <input type="password" name="password" required />

  <label>DNI:</label>
  <input type="text" name="dni" required />

  <label>Universidad:</label>
  <select
    name="universidad"
    required
    value={selectedUniversity}
    onChange={(e) => setSelectedUniversity(e.target.value)}
  >
    <option value="">Seleccionar universidad...</option>
    <option value="UNCPBA">Universidad Nacional del Centro de la Provincia de Buenos Aires</option>
    <option value="OTRA">Otra / No listada</option>
  </select>

  {/* Mostrar certificado y precio según universidad */}
  {selectedUniversity === "UNCPBA" ? (
    <>
      <label>Certificado de alumno regular (PDF):</label>
      <input type="file" accept="application/pdf" name="certificate" required />
      <p className="price-info">💸 Precio mensual: <b>$0</b> (Convenio con UNCPBA)</p>
    </>
  ) : selectedUniversity ? (
    <p className="price-info">💸 Precio mensual: <b>$3000</b></p>
  ) : null}

  <button type="submit">Registrarme</button>
</form>
    <div className="switch-auth">
      <p>¿Ya tienes una cuenta?</p>
      <button
        className="link-btn"
        onClick={() => setSection("login")}
      >
        Inicia sesión aquí
      </button>
    </div>
  </div>
)}

{section === "login" && (
  <div className="section card">
    <h2>Iniciar sesión</h2>
    <form
  className="auth-form"
  onSubmit={async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Bienvenido ${data.fullName}!`);
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data); // ← actualizamos el estado
        setSection("inicio");
      } else {
        alert("⚠️ " + (data.error || "Error al iniciar sesión"));
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error al conectar con el servidor.");
    }
  }}
>
  <label>Correo electrónico:</label>
  <input type="email" name="email" required />

  <label>Contraseña:</label>
  <input type="password" name="password" required />

  <button type="submit">Ingresar</button>
</form>

    <div className="switch-auth">
      <p>¿Aún no tienes una cuenta?</p>
      <button
        className="link-btn"
        onClick={() => setSection("register")}
      >
        Regístrate aquí
      </button>
    </div>
  </div>
)}
<footer className="footer">
  <p>
    DxPRO — Todos los derechos reservados. Proyecto ideado y desarrollado por 
    <b> Hermada, Juan Francisco</b>.
  </p>
</footer>
</div>
  );
}