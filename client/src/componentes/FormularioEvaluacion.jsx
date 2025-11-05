import { useState } from "react";

export default function FormularioEvaluacion({ caseData, onVolver }) {
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [resultado, setResultado] = useState(null);

  const normalizar = (txt) =>
    txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const evaluar = (e) => {
    e.preventDefault();
    if (!caseData?.evaluacion) return;

    const esperadoDx = (caseData.evaluacion.diagnostico_presuntivo || []).map(normalizar);
    const esperadoTx = (caseData.evaluacion.tratamiento_inicial_esperado || []).map(normalizar);

    const dxUsuario = normalizar(diagnostico);
    const txUsuario = tratamiento.split(",").map(normalizar);

    const dxCorrecto = esperadoDx.includes(dxUsuario);
    const txCorrectos = txUsuario.filter((t) => esperadoTx.includes(t));
    const txFaltantes = esperadoTx.filter((t) => !txUsuario.includes(t));
    const txIncorrectos = txUsuario.filter((t) => !esperadoTx.includes(t));

    setResultado({
      dxCorrecto,
      txCorrectos,
      txFaltantes,
      txIncorrectos,
    });
  };

  return (
    <div className="evaluacion-card">
      <h3>Evaluación del Caso</h3>

      {!resultado ? (
        <form onSubmit={evaluar} className="evaluacion-form">
          <label>Diagnóstico Presuntivo:</label>
          <input
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            placeholder="Ej: Neumonía bacteriana"
            required
          />

          <label>Tratamiento Inicial (separado por comas):</label>
          <textarea
            rows="3"
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            placeholder="Ej: Amoxicilina, hidratación, reposo"
            required
          />

          <button type="submit">Evaluar</button>
        </form>
      ) : (
        <div className="resultado-evaluacion">
          <h4>Resultados</h4>
          <p>
            <b>Diagnóstico:</b>{" "}
            {resultado.dxCorrecto ? "✅ Correcto" : "❌ Incorrecto"}
          </p>

          <ul>
            {resultado.txCorrectos.length > 0 && (
              <li>✅ Correctos: {resultado.txCorrectos.join(", ")}</li>
            )}
            {resultado.txFaltantes.length > 0 && (
              <li>⚠️ Faltantes: {resultado.txFaltantes.join(", ")}</li>
            )}
            {resultado.txIncorrectos.length > 0 && (
              <li>❌ Incorrectos: {resultado.txIncorrectos.join(", ")}</li>
            )}
          </ul>

          <button onClick={onVolver}>Volver a los sistemas</button>
        </div>
      )}
    </div>
  );
}
