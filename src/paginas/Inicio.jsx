import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChartColumn, Check, CircleCheck, FileSpreadsheet, Table, Upload, X } from "lucide-react";
import { chamarApi } from "../lib/api";
import { salvarConversao } from "../servicos/historico";

//limite do plano grátis do supabase storage (50 MB por arquivo)
//validar aqui avisa o usuário na hora, sem esperar o envio falhar lá na frente
const LIMITE_MB = 50;

//os formatos de cada provedor que o back reconhece; viram "chips" em vez de uma frase longa
const FORMATOS_SUPORTADOS = [
  "AWS Cost and Usage Report",
  "GCP Billing Export",
  "Azure Cost Export",
  "Oracle OCI Cost",
];

//resumo da conversão: aparece em um cartão novo depois que o envio dá certo
function ResultadoConversao({ resultado }) {
  const { formato, total_linhas, colunas, amostra, nome_arquivo } = resultado;

  //colunas do csv original que foram reconhecidas (origem -> FOCUS)
  //se o back for uma versão antiga e não mandar isso, o painel simplesmente não aparece
  const identificadas = resultado.colunas_identificadas ?? null;

  //colunas FOCUS que saíram com valor; sem o campo novo do back, estimamos pela amostra
  const preenchidas = new Set(
    resultado.colunas_focus_preenchidas ??
      colunas.filter((coluna) => amostra.some((linha) => linha[coluna] !== null && linha[coluna] !== ""))
  );

  return (
    <div className="cartao-vidro inicio__cartao">
      <div className="inicio__topo">
        <span className="inicio__ok">
          <CircleCheck size={20} />
        </span>
        <div className="inicio__topo-texto">
          <h2>Conversão concluída</h2>
          {nome_arquivo && (
            <span className="dica inicio__nome-resultado" title={nome_arquivo}>
              {nome_arquivo}
            </span>
          )}
        </div>
      </div>

      <div className="inicio__numeros">
        <div className="inicio__numero">
          <span className="inicio__numero-rotulo">Provedor</span>
          <span className="inicio__numero-valor">{formato.toUpperCase()}</span>
        </div>
        <div className="inicio__numero">
          <span className="inicio__numero-rotulo">Linhas</span>
          <span className="inicio__numero-valor">{total_linhas.toLocaleString("pt-BR")}</span>
        </div>
        {identificadas && (
          <div className="inicio__numero">
            <span className="inicio__numero-rotulo">Colunas reconhecidas</span>
            <span className="inicio__numero-valor">{identificadas.length}</span>
          </div>
        )}
        <div className="inicio__numero">
          <span className="inicio__numero-rotulo">Colunas FOCUS</span>
          <span className="inicio__numero-valor">
            {preenchidas.size} <small>de {colunas.length}</small>
          </span>
        </div>
      </div>

      <div className="inicio__paineis">
        {identificadas && (
          <div className="inicio__painel">
            <h3>Colunas do seu CSV</h3>
            {identificadas.length === 0 ? (
              <p className="dica">Nenhuma coluna foi reconhecida.</p>
            ) : (
              <ul className="inicio__lista">
                {identificadas.map((par) => (
                  <li className="inicio__par" key={par.origem}>
                    <span className="inicio__origem" title={par.origem}>
                      {par.origem}
                    </span>
                    <ArrowRight size={13} aria-label="convertida para" />
                    <span className="inicio__focus">{par.focus}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="inicio__painel">
          <h3>Colunas do padrão FOCUS</h3>
          <div className="inicio__colunas">
            {colunas.map((coluna) =>
              preenchidas.has(coluna) ? (
                <span className="inicio__coluna inicio__coluna--ok" key={coluna}>
                  <Check size={12} />
                  {coluna}
                </span>
              ) : (
                <span
                  className="inicio__coluna inicio__coluna--vazia"
                  key={coluna}
                  title="Sem valores neste arquivo"
                >
                  {coluna}
                </span>
              )
            )}
          </div>
          <p className="dica inicio__legenda">As tracejadas não tinham dados neste arquivo.</p>
        </div>
      </div>

      <div className="inicio__acoes">
        <Link to="/dados" className="botao botao--pequeno">
          <Table size={15} />
          Ver dados
        </Link>
        <Link to="/graficos" className="botao botao--pequeno inicio__botao-vidro">
          <ChartColumn size={15} />
          Ver gráficos
        </Link>
      </div>
    </div>
  );
}

function Inicio({ resultado, setResultado }) {
  //arquivo guarda o csv escolhido (ou null se ainda não escolheu nenhum)
  const [arquivo, setArquivo] = useState(null);
  //guarda mensagens de erro
  const [erro, setErro] = useState("");
  //controla o envio para evitar cliques repetidos enquanto a api trabalha
  const [enviando, setEnviando] = useState(false);
  //true enquanto um arquivo está sendo arrastado por cima da área de envio
  const [arrastando, setArrastando] = useState(false);

  //serve tanto para o clique quanto para o arrastar e soltar
  function aceitarArquivo(escolhido) {
    //se o usuário abriu a janela e cancelou, não vem arquivo nenhum
    if (!escolhido) return;

    //verifica a extensão
    if (!escolhido.name.toLowerCase().endsWith(".csv")) {
      setArquivo(null);
      setErro("Envie um arquivo com extensão .csv");
      return;
    }

    const tamanhoMb = escolhido.size / 1024 / 1024;

    if (tamanhoMb > LIMITE_MB) {
      setArquivo(null);
      setErro(`O arquivo tem ${tamanhoMb.toFixed(1)} MB. O limite é ${LIMITE_MB} MB.`);
      return;
    }

    setErro("");
    setResultado(null);
    setArquivo(escolhido);
  }

  function escolherArquivo(evento) {
    aceitarArquivo(evento.target.files[0]);
    //zera o campo: sem isso, escolher o mesmo arquivo de novo (depois de remover) não dispara o onChange
    evento.target.value = "";
  }

  function soltarArquivo(evento) {
    //sem o preventDefault o navegador abriria o csv em vez de entregá-lo para a gente
    evento.preventDefault();
    setArrastando(false);
    aceitarArquivo(evento.dataTransfer.files[0]);
  }

  function removerArquivo() {
    setArquivo(null);
    setErro("");
  }

  async function enviar() {
    //evita envio sem arquivo
    if (!arquivo) return;

    setEnviando(true);
    setErro("");
    setResultado(null);

    //prepara o arquivo para envio
    const dados = new FormData();
    dados.append("arquivo", arquivo);

    try {
      //o chamarApi manda o token do usuário; o back exige login no /converter
      const corpo = await chamarApi("/converter", { method: "POST", body: dados });
      //o nome do arquivo vai junto para o resumo continuar mostrando de onde veio, mesmo ao voltar para esta página
      setResultado({ ...corpo, nome_arquivo: arquivo.name });

      //tenta salvar no histórico; falhar ao salvar não pode estragar a conversão
      try {
        await salvarConversao({
          nome_arquivo: arquivo.name,
          formato: corpo.formato,
          total_linhas: corpo.total_linhas,
        });
      } catch (e) {
        console.error("Não foi possível salvar no histórico:", e);
      }
    } catch (erro) {
      setErro(erro.message || "Não foi possível converter o arquivo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="inicio">
      <h1 className="pagina__titulo">Início</h1>

      <div className="cartao-vidro inicio__cartao">
        <h2>Envie seu arquivo de custos</h2>

        {/*o label inteiro é clicável; o input de verdade fica escondido e o texto não é mais cortado pelo navegador*/}
        <label
          className={arrastando ? "inicio__zona inicio__zona--ativa" : "inicio__zona"}
          onDragOver={(evento) => {
            evento.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={soltarArquivo}
        >
          <input
            type="file"
            accept=".csv"
            className="inicio__input"
            onChange={escolherArquivo}
          />
          <span className="inicio__zona-icone">
            <Upload size={20} />
          </span>
          <span className="inicio__zona-texto">
            <strong>Escolher arquivo</strong> ou arraste o CSV até aqui
          </span>
          <span className="dica">Arquivos .csv de até {LIMITE_MB} MB</span>
        </label>

        {/*exibe o arquivo escolhido*/}
        {arquivo && (
          <div className="inicio__arquivo">
            <FileSpreadsheet size={18} />
            <span className="inicio__arquivo-nome" title={arquivo.name}>
              {arquivo.name}
            </span>
            <span className="inicio__arquivo-tamanho">
              {(arquivo.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              type="button"
              className="inicio__remover"
              onClick={removerArquivo}
              aria-label="Remover arquivo"
              title="Remover arquivo"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/*exibe erros*/}
        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        <div className="inicio__provedores">
          <span className="inicio__rotulo">Suportados</span>
          {FORMATOS_SUPORTADOS.map((formato) => (
            <span className="inicio__chip" key={formato}>
              {formato}
            </span>
          ))}
        </div>

        {/*botão de envio*/}
        <div className="inicio__acoes">
          <button
            className="botao"
            onClick={enviar}
            disabled={!arquivo || enviando}
          >
            {enviando ? "Enviando..." : "Enviar arquivo"}
          </button>
        </div>
      </div>

      {/*exibe o resultado*/}
      {resultado && <ResultadoConversao resultado={resultado} />}
    </section>
  );
}

export default Inicio;
