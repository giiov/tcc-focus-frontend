import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import RotaProtegida from "./componentes/RotaProtegida";
import Assistente from "./paginas/Assistente";
import Dados from "./paginas/Dados";
import Graficos from "./paginas/Graficos";
import Historico from "./paginas/Historico";
import Inicio from "./paginas/Inicio";
import LandingPage from "./paginas/LandingPage";
import Login from "./paginas/Login";
import Perfil from "./paginas/Perfil";
import Sobre from "./paginas/Sobre";

function App() {
  const [resultado, setResultado] = useState(null);

  return (
    <Routes>
      {/* A landing continua pública e é sempre a página inicial do site. */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      {/* As páginas de trabalho continuam protegidas e compartilham o layout. */}
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route
            path="/app"
            element={<Inicio resultado={resultado} setResultado={setResultado} />}
          />
          <Route path="/dados" element={<Dados resultado={resultado} />} />
          <Route path="/graficos" element={<Graficos resultado={resultado} />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/sobre" element={<Sobre />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
