import { Link } from "react-router-dom";
import { Download } from "lucide-react";

//transforma o valor de uma célula em texto legível
//a api manda null para campos vazios e objetos para campos como Tags; nenhum dos dois pode ir direto para a tela
function formatarCelula(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

//prepara um valor para o csv: vazio fica vazio (e não "-"), e texto com vírgula, aspas ou quebra de linha vai entre aspas
function escaparCsv(valor) {
  if (valor === null || valor === undefined) return "";
  const texto = typeof valor === "object" ? JSON.stringify(valor) : String(valor);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

//monta o csv na memória e manda o navegador baixar como arquivo
function baixarCsv(colunas, linhas, formato) {
  const cabecalho = colunas.map(escaparCsv).join(",");
  const corpo = linhas.map((linha) => colunas.map((coluna) => escaparCsv(linha[coluna])).join(","));

  //o \uFEFF no começo avisa o Excel que o arquivo é UTF-8; sem ele os acentos saem quebrados
  const texto = "\uFEFF" + [cabecalho, ...corpo].join("\r\n");
  const blob = new Blob([texto], { type: "text/csv;charset=utf-8;" });

  //cria um link invisível apontando para o blob, clica nele e depois libera a memória
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `focus_${formato}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Dados({ resultado }) {
  //sem arquivo enviado, resultado é null; o aviso vem antes para não quebrar o código de baixo
  if (!resultado) {
    return (
      <section>
        <h1 className="pagina__titulo">Dados</h1>
        <div className="cartao-vidro">
          <p className="dica">
            Nenhum arquivo convertido ainda. <Link to="/app">Envie um CSV na aba Início</Link>.
          </p>
        </div>
      </section>
    );
  }

  const { colunas, amostra, total_linhas, formato } = resultado;

  return (
    <section>
      <h1 className="pagina__titulo">Dados</h1>

      <div className="cartao-vidro">
        <div className="dados__topo">
          {/*o backend manda só as primeiras linhas (LINHAS_AMOSTRA), então avisamos para não parecer que o arquivo acabou ali*/}
          <p className="dica">
            Formato <strong>{formato.toUpperCase()}</strong> · mostrando {amostra.length} de {total_linhas} linhas
          </p>

          <button className="botao botao--pequeno" onClick={() => baixarCsv(colunas, amostra, formato)}>
            <Download size={15} />
            Baixar CSV
          </button>
        </div>

        {/*a rolagem fica nesta div, e não na página inteira: a tabela tem 26 colunas e não cabe na tela*/}
        <div className="tabela__rolagem">
          <table className="tabela">
            <thead>
              <tr>
                {colunas.map((coluna) => (
                  <th key={coluna}>{coluna}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {amostra.map((linha, i) => (
                <tr key={i}>
                  {/*percorremos "colunas" (e não as chaves da linha) para a ordem ficar igual à do cabeçalho*/}
                  {colunas.map((coluna) => (
                    <td key={coluna}>{formatarCelula(linha[coluna])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Dados;
