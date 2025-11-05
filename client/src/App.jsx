import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [caso, setCaso] = useState(null);
  const [atlas, setAtlas] = useState([]);

  useEffect(() => {
    const qs = "?system=cardiovascular";
    fetch(`/api/caso${qs}`).then(r=>r.json()).then(setCaso).catch(console.error);
    fetch(`/api/atlas?system=cardiovascular`).then(r=>r.json()).then(setAtlas).catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1>DxPro (limpio)</h1>

      <section>
        <h2>Caso Clínico</h2>
        {!caso ? <p>Cargando…</p> : (
          <>
            <pre>{JSON.stringify(caso.presentacion, null, 2)}</pre>
            <small>{caso.casoId}</small>
          </>
        )}
      </section>

      <section>
        <h2>Atlas (Cardiovascular)</h2>
        {atlas.length === 0 ? <p>Sin datos</p> : atlas.map((x,i)=>(
          <div key={i} className="card">
            <h3>{x.titulo}</h3>
            <p>{x.descripcion}</p>
            {x.audio && <audio controls src={`/${x.audio}`} />}
          </div>
        ))}
      </section>

      <section>
        <h2>Auth (test rápido)</h2>
        <button onClick={async()=>{
          const res = await fetch(`/auth/login`, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify({ email:"test@test.com", password:"1234" })
          });
          const j = await res.json(); console.log(j);
          alert(res.ok ? "Login OK (ver consola)" : j.error || "Error");
        }}>Probar login</button>
      </section>
    </div>
  );
}
