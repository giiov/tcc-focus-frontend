import { useState } from "react";

//limite do plano grátis do supabase storage (50 MB por arquivo)
//validar aqui avisa o usuário na hora, sem esperar o envio falhar lá na frente
const LIMITE_MB = 50;

//endereço da api, vem do arquivo .env (VITE_API_URL); no deploy é só trocar o valor lá
//no vite, só variáveis que começam com VITE_ chegam ao código do navegador
const API_URL = import.meta.env.VITE_API_URL;

function Inicio() {
  //arquivo guarda o csv escolhido (ou null se ainda não escolheu nenhum)
  const [arquivo, setArquivo] = useState(null);
  //erro guarda a mensagem para o usuário (ou "" quando está tudo certo)
  const [erro, setErro] = useState("");
  //enviando evita cliques repetidos enquanto a api trabalha
  const [enviando, setEnviando] = useState(false);
  //resultado guarda a resposta da api (formato, total de linhas, amostra...) ou null
  const [resultado, setResultado] = useState(null);

  function escolherArquivo(evento) {
    //files é uma lista; pegamos só o primeiro porque o input aceita um arquivo por vez
    const escolhido = evento.target.files[0];

    //se o usuário abriu a janela e cancelou, não vem arquivo nenhum
    if (!escolhido) return;

    //o accept do input só sugere o tipo, o usuário ainda consegue escolher outro, então conferimos de novo
    if (!escolhido.name.toLowerCase().endsWith(".csv")) {
      setArquivo(null);
      setErro("Envie um arquivo com extensão .csv");
      return;
    }

    //size vem em bytes: dividimos por 1024 duas vezes para chegar em MB
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

  //async porque falar com a api leva tempo; o await espera a resposta chegar sem travar a tela
  async function enviar() {
    setEnviando(true);
    setErro("");
    setResultado(null);

    //o FormData monta o envio de arquivo no formato que o FastAPI espera
    //o nome "arquivo" precisa ser igual ao parâmetro da rota no main.py
    const dados = new FormData();
    dados.append("arquivo", arquivo);

    try {
      //não colocamos Content-Type: o navegador define sozinho, e precisa dele para o arquivo ir certo
      const resposta = await fetch(`${API_URL}/converter`, { method: "POST", body: dados });

      //se a api devolver algo que não é json (ex.: erro 500), o catch evita quebrar a tela
      const corpo = await resposta.json().catch(() => ({}));

      //ok é false para status 400, 413, 422, 500...; nesses casos a api manda a mensagem em "detail"
      if (!resposta.ok) {
        setErro(typeof corpo.detail === "string" ? corpo.detail : "Não foi possível converter o arquivo.");
        return;
      }

      setResultado(corpo);
    } catch {
      //cai aqui quando nem chegou na api: servidor desligado, endereço errado ou CORS
      setErro("Não consegui falar com o servidor. Confira se a API está rodando.");
    } finally {
      //o finally roda sempre, deu certo ou errado, para o botão voltar ao normal
      setEnviando(false);
    }
  }

  return (
    <section>
      <h1 className="pagina__titulo">Início</h1>
      <h2>Envie seu arquivo de custos (.csv)</h2>

      <input type="file" accept=".csv" onChange={escolherArquivo} />

      <p className="dica">
        Suportados: AWS Cost and Usage Report, GCP Billing Export, Azure Cost Export e Oracle OCI Cost
      </p>

      {/*role="alert" faz o leitor de tela avisar o erro assim que ele aparece*/}
      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      {arquivo && (
        <p>
          Arquivo escolhido: <strong>{arquivo.name}</strong> ({(arquivo.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}

      {/*disabled impede o clique enquanto não houver arquivo válido ou enquanto o envio está em andamento*/}
      <button className="botao" onClick={enviar} disabled={!arquivo || enviando}>
        {enviando ? "Enviando..." : "Enviar"}
      </button>

      {resultado && (
        <p>
          Convertido com sucesso: formato <strong>{resultado.formato.toUpperCase()}</strong>,{" "}
          <strong>{resultado.total_linhas}</strong> linhas.
        </p>
      )}
    </section>
  );
}

export default Inicio;