import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [caso, setCaso] = useState(null);
  const [atlas, setAtlas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👉 URL de tu backend en Render
  const BACKEND_URL = "https://dxproes-backend.onrender.com";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const qs = "?system=cardiovascular";

        // Cargar caso clínico
        const casoRes = await fetch(`${BACKEND_URL}/api/caso${qs}`);
        const casoData = await casoRes.json();
        setCaso(casoData);

        // Cargar atlas semiológico
        const atlasRes = await fetch(`${BACKEND_URL}/api/atlas?system=cardiovascular`);
        const atlasData = await atlasRes.json();
        setAtlas(atlasData);

      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="container">
      <h1>DxPro</h1>

      {/* CASO CLÍNICO */}
      <section>
        <h2>Caso Clínico</h2>
        {!caso ? (
          <p>No se pudo cargar el caso.</p>
        ) : (
          <>
            <pre>{JSON.stringify(caso.presentacion, null, 2)}</pre>
            <small>{caso.casoId}</small>
          </>
        )}
      </section>

      {/* ATLAS */}
      <section>
        <h2>Atlas (Cardiovascular)</h2>
        {atlas.length === 0 ? (
          <p>No se encontraron registros.</p>
        ) : (
          atlas.map((x, i) => (
            <div key={i} className="card">
              <h3>{x.titulo}</h3>
              <p>{x.descripcion}</p>
              {x.audio && (
                <audio controls src={`${BACKEND_URL}/atlas_semiologico/${x.audio}`} />
              )}
            </div>
          ))
        )}
      </section>

      {/* TEST DE LOGIN */}
      <section>
        <h2>Auth (test rápido)</h2>
        <button
          onClick={async () => {
            try {
              const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@test.com", password: "1234" }),
              });
              const j = await res.json();
              console.log(j);
              alert(res.ok ? "Login OK (ver consola)" : j.error || "Error");
            } catch (err) {
              alert("Error al conectar con el servidor");
              console.error(err);
            }
          }}
        >
          Probar login
        </button>
      </section>
    </div>
  );
}
