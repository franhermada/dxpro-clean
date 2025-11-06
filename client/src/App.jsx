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

      <main>
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
      </main>

      <footer className="footer">
        DxPRO — Todos los derechos reservados. Proyecto ideado y desarrollado por{" "}
        <b>Hermada, Juan Francisco</b>.
      </footer>
    </div>
  );
}
