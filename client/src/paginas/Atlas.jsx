import React, { useState } from "react";
import "../estilos/Secciones.css";

const BASE_URL = "/atlas_semiologico";

const Atlas = () => {
  const [sistemaActivo, setSistemaActivo] = useState(null);
  const [temaActivo, setTemaActivo] = useState(null);

    const atlasData = {
    maniobras: {
      nombre: "Maniobras",
      color: "#c77dff",
      temas: [
        {
          titulo: "Maniobra de Valsalva",
          tipo: "Fisiológica / Diagnóstica",
          descripcion:
            "Se le pide al paciente que realice una espiración forzada contra glotis cerrada. Útil para evaluar el comportamiento de soplos cardíacos o disfunciones autonómicas.",
          momento: "Durante la fase de esfuerzo se reduce el retorno venoso.",
          imagen: `${BASE_URL}/maniobras/imagenes/valsalva.png`,
        },
      ],
    },
    cardiovascular: {
      nombre: "Cardiovascular",
      color: "#007b5e",
      temas: [
        {
          titulo: "Ruidos cardíacos normales",
          tipo: "Fisiológicos",
          descripcion: "El Primer Ruido (R1) marca el inicio de la sístole y es producido principalmente por el cierre de las válvulas Mitral y Tricúspide (AV). El Segundo Ruido (R2) marca el inicio de la diástole y es producido por el cierre de las válvulas Aórtica y Pulmonar (semilunares).",
          localizacion: "Se escucha en todos los focos. R1 es más intenso en el ápex (foco mitral). R2 es más intenso en la base (focos aórtico y pulmonar).",
          momento: "R1: Inicio de Sístole / R2: Inicio de Diástole",  
          audio: `${BASE_URL}/cardiovascular/audios/ruidos_normales_r1_r2.mp3`,
          imagen: `${BASE_URL}/cardiovascular/imagenes/diagrama_ruidos_normales.png`,
        },
        {
          titulo: "R3",
          tipo: "Patológico (Generalmente) / Fisiológico (Raro)",
          descripcion:
            "Ruido de baja frecuencia (grave) que se escucha al inicio de la diástole. Se produce por la vibración brusca del ventrículo al llenarse rápidamente debido a una sobrecarga de volumen o disfunción sistólica (Insuficiencia Cardíaca).",
          localizacion: "Ápex (Foco Mitral), con el paciente en decúbito lateral izquierdo.",
          momento: "Diástole temprana (protodiástole), inmediatamente después del R2.",
          clave: "Sordo, retumbante. Forma un ritmo de 'galope' (lub-dub-TA).",
          audio: "/atlas/cardiovascular/audios/r3r4.mp3",
          imagen: "/atlas/cardiovascular/imagenes/r3r4.png",
        },
        {
          titulo: "R4",
          tipo: "Patológico",
          descripcion:
            "Ruido de baja frecuencia que se escucha al final de la diástole. Se produce por la contracción auricular forzada que intenta llenar un ventrículo con baja distensibilidad o muy rígido (rigidez ventricular). Se asocia a hipertensión o isquemia.",
          localizacion: "Ápex (Foco Mitral), también en el decúbito lateral izquierdo.",
          momento: "Diástole tardía (presístole), inmediatamente antes del R1.",
         clave: "Sordo, retumbante. Forma un ritmo de 'galope' (TA-lub-dub).",
          imagen: "/atlas/cardiovascular/imagenes/r3r4.png",
          audio: "/atlas/cardiovascular/audios/r3r4.mp3",
        },
      ],
    },
    respiratorio: {
      nombre: "Respiratorio",
      color: "#0072B2",
      temas: [
        {
          titulo: "Sibilancias",
          tipo: "Sonidos agregados",
          descripcion:
            "Ruidos musicales agudos que se producen por estrechamiento de las vías aéreas.",
          imagen: "/atlas/respiratorio/imagenes/sibilancias.png",
          audio: "/atlas/respiratorio/audios/sibilancias.mp3",
        },
      ],
    },
    abdomen: {
      nombre: "Abdomen",
      color: "#ff8800",
      temas: [
        {
          titulo: "Auscultación abdominal",
          tipo: "Fisiológica",
          descripcion:
            "Permite evaluar ruidos intestinales y soplos vasculares. Normalmente se escuchan gorgoteos cada 5-10 segundos.",
          imagen: `${BASE_URL}/abdomen/imagenes/ruidos_intestinales.png`,
        },
      ],
    },
    neurologico: {
      nombre: "Neurológico",
      color: "#1a73e8",
      temas: [
        {
          titulo: "Reflejo patelar",
          tipo: "Fisiológico",
          descripcion:
            "Se percute el tendón rotuliano con un martillo. Produce contracción del cuádriceps y extensión de la pierna.",
          imagen: `${BASE_URL}/neurologico/imagenes/reflejo_patela.png`,
        },
      ],
    },
  };

  const sistemas = Object.keys(atlasData);

  return (
    <div className="seccion atlas">
      <div className="card">
        <h1>ATLAS SEMIOLÓGICO</h1>
        <p>Seleccioná un sistema para explorar sus signos y sonidos clínicos.</p>

        <div className="botones-sistemas">
          {sistemas.map((sistema) => (
            <button
              key={sistema}
              className={`boton-sistema ${sistemaActivo === sistema ? "activo" : ""}`}
              style={{ borderColor: atlasData[sistema].color }}
              onClick={() => setSistemaActivo(sistema === sistemaActivo ? null : sistema)}
            >
              {atlasData[sistema].nombre}
            </button>
          ))}
        </div>

        {sistemaActivo && (
          <div className="temas">
            <h2>{atlasData[sistemaActivo].nombre}</h2>
            {atlasData[sistemaActivo].temas.map((tema, index) => (
              <div
                key={index}
                className={`tema ${temaActivo === index ? "activo" : ""}`}
                onClick={() => setTemaActivo(temaActivo === index ? null : index)}
              >
                <h3>{tema.titulo}</h3>
                {temaActivo === index && (
                  <div className="contenido-tema">
                    <p><strong>Tipo:</strong> {tema.tipo}</p>
                    {tema.descripcion && <p><strong>Descripción:</strong> {tema.descripcion}</p>}
                    {tema.localizacion && <p><strong>Localización:</strong> {tema.localizacion}</p>}
                    {tema.momento && <p><strong>Fase:</strong> {tema.momento}</p>}
                    {tema.imagen && <img src={tema.imagen} alt={tema.titulo} />}
                    {tema.audio && (
                      <audio controls src={tema.audio}>
                        Tu navegador no soporta audio.
                      </audio>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Atlas;
