import { useState } from "react";
import "./estilos/App.css";
import BarraNavegacion from "./componentes/BarraNavegacion";
import Inicio from "./paginas/Inicio";
import Tutorial from "./paginas/Tutorial";
import CasosBasicos from "./paginas/CasosBasicos";
import CasosAvanzados from "./paginas/CasosAvanzados";
import Atlas from "./paginas/Atlas";
import SobreDxPro from "./paginas/SobreDxPro";
import Login from "./paginas/Login";
import Registro from "./paginas/Registro";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem("usuario")));

  // 🌐 URLs de backend
  const LOCAL_BACKEND = "http://localhost:5000";
  const REMOTE_BACKEND = "https://dxproes-backend.onrender.com";

  // 🧠 Detecta entorno
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    window.location.protocol === "file:";

  // 🪄 Sistema híbrido: testea backend local y cae al remoto si no responde
  const [BACKEND_URL, setBACKEND_URL] = useState(
    isLocal ? LOCAL_BACKEND : REMOTE_BACKEND
  );

  // Testeo automático del backend local cuando inicia
  useState(() => {
    if (isLocal) {
      fetch(`${LOCAL_BACKEND}/`)
        .then((res) => {
          if (res.ok) {
            console.log("✅ Conectado al backend local");
            setBACKEND_URL(LOCAL_BACKEND);
          } else {
            throw new Error("Local backend no responde");
          }
        })
        .catch(() => {
          console.warn("⚠️ Backend local no disponible, usando Render");
          setBACKEND_URL(REMOTE_BACKEND);
          toast.info("Usando backend en la nube (Render)");
        });
    } else {
      setBACKEND_URL(REMOTE_BACKEND);
    }
  }, []);

  console.log("🌐 Backend activo:", BACKEND_URL);

  return (
    <div className="app-contenedor">
      <BarraNavegacion
        seccion={seccion}
        setSeccion={setSeccion}
        usuario={usuario}
        setUsuario={setUsuario}
      />

      <main>
        {seccion === "inicio" && <Inicio />}
        {seccion === "tutorial" && <Tutorial />}
        {seccion === "casos-basicos" && <CasosBasicos backendUrl={BACKEND_URL} />}
        {seccion === "casos-avanzados" && <CasosAvanzados />}
        {seccion === "atlas" && <Atlas />}
        {seccion === "sobre-dxpro" && <SobreDxPro />}
        {seccion === "login" && (
          <Login backendUrl={BACKEND_URL} setUsuario={setUsuario} setSeccion={setSeccion} />
        )}
        {seccion === "registro" && (
          <Registro backendUrl={BACKEND_URL} setSeccion={setSeccion} />
        )}
      </main>

      <footer className="footer">
        DxPRO — Todos los derechos reservados. Proyecto ideado y desarrollado por{" "}
        <b>Hermada, Juan Francisco</b>.
      </footer>

      {/* 🟣 Contenedor global de Toastify */}
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}
