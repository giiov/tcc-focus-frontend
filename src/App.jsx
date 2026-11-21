import Perfil from "./paginas/Perfil";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import RotaProtegida from "./componentes/RotaProtegida";
import Assistente from "./paginas/Assistente";
import Dados from "./paginas/Dados";
import Graficos from "./paginas/Graficos";
import Historico from "./paginas/Historico";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import Sobre from "./paginas/Sobre";

//o App agora só decide qual página aparece em cada endereço
function App() {
  //o resultado da conversão mora aqui, no pai, para que Inicio e Graficos enxerguem o mesmo dado
  //o App nunca sai da tela quando o usuário troca de página, então o dado não se perde
  const [resultado, setResultado] = useState(null);

  return (
    <Routes>
      {/*o login fica fora da RotaProtegida e do Layout porque não tem sidebar*/}
      <Route path="/login" element={<Login />} />

      {/*tudo que está aqui dentro só abre para quem está logado*/}
      <Route element={<RotaProtegida />}>
        {/*as rotas de dentro aparecem no lugar do Outlet do Layout, então todas ganham a sidebar*/}
        <Route element={<Layout />}>
          {/*o Inicio recebe os dois porque é ele que escreve o resultado depois do upload*/}
          <Route path="/" element={<Inicio resultado={resultado} setResultado={setResultado} />} />
          <Route path="/dados" element={<Dados resultado={resultado} />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/perfil" element={<Perfil />} />
          {/*o Graficos só lê o resultado, por isso não recebe o setResultado*/}
          <Route path="/graficos" element={<Graficos resultado={resultado} />} />
          <Route path="/assistente" element={<Assistente />} />
          <Route path="/sobre" element={<Sobre />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
