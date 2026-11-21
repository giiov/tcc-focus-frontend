import { useState } from "react";

import { chamarApi } from "../lib/api";

const LIMITE_MB = 50;

function Inicio() {
  // guarda o arquivo selecionado
  const [arquivo, setArquivo] = useState(null);
  // guarda mensagens de erro
  const [erro, setErro] = useState("");
  // controla o envio
  const [enviando, setEnviando] = useState(false);
  // guarda o resultado da conversão
  const [resultado, setResultado] = useState(null);

  function escolherArquivo(evento) {
    const escolhido = evento.target.files[0];

    if (!escolhido) return;

    // verifica a extensão
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

  async function enviar() {
    // evita envio sem arquivo
    if (!arquivo) return;

    setEnviando(true);
    setErro("");
    setResultado(null);

    // prepara o arquivo para envio
    const dados = new FormData();
    dados.append("arquivo", arquivo);

    try {
      //o chamarApi manda o token do usuário; o back exige login no /converter
      const corpo = await chamarApi("/converter", { method: "POST", body: dados });
      setResultado(corpo);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="inicio">
      <h1 className="pagina__titulo">Início</h1>

      <div className="cartao-vidro inicio__cartao">
        <h2>Envie seu arquivo de custos (.csv)</h2>

        <div className="inicio__upload">
          <input
            type="file"
            accept=".csv"
            onChange={escolherArquivo}
          />
        </div>

        <p className="dica">
          Suportados: AWS Cost and Usage Report, GCP Billing Export,
          Azure Cost Export e Oracle OCI Cost
        </p>

        {/* exibe erros */}
        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        {/* exibe o arquivo escolhido */}
        {arquivo && (
          <p>
            Arquivo escolhido: <strong>{arquivo.name}</strong>{" "}
            ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {/* botão de envio */}
        <div>
          <button
            className="botao"
            onClick={enviar}
            disabled={!arquivo || enviando}
          >
            {enviando ? "Enviando..." : "Enviar arquivo"}
          </button>
        </div>

        {/* exibe o resultado */}
        {resultado && (
          <p>
            Convertido com sucesso: formato{" "}
            <strong>{resultado.formato.toUpperCase()}</strong>,{" "}
            <strong>{resultado.total_linhas}</strong> linhas.
          </p>
        )}
      </div>
    </section>
  );
}

export default Inicio;
