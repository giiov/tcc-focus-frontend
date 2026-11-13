import { useState } from "react";

//lista das abas, igual ao st.tabs do streamlit (início, dados, visualizações, sobre)
//guardar em uma lista evita repetir o mesmo botão quatro vezes
const ABAS = ["Início", "Dados", "Visualizações", "Sobre"];

function App() {
  //useState guarda qual aba está aberta
  //quando chamamos setAbaAtiva, o react redesenha a tela com o novo valor
  const [abaAtiva, setAbaAtiva] = useState("Início");

  return (
    <div className="pagina">
      <header className="topo">
        <h1>FOCUS Multi-Cloud</h1>
        <p>Padronização de custos cloud para o formato FOCUS</p>
      </header>

      <nav className="abas">
        {/*o map cria um botão para cada item da lista
            o key ajuda o react a saber qual botão é qual quando a lista muda*/}
        {ABAS.map((aba) => (
          <button
            key={aba}
            className={aba === abaAtiva ? "aba aba--ativa" : "aba"}
            onClick={() => setAbaAtiva(aba)}
          >
            {aba}
          </button>
        ))}
      </nav>

      <main>
        {/*só mostra o conteúdo da aba que está ativa (o && significa "se for verdade, mostre")*/}
        {abaAtiva === "Início" && <p>Aqui vai o upload do CSV.</p>}
        {abaAtiva === "Dados" && <p>Aqui vai a tabela FOCUS.</p>}
        {abaAtiva === "Visualizações" && <p>Aqui vão os gráficos.</p>}
        {abaAtiva === "Sobre" && <p>Aqui vai a explicação do projeto.</p>}
      </main>
    </div>
  );
}

export default App;