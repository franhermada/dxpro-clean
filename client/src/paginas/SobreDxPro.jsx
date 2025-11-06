import "../estilos/SobreDxPro.css";

export default function SobreDxPro() {
  return (
    <div className="seccion sobredxpro">
      <div className="card">
        <h2>Sobre DxPro</h2>
        <p>
          <b>DxPro</b> es una plataforma educativa desarrollada en la Facultad de Ciencias de la
          Salud (UNCPBA) con el objetivo de fortalecer la enseñanza del razonamiento clínico mediante
          simulaciones interactivas, para favorecer la toma de decisiones diagnósticas y terapéuticas.
        </p>

        <h3>Aspectos legales</h3>
        <p>
          © 2025 DxPro — Todos los derechos reservados. El uso de esta plataforma tiene fines
          exclusivamente educativos. DxPro no reemplaza el juicio clínico profesional ni constituye
          una herramienta de diagnóstico médico real.
        </p>

        <h3>Equipo de trabajo</h3>

        {/* Carrusel centrado dentro del card */}
        <div className="equipo-carrusel">
          <div className="miembro">
            <img src="/equipo/juan.png" alt="Hermada, Juan Francisco" />
            <h4>Hermada, Juan Francisco</h4>
            <p>Idea, desarrollo web y soporte técnico del Proyecto</p>
            <small>
              Estudiante avanzado de Medicina. — Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/nico.png" alt="Pereyra Diaz, Nicolas" />
            <h4>Pereyra Diaz, Nicolas</h4>
            <p>Director del Proyecto; Asesoría en Simulación y Desarrollo de Casos Clínicos</p>
            <small>
              Médico especialista en Medicina General y Familiar; Docente del Área de Simulación. —
              Facultad de Ciencias de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/pablo.png" alt="Luchini, Pablo" />
            <h4>Luchini, Pablo</h4>
            <p>Asesoría en Simulación y Desarrollo de Casos Clínicos</p>
            <small>
              Médico especialista en Medicina General y Familiar y Emergentología; Docente del Área
              de Simulación. — Facultad de Ciencias de la Salud (UNCPBA)
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
            <img src="/equipo/rodri.png" alt="Rinomo Guzman, Rodrigo" />
            <h4>Rinomo Guzman, Rodrigo</h4>
            <p>Alfa tester de la plataforma, asistente de desarrollo de casos clínicos</p>
            <small>
              Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias
              de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/joaco.png" alt="Maldonado, Joaquín" />
            <h4>Maldonado, Joaquín</h4>
            <p>
              Asistencia en desarrollo web y soporte técnico; diseño visual y comunicación
            </p>
            <small>
              Estudiante avanzado de Medicina, ayudante alumno en simulación. — Facultad de Ciencias
              de la Salud (UNCPBA)
            </small>
          </div>

          <div className="miembro">
            <img src="/equipo/resti.png" alt="Restivo, Franco Nicolas" />
            <h4>Restivo, Franco Nicolas</h4>
            <p>Alfa tester de la plataforma</p>
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
            <p>Alfa tester de la plataforma</p>
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
    </div>
  );
}
