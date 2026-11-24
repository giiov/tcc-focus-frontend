import { useEffect, useState } from "react";
import { chamarApi } from "../lib/api";

//quantas conversões vêm por vez; o botão "Carregar mais" busca a próxima leva
const TAMANHO_PAGINA = 20;

//o back devolve o tamanho em bytes; aqui vira KB ou MB para a pessoa ler
function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

//o banco guarda a data em UTC; o toLocaleString converte para o fuso do navegador
function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function Historico() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    //"ativo" evita atualizar o estado se a pessoa sair da página antes da resposta chegar
    let ativo = true;

    chamarApi(`/conversoes?limite=${TAMANHO_PAGINA}&inicio=0`)
      .then((pagina) => {
        if (!ativo) return;
        setItens(pagina);
        //se veio uma página cheia, provavelmente ainda há mais registros
        setTemMais(pagina.length === TAMANHO_PAGINA);
      })
      .catch((falha) => {
        if (ativo) setErro(falha.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function carregarMais() {
    setCarregandoMais(true);
    setErro("");

    try {
      //o "inicio" é quantos já temos na tela
      const pagina = await chamarApi(
        `/conversoes?limite=${TAMANHO_PAGINA}&inicio=${itens.length}`
      );
      setItens((atuais) => [...atuais, ...pagina]);
      setTemMais(pagina.length === TAMANHO_PAGINA);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregandoMais(false);
    }
  }

  async function apagar(item) {
    if (!window.confirm(`Apagar "${item.nome_arquivo}" do histórico?`)) return;

    setErro("");

    try {
      await chamarApi(`/conversoes/${item.id}`, { method: "DELETE" });
      setItens((atuais) => atuais.filter((outro) => outro.id !== item.id));
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function limparTudo() {
    if (!window.confirm("Apagar todo o histórico de conversões?")) return;

    setErro("");

    try {
      await chamarApi("/conversoes", { method: "DELETE" });
      setItens([]);
      setTemMais(false);
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <section className="historico">
      <div className="historico__topo">
        <h1 className="pagina__titulo">Histórico</h1>

        {itens.length > 0 && (
          <button type="button" className="historico__apagar" onClick={limparTudo}>
            Limpar histórico
          </button>
        )}
      </div>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      {carregando && <p className="dica">Carregando...</p>}

      {!carregando && !erro && itens.length === 0 && (
        <p className="dica">
          Nenhuma conversão ainda. Envie um CSV na página Início e ela aparece aqui.
        </p>
      )}

      {itens.length > 0 && (
        <ul className="historico__lista">
          {itens.map((item) => (
            <li key={item.id} className="cartao-vidro historico__item">
              <div>
                <div className="historico__nome">{item.nome_arquivo}</div>

                <ul className="historico__meta">
                  <li className="historico__formato">{item.formato.toUpperCase()}</li>
                  <li>{item.total_linhas.toLocaleString("pt-BR")} linhas</li>
                  <li>{formatarTamanho(item.tamanho_bytes)}</li>
                  <li>{formatarData(item.criado_em)}</li>
                </ul>
              </div>

              <button type="button" className="historico__apagar" onClick={() => apagar(item)}>
                Apagar
              </button>
            </li>
          ))}
        </ul>
      )}

      {temMais && (
        <button type="button" className="botao" onClick={carregarMais} disabled={carregandoMais}>
          {carregandoMais ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </section>
  );
}

export default Historico;