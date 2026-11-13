import { Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Placeholder from "./paginas/Placeholder";
import Sobre from "./paginas/Sobre";

//o App agora só decide qual página aparece em cada endereço
function App() {
  return (
    <Routes>
      {/*o login fica fora do Layout porque não tem sidebar*/}
      <Route path="/login" element={<Login />} />

      {/*as rotas de dentro aparecem no lugar do Outlet do Layout, então todas ganham a sidebar*/}
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/dados" element={<Placeholder titulo="Dados" descricao="Aqui vai a tabela FOCUS." />} />
        <Route path="/graficos" element={<Placeholder titulo="Gráficos" descricao="Aqui vão os gráficos." />} />
        <Route path="/historico" element={<Placeholder titulo="Histórico" descricao="Aqui vão as conversões anteriores." />} />
        <Route path="/assistente" element={<Placeholder titulo="Assistente" descricao="Aqui vai o chat com a IA." />} />
        <Route path="/sobre" element={<Sobre />} />
      </Route>
    </Routes>
  );
}

export default App;