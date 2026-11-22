import adaPadrao from "../assets/ada/ada-padrao.png";
import adaPadraoMini from "../assets/ada/ada-padrao-mini.png";
import adaPensando from "../assets/ada/ada-pensando.png";
import adaPensandoMini from "../assets/ada/ada-pensando-mini.png";

// cada versão tem duas imagens: "cheia" (cubo + órbita) e "mini" (só o cubo, para tamanhos pequenos)
const IMAGENS = {
  padrao: { cheia: adaPadrao, mini: adaPadraoMini },
  pensando: { cheia: adaPensando, mini: adaPensandoMini },
};

// pré-carrega o "pensando": sem isso o navegador só baixa a imagem na hora da troca e o mascote pisca
new Image().src = adaPensando;
new Image().src = adaPensandoMini;

// pensando = true → versão "carregando"; false → versão padrão
// tamanho: "avatar" | "cabecalho" | "grande"
function AdaMascote({ pensando = false, tamanho = "avatar" }) {
  const versao = pensando ? "pensando" : "padrao";

  // só o avatar usa a imagem mini; os outros tamanhos (cabecalho e grande) usam a cheia
  const src = tamanho === "avatar" ? IMAGENS[versao].mini : IMAGENS[versao].cheia;

  return (
    <img
      src={src}
      // decorativo: o nome "Ada" já está escrito na tela, então o alt fica vazio
      alt=""
      aria-hidden="true"
      className={`ada-mascote ada-mascote--${tamanho}${pensando ? " ada-mascote--pensando" : ""}`}
    />
  );
}

export default AdaMascote;