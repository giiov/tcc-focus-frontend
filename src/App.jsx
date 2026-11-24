import { Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import Assistente from "./paginas/Assistente";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Placeholder from "./paginas/Placeholder";
import Sobre from "./paginas/Sobre";
import RotaProtegida from "./componentes/RotaProtegida";
import Historico from "./paginas/Historico";

//o App agora só decide qual página aparece em cada endereço
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/*tudo que está aqui dentro só abre para quem está logado*/}
      <Route element={<RotaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/dados" element={<Placeholder titulo="Dados" descricao="Aqui vai a tabela FOCUS." />} />
          <Route path="/graficos" element={<Placeholder titulo="Gráficos" descricao="Aqui vão os gráficos." />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/sobre" element={<Sobre />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;