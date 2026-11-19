import { useEffect, useState } from "react";
import { listarConversoes } from "../servicos/historico";

//formata a data ISO no padrão brasileiro: "17/11/2026 14:32"
function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Historico() {
  //itens: a lista de conversões; carregando e erro dão feedback enquanto a busca acontece
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  //o useEffect com [] roda uma vez, quando a página abre; é o lugar certo para buscar dados
  useEffect(() => {
    listarConversoes()
      .then(setItens)
      .catch(() => setErro("Não foi possível carregar o histórico."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section>
      <h1 className="pagina__titulo">Histórico</h1>

      <div className="cartao-vidro">
        {carregando && <p className="dica">Carregando...</p>}

        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        {/*estado vazio: usuário novo ou banco ainda não ligado*/}
        {!carregando && !erro && itens.length === 0 && (
          <p className="dica">Nenhuma conversão ainda. Envie um arquivo na aba Início.</p>
        )}

        {itens.length > 0 && (
          <ul className="historico__lista">
            {itens.map((item) => (
              <li key={item.id} className="historico__item">
                <div>
                  <strong>{item.nome_arquivo}</strong>
                  <span className="historico__data">{formatarData(item.criado_em)}</span>
                </div>
                <div className="historico__detalhes">
                  <span className="historico__selo">{item.formato.toUpperCase()}</span>
                  <span>{item.total_linhas.toLocaleString("pt-BR")} linhas</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Historico;