import "../estilos/SobreDxPro.css";
import { useState } from "react";

export default function SobreDxPro() {
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);

  return (
    <div className="seccion sobredxpro">

      {/* --- SOBRE DXPRO --- */}
      <div className="card">
        <h2>Sobre DxPro</h2>
        <p>
          <b>DxPro</b> es una plataforma educativa desarrollada en la Facultad de Ciencias de la
          Salud (UNCPBA) con el objetivo de fortalecer la enseñanza del razonamiento clínico mediante
          simulaciones interactivas, para favorecer la toma de decisiones diagnósticas y terapéuticas.
        </p>
      </div>

      {/* --- ASPECTOS LEGALES --- */}
      <div className="card aspectos-legales">
        <h3>ASPECTOS LEGALES</h3>
        <p>
          © 2025 <b>DxPro</b> — Todos los derechos reservados. El uso de esta plataforma tiene fines exclusivamente educativos.  
          DxPro no reemplaza el juicio clínico profesional ni constituye una herramienta de diagnóstico médico real.
        </p>

        <p>
          Para conocer más sobre los términos de uso y el tratamiento de tus datos, consulta los{" "}
          <button className="link-btn" onClick={() => setMostrarTerminos(true)}>
            Términos y Condiciones
          </button>{" "}
          y la{" "}
          <button className="link-btn" onClick={() => setMostrarPrivacidad(true)}>
            Política de Privacidad
          </button>{" "}
          de DxPRO.
        </p>
      </div>

      {/* --- EQUIPO DE TRABAJO --- */}
      <div className="card">
        <h3>Equipo de trabajo</h3>
        <div className="equipo-carrusel">
          {/* Cada miembro */}
          <div className="miembro">
            <img src="/equipo/nico.png" alt="Pereyra Diaz, Nicolas" />
            <h4>Pereyra Diaz, Nicolas</h4>
            <p>Director del Proyecto; Asesoría en Simulación y Desarrollo de Casos Clínicos</p>
            <small>
              Médico especialista en Medicina General y Familiar; Docente del Área de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/pablo.png" alt="Luchini, Pablo" />
            <h4>Luchini, Pablo</h4>
            <p>Asesoría en Simulación y Desarrollo de Casos Clínicos</p>
            <small>
              Médico especialista en Medicina General y Familiar y Emergentología; Docente del Área de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/guada.png" alt="Gainza, Guadalupe" />
            <h4>Gainza, Guadalupe</h4>
            <p>Asesoría en Simulación y Desarrollo de Casos Clínicos</p>
            <small>
              Médica especialista en Clínica Médica; Docente del Área de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/santi.png" alt="Pacheco, Santiago" />
            <h4>Pacheco, Santiago</h4>
            <p>Asesoría legal referida a “Términos y Condiciones”, “Política de Privacidad” y "Registro de la marca".</p>
            <small>
              Abogado y Docente. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/pablito.png" alt="Guzman, Pablo" />
            <h4>Guzman, Pablo</h4>
            <p>Asesoría técnica en Simulación</p>
            <small>
              Encargado del área de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/juan.png" alt="Hermada, Juan Francisco" />
            <h4>Hermada, Juan Francisco</h4>
            <p>Idea, desarrollo web y soporte técnico del Proyecto</p>
            <small>
              Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/rodri.png" alt="Rinomo Guzman, Rodrigo" />
            <h4>Rinomo Guzman, Rodrigo</h4>
            <p>Tester de la plataforma; asistente de desarrollo de casos clínicos</p>
            <small>
              Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/joaco.png" alt="Maldonado, Joaquín" />
            <h4>Maldonado, Joaquín</h4>
            <p>Idea y recopilación de información del Atlas Semiologico; asistente de desarrollo de casos clínicos</p>
            <small>
              Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/resti.png" alt="Restivo, Franco Nicolas" />
            <h4>Restivo, Franco Nicolas</h4>
            <p>Tester de la plataforma</p>
            <small>
              Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
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
            <small>
              Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/ivo.png" alt="Hait, Ivo" />
            <h4>Hait, Ivo</h4>
            <p>Asistencia en desarrollo web y soporte técnico.</p>
            <small>
              Estudiante intermedio de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/leo.png" alt="Martinez Binelli, Leonetto Agustín" />
            <h4>Martinez Binelli, Leonetto Agustín</h4>
            <p>Tester de la plataforma</p>
            <small>
              Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>
        </div>
      </div>

      {/* --- CONTACTO --- */}
      <div className="card contenido-sobre">
        <h3>Contacto</h3>
        <p>
          Para consultas, sugerencias o información institucional, escribinos a:{" "}
          <b>dxproes@gmail.com</b>
        </p>
      </div>

      {/* --- MODALES --- */}
      {mostrarTerminos && (
        <div className="modal-overlay" onClick={() => setMostrarTerminos(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Términos y Condiciones</h3>
            <div className="modal-text">
              <p>
                El uso de la plataforma DxPRO implica la aceptación plena y sin reservas de los
                presentes Términos y Condiciones. La plataforma tiene fines exclusivamente
                educativos y no constituye en ningún caso una herramienta de diagnóstico médico.
              </p>
              <p>
                Los contenidos, casos clínicos y materiales incluidos son simulaciones
                destinadas al entrenamiento académico. Cualquier interpretación clínica
                o decisión terapéutica real debe basarse únicamente en la valoración de un
                profesional de la salud habilitado.
              </p>
              <p>
                DxPRO podrá actualizar estos términos cuando lo considere necesario. Las
                modificaciones serán comunicadas oportunamente dentro del sitio.
              </p>
              <p>
                Ante cualquier duda o consulta, podés contactarte al correo institucional:{" "}
                <b>dxproes@gmail.com</b>.
              </p>
            </div>
            <button className="modal-close-btn" onClick={() => setMostrarTerminos(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {mostrarPrivacidad && (
        <div className="modal-overlay" onClick={() => setMostrarPrivacidad(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Política de Privacidad</h3>
            <div className="modal-text">
              <p>
                DxPRO recopila únicamente la información necesaria para el correcto
                funcionamiento de la plataforma, como nombre, correo electrónico y datos
                académicos opcionales. Estos datos se utilizan exclusivamente con fines
                educativos y no se comparten con terceros bajo ninguna circunstancia.
              </p>
              <p>
                La protección de tus datos personales se realiza conforme a la{" "}
                <b>Ley 25.326 de Protección de los Datos Personales</b> de la República
                Argentina. Todos los registros se almacenan en entornos seguros y por el
                tiempo estrictamente necesario para los fines mencionados.
              </p>
              <p>
                El usuario podrá ejercer sus derechos de acceso, rectificación o
                eliminación de datos personales escribiendo a{" "}
                <b>dxproes@gmail.com</b>.
              </p>
              <p>
                DxPRO podrá actualizar esta política en caso de modificaciones legales
                o mejoras en la plataforma, publicando siempre la versión vigente en esta
                sección.
              </p>
            </div>
            <button className="modal-close-btn" onClick={() => setMostrarPrivacidad(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
