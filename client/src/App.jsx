import { useState } from "react";
import "./estilos/App.css";
import BarraNavegacion from "./componentes/BarraNavegacion.jsx";
import Inicio from "./paginas/Inicio.jsx";
import Tutorial from "./paginas/Tutorial.jsx";
import CasosBasicos from "./paginas/CasosBasicos.jsx";
import CasosAvanzados from "./paginas/CasosAvanzados.jsx";
import Atlas from "./paginas/Atlas.jsx";
import SobreDxPro from "./paginas/SobreDxPro.jsx";
import Login from "./paginas/Login.jsx";
import Registro from "./paginas/Registro.jsx";

export default function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem("usuario")));
  const BACKEND_URL = "https://dxproes-backend.onrender.com";

  return (
    <div className="app-contenedor">
      <BarraNavegacion
        seccion={seccion}
        setSeccion={setSeccion}
        usuario={usuario}
        setUsuario={setUsuario}
      />

      {seccion === "inicio" && <Inicio />}
      {seccion === "tutorial" && <Tutorial />}
      {seccion === "casos-basicos" && <CasosBasicos backendUrl={BACKEND_URL} />}
      {seccion === "casos-avanzados" && <CasosAvanzados />}
      {seccion === "atlas" && <Atlas backendUrl={BACKEND_URL} />}
      {seccion === "sobre-dxpro" && <SobreDxPro />}
      {seccion === "login" && (
        <Login backendUrl={BACKEND_URL} setUsuario={setUsuario} setSeccion={setSeccion} />
      )}
      {seccion === "registro" && <Registro backendUrl={BACKEND_URL} setSeccion={setSeccion} />}

      <footer className="footer">
        DxPRO — Todos los derechos reservados. Proyecto ideado y desarrollado por{" "}
        <b>Hermada, Juan Francisco</b>.
      </footer>
    </div>
  );
}
