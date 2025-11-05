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
  const [loadingCase, setLoadingCase] = useState(false);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [diagnosticoInput, setDiagnosticoInput] = useState("");
  const [tratamientoInput, setTratamientoInput] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [atlasSearch, setAtlasSearch] = useState("");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [fase, setFase] = useState("anamnesis");

  // 🔗 URL del backend Render
  const BACKEND_URL = "https://dxproes-backend.onrender.com";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // === Cargar casos desde Render ===
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
          if (!res.ok) throw new Error("Error al cargar el caso");
          const data = await res.json();

          if (!data.presentacion)
            throw new Error("El caso no tiene presentación válida");

          setCaseId(data.casoId);
          setCaseData(data);
          setMessages([{ texto: data.presentacion, autor: "bot" }]);
          setFase("anamnesis");
        } catch (err) {
          console.error("❌ Error al cargar el caso:", err);
          setMessages([
            { texto: "⚠️ Error al cargar el caso clínico.", autor: "bot" },
          ]);
        } finally {
          setLoadingCase(false);
        }
      };
      obtenerCaso();
    } else {
      setMessages([]);
      setCaseId(null);
      setCaseData(null);
      setShowEvaluation(false);
      setEvaluationResult(null);
      setLoadingCase(false);
      setFase("anamnesis");
    }
  }, [section, selectedSystem]);

  // === Enviar preguntas al backend ===
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { texto: input, autor: "usuario" }]);
    const pregunta = input;
    setInput("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/preguntar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, caseId }),
      });
      const data = await res.json();

      const respuesta =
        data.respuesta || "⚠️ No se encontró respuesta para esa pregunta.";
      setMessages((prev) => [...prev, { texto: respuesta, autor: "bot" }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { texto: "⚠️ Error al conectar con el servidor.", autor: "bot" },
      ]);
    }
  };

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

  // === Evaluar diagnóstico y tratamiento ===
  const handleEvaluation = () => {
    if (!caseData || !caseData.evaluacion) return;
    const normalize = (s) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const evalData = caseData.evaluacion;

    const diagEsperado = (evalData.diagnostico_presuntivo || []).map(normalize);
    const tratEsperado = (evalData.tratamiento_inicial_esperado || []).map(
      normalize
    );

    const diagOk = diagEsperado.includes(normalize(diagnosticoInput));
    const tratUser = tratamientoInput
      .split(",")
      .map((t) => normalize(t.trim()))
      .filter(Boolean);

    const correctos = tratUser.filter((t) => tratEsperado.includes(t));
    const faltantes = tratEsperado.filter((t) => !tratUser.includes(t));
    const incorrectos = tratUser.filter(
      (t) => !tratEsperado.includes(t) && t.length > 0
    );

    setEvaluationResult({ diagOk, correctos, faltantes, incorrectos });
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <img src="/DxPro.png" alt="DxPro Logo" className="nav-logo" />
          </div>

          <div className="navbar-center">
            <button className="nav-btn" onClick={() => setSection("inicio")}>
              Inicio
            </button>
            <button className="nav-btn" onClick={() => setSection("casos-basicos")}>
              Básico
            </button>
            <button className="nav-btn" onClick={() => setSection("atlas")}>
              Atlas Semiológico
            </button>
          </div>

          <div className="navbar-right">
            {user ? (
              <>
                <span className="user-info">
                  👤 {user.fullName.split(" ")[0]}
                </span>
                <button
                  className="nav-btn logout-btn"
                  onClick={() => {
                    localStorage.removeItem("user");
                    setUser(null);
                    alert("Sesión cerrada");
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

      {/* === SECCIONES === */}
      {section === "inicio" && (
        <div className="section card">
          <h1>Bienvenido a DxPro</h1>
          <p>
            Simulador de casos clínicos desarrollado en la Facultad de Ciencias
            de la Salud (UNCPBA). Practicá tu razonamiento clínico en un entorno
            interactivo.
          </p>
        </div>
      )}

      {section === "casos-basicos" && (
        <div className="section card">
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
            <p>⏳ Cargando caso...</p>
          ) : (
            <div className="chat-wrapper">
              <div className="chat-box">
                {messages.map((m, i) => (
                  <div key={i} className={`message ${m.autor}`}>
                    {m.texto}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="input-area">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Escribí tu pregunta..."
                />
                <button onClick={handleSendMessage}>Enviar</button>
              </div>

              <button className="mini-btn" onClick={handleBackToSystems}>
                ← Volver
              </button>
            </div>
          )}
        </div>
      )}

      {section === "atlas" && (
        <div className="section card">
          <h2>Atlas Semiológico</h2>
          <p>Explorá sonidos y maniobras según sistema.</p>

          <div className="atlas-layout">
            <aside className="atlas-sidebar">
              <ul>
                {["Cardiovascular", "Respiratorio", "Abdomen"].map((s) => (
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

            <div className="atlas-content">
              {selectedSystem ? (
                <AtlasViewer
                  system={selectedSystem.toLowerCase()}
                  searchQuery={atlasSearch}
                  backendUrl={BACKEND_URL}
                />
              ) : (
                <p>Seleccioná un sistema para comenzar.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {section === "login" && (
        <div className="section card">
          <h2>Iniciar Sesión</h2>
          <form
            className="auth-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData(e.target);
              const email = data.get("email");
              const password = data.get("password");

              try {
                const res = await fetch(`${BACKEND_URL}/auth/login`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const json = await res.json();

                if (res.ok) {
                  localStorage.setItem("user", JSON.stringify(json));
                  setUser(json);
                  alert(`✅ Bienvenido ${json.fullName}`);
                  setSection("inicio");
                } else alert(json.error || "Error al iniciar sesión");
              } catch (err) {
                alert("⚠️ Error al conectar con el servidor");
              }
            }}
          >
            <label>Email:</label>
            <input name="email" type="email" required />

            <label>Contraseña:</label>
            <input name="password" type="password" required />

            <button type="submit">Ingresar</button>
          </form>
        </div>
      )}
    </div>
  );
}
