import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import Assistente from "./paginas/Assistente";
import Graficos from "./paginas/Graficos";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Placeholder from "./paginas/Placeholder";
import Sobre from "./paginas/Sobre";

//o App agora só decide qual página aparece em cada endereço
function App() {
  //o resultado da conversão mora aqui, no pai, para que Inicio e Graficos enxerguem o mesmo dado
  //o App nunca sai da tela quando o usuário troca de página, então o dado não se perde
  const [resultado, setResultado] = useState(null);

  return (
    <Routes>
      {/*o login fica fora do Layout porque não tem sidebar*/}
      <Route path="/login" element={<Login />} />

      {/*as rotas de dentro aparecem no lugar do Outlet do Layout, então todas ganham a sidebar*/}
      <Route element={<Layout />}>
        {/*o Inicio recebe os dois porque é ele que escreve o resultado depois do upload*/}
        <Route path="/" element={<Inicio resultado={resultado} setResultado={setResultado} />} />
        <Route path="/dados" element={<Placeholder titulo="Dados" descricao="Aqui vai a tabela FOCUS." />} />
        {/*o Graficos só lê o resultado, por isso não recebe o setResultado*/}
        <Route path="/graficos" element={<Graficos resultado={resultado} />} />
        <Route path="/historico" element={<Placeholder titulo="Histórico" descricao="Aqui vão as conversões anteriores." />} />
        <Route path="/assistente" element={<Assistente />} />
        <Route path="/sobre" element={<Sobre />} />
      </Route>
    </Routes>
  );
}

export default App;