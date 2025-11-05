import { useState } from "react";
import AtlasViewer from "../componentes/AtlasViewer.jsx";

export default function Atlas({ backendUrl }) {
  const [busqueda, setBusqueda] = useState("");
  const [sistema, setSistema] = useState(null);

  const SISTEMAS = ["Cardiovascular", "Respiratorio", "Abdomen", "Neurológico", "Otros"];

  return (
    <div className="seccion card">
      <h2>Atlas Semiológico</h2>
      <p>Explora los signos, maniobras y hallazgos clínicos clasificados por sistema.</p>

      <input
        type="text"
        placeholder="Buscar signo, soplo o maniobra..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="input-busqueda"
      />

      <div className="atlas-layout">
        <aside className="atlas-sidebar">
          <h3>Sistemas</h3>
          <ul>
            {SISTEMAS.map((s) => (
              <li
                key={s}
                className={sistema === s ? "activo" : ""}
                onClick={() => setSistema(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        </aside>

        <div className="atlas-contenido">
          {!sistema && !busqueda && (
            <p className="atlas-placeholder">
              Seleccioná un sistema o buscá un signo para comenzar.
            </p>
          )}

          {sistema && (
            <AtlasViewer
              system={sistema.toLowerCase()}
              searchQuery={busqueda}
              backendUrl={backendUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}
