import logoNuvem from "../assets/logo-nuvem.png";

//o texto da página fica em listas aqui em cima: para mudar um provedor ou uma tecnologia, é só editar a lista
const PROVEDORES = ["AWS", "Microsoft Azure", "Google Cloud", "Oracle Cloud"];

const TECNOLOGIAS = ["Python", "FastAPI", "Pandas", "React", "Vite"];

//cada passo pode ter uma parte em destaque (negrito), por isso é um par [texto, destaque]
const PASSOS = [
  ["Acesse a aba ", "Início"],
  ["Envie um arquivo CSV de custos cloud", ""],
  ["O sistema detecta o provedor automaticamente", ""],
  ["Explore os dados na aba ", "Dados"],
  ["Visualize os gráficos em ", "Gráficos"],
];

//troque pelos dados reais de vocês; se alguém não tiver um dos links, deixe a string vazia que o botão some
const CRIADORES = [
  {
    nome: "Antonella Prucoli",
    funcao: "-",
    linkedin: "https://www.linkedin.com/in/usuario-um",
    github: "https://github.com/usuario-um",
  },
  {
    nome: "Bruno Holanda",
    funcao: "-",
    linkedin: "https://www.linkedin.com/in/usuario-dois",
    github: "https://github.com/usuario-dois",
  },
  {
    nome: "Giovana Hermelinda",
    funcao: "-",
    linkedin: "https://www.linkedin.com/in/usuario-tres",
    github: "https://github.com/usuario-tres",
  },
];

//página só de leitura: não depende de api nem de estado, é só layout
function Sobre() {
  return (
    <section>
      <header className="sobre__cabecalho">
        {/*a imagem é decoração, o título ao lado já diz o nome, então o alt fica vazio*/}
        <img src={logoNuvem} alt="" className="sobre__nuvem" />
        <div>
          <h1 className="sobre__titulo">
            <span className="logo__focus">FOCUS</span> Multi-Cloud
          </h1>
          <p className="sobre__subtitulo">Ferramenta de TCC para padronização de custos cloud</p>
        </div>
      </header>

      <div className="sobre__grade">
        <div className="sobre__coluna">
          <article className="cartao-vidro">
            <h2>O que é o FOCUS Multi-Cloud?</h2>
            <p>
              O FOCUS Multi-Cloud é uma ferramenta desenvolvida como Trabalho de Conclusão de Curso (TCC) que
              recebe arquivos de custos de diferentes provedores de nuvem, identifica automaticamente o formato
              de origem e converte os dados para o padrão FOCUS — permitindo comparar e analisar gastos
              multi-cloud em uma estrutura única e consistente.
            </p>
          </article>

          <article className="cartao-vidro">
            <h2>O padrão FOCUS</h2>
            <p>
              <strong>FOCUS</strong> (FinOps Open Cost and Usage Specification) é um padrão aberto mantido pela
              FinOps Foundation que define um esquema comum para dados de custo e uso de serviços cloud. O
              objetivo é eliminar as diferenças de nomenclatura e estrutura entre provedores, permitindo que
              times de FinOps analisem custos multi-cloud de forma direta e comparável.
            </p>
          </article>

          <article className="cartao-vidro">
            <h2>Objetivo do projeto</h2>
            <p>
              Demonstrar como a adoção do padrão FOCUS pode simplificar a análise de custos em ambientes
              multi-cloud, reduzindo o esforço manual de normalização de dados e possibilitando uma visão
              unificada dos gastos independentemente do provedor utilizado.
            </p>
          </article>
        </div>

        <div className="sobre__coluna">
          <article className="cartao-vidro">
            <h2>Provedores suportados</h2>
            <ul className="sobre__chips">
              {PROVEDORES.map((nome) => (
                <li key={nome} className="sobre__chip">
                  {nome}
                </li>
              ))}
            </ul>
          </article>

          <article className="cartao-vidro">
            <h2>Tecnologias utilizadas</h2>
            <ul className="sobre__chips">
              {TECNOLOGIAS.map((nome) => (
                <li key={nome} className="sobre__chip">
                  {nome}
                </li>
              ))}
            </ul>
          </article>

          <article className="cartao-vidro">
            <h2>Como usar</h2>
            <ol className="sobre__passos">
              {PASSOS.map(([texto, destaque]) => (
                <li key={texto + destaque}>
                  {texto}
                  {destaque && <strong>{destaque}</strong>}
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>

      {/*fica fora da grade de duas colunas para ocupar a largura toda, como um rodapé da página*/}
      <article className="cartao-vidro sobre__criadores">
        <h2>Equipe</h2>
        <ul className="criadores__lista">
          {CRIADORES.map((pessoa) => (
            <li key={pessoa.nome} className="criador">
              {/*o avatar é só a inicial do nome; é decoração, então fica escondido de leitores de tela*/}
              <div className="criador__avatar" aria-hidden="true">
                {pessoa.nome.charAt(0)}
              </div>
              <div className="criador__info">
                <strong className="criador__nome">{pessoa.nome}</strong>
                <span className="criador__funcao">{pessoa.funcao}</span>
              </div>
              <div className="criador__links">
                {pessoa.linkedin && (
                  <a
                    href={pessoa.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sobre__chip criador__link"
                    aria-label={`LinkedIn de ${pessoa.nome}`}
                  >
                    LinkedIn
                  </a>
                )}
                {pessoa.github && (
                  <a
                    href={pessoa.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sobre__chip criador__link"
                    aria-label={`GitHub de ${pessoa.nome}`}
                  >
                    GitHub
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export default Sobre;