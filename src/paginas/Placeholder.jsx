//página provisória: serve para o menu já funcionar enquanto as páginas reais não existem
//ela recebe o título e a descrição de fora (props), então uma função só atende todas as páginas vazias
function Placeholder({ titulo, descricao }) {
  return (
    <section>
      <h1 className="pagina__titulo">{titulo}</h1>
      <p className="dica">{descricao}</p>
    </section>
  );
}

export default Placeholder;