import { Link } from "react-router-dom";

//transforma o valor de uma célula em texto legível
//a api manda null para campos vazios e objetos para campos como Tags; nenhum dos dois pode ir direto para a tela
function formatarCelula(valor) {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor);
}

function Dados({ resultado }) {
  //sem arquivo enviado, resultado é null; o aviso vem antes para não quebrar o código de baixo
  if (!resultado) {
    return (
      <section>
        <h1 className="pagina__titulo">Dados</h1>
        <div className="cartao-vidro">
          <p className="dica">
            Nenhum arquivo convertido ainda. <Link to="/">Envie um CSV na aba Início</Link>.
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
        {/*o backend manda só as primeiras linhas (LINHAS_AMOSTRA), então avisamos para não parecer que o arquivo acabou ali*/}
        <p className="dica">
          Formato <strong>{formato.toUpperCase()}</strong> · mostrando {amostra.length} de {total_linhas} linhas
        </p>

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