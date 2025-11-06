import { useState } from "react";
import "../estilos/Secciones.css";

export default function Atlas({ backendUrl }) {
  const [busqueda, setBusqueda] = useState("");
  const [sistema, setSistema] = useState(null);

  const SISTEMAS = ["Cardiovascular", "Respiratorio", "Abdomen", "Neurológico", "Otros"];

  return (
    <div className="seccion atlas">
      <div className="card">
        <h2>Atlas Semiológico</h2>
        <p>
          Explora los signos, maniobras y hallazgos clínicos clasificados por sistema. Este atlas está diseñado para ayudarte a reconocer los principales signos físicos y correlacionarlos con los distintos cuadros clínicos.
        </p>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar signo, soplo o maniobra..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />

        {/* Botones de sistemas */}
        <h3>Sistemas</h3>
        <div className="atlas-sistemas">
          {SISTEMAS.map((s) => (
            <button
              key={s}
              className={sistema === s ? "activo" : ""}
              onClick={() => setSistema(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mensaje o componente */}
        <div className="atlas-resultado">
          {sistema ? (
            <p>Mostrando resultados para el sistema: <strong>{sistema}</strong></p>
          ) : (
            <p className="atlas-placeholder">
              Seleccioná un sistema o buscá un signo para comenzar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
