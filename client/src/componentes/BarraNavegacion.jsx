import "../estilos/BarraNavegacion.css";
export default function BarraNavegacion({ seccion, setSeccion, usuario, setUsuario }) {
  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setSeccion("inicio");
  };

  return (
    <nav className="navbar">
      <div className="navbar-izquierda">
        <img src="/otros/DxPro.png" alt="DxPro Logo" className="logo-nav" />
      </div>

      <div className="navbar-centro">
        <button onClick={() => setSeccion("inicio")}>Inicio</button>
        <button onClick={() => setSeccion("tutorial")}>Tutorial</button>
        <button onClick={() => setSeccion("casos-basicos")}>Básico</button>
        <button onClick={() => setSeccion("casos-avanzados")}>Avanzado</button>
        <button onClick={() => setSeccion("atlas")}>Atlas</button>
        <button onClick={() => setSeccion("sobre-dxpro")}>Sobre DxPro</button>
      </div>

      <div className="navbar-derecha">
        {usuario ? (
          <>
            <span className="usuario-info">👤 {usuario.fullName?.split(" ")[0]}</span>
            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        ) : (
          <button onClick={() => setSeccion("login")}>Ingresar</button>
        )}
      </div>
    </nav>
  );
}
