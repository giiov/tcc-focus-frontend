import logoNuvem from "../assets/logo-nuvem.png";

//o texto da página fica em listas aqui em cima: para mudar um provedor ou uma tecnologia, é só editar a lista
const PROVEDORES = ["AWS", "Microsoft Azure", "Google Cloud", "Oracle Cloud"];

const TECNOLOGIAS = ["Python", "FastAPI", "Pandas", "React", "Vite"];

//cada passo do guia de uso estruturado com numero, titulo e descricao
const PASSOS = [
  {
    passo: "1",
    titulo: "Acessar Início",
    descricao: "Navegue até a aba Início através do menu de navegação lateral.",
  },
  {
    passo: "2",
    titulo: "Enviar CSV",
    descricao: "Envie um arquivo CSV de faturamento de qualquer nuvem suportada.",
  },
  {
    passo: "3",
    titulo: "Detecção Automática",
    descricao: "O sistema detecta AWS, Azure, GCP ou Oracle e converte para FOCUS.",
  },
  {
    passo: "4",
    titulo: "Explorar Dados",
    descricao: "Analise a tabela com dados normalizados e aplique filtros na aba Dados.",
  },
  {
    passo: "5",
    titulo: "Visualizar Gráficos",
    descricao: "Examine gráficos de custos consolidados e tendências em Gráficos.",
  },
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
        {/*coluna esquerda: o retângulo grande com a explicação resumida*/}
        <article className="cartao-vidro sobre__destaque">
          <h2>Sobre o Projeto</h2>
          <p>
            O <strong>FOCUS Multi-Cloud</strong> é uma ferramenta desenvolvida como Trabalho de Conclusão de Curso (TCC) para unificar e simplificar a gestão e análise de custos em ambientes multi-cloud.
          </p>
          <p>
            Adotando a especificação aberta <strong>FOCUS</strong> (FinOps Open Cost and Usage Specification), mantida pela FinOps Foundation, o sistema identifica e converte relatórios de faturamento da AWS, Azure, GCP e Oracle para um esquema padronizado — eliminando divergências de nomenclatura e possibilitando comparar gastos de forma centralizada e direta.
          </p>
        </article>

        {/*coluna direita: os blocos de provedores e tecnologias*/}
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
        </div>
      </div>

      {/*como usar esticado ocupando a largura toda entre a grade e a equipe, dividido em passos modernos*/}
      <article className="cartao-vidro sobre__como-usar">
        <h2>Como usar</h2>
        <div className="sobre__passos-grid">
          {PASSOS.map((item) => (
            <div key={item.passo} className="passo-card">
              <div className="passo-card__topo">
                <span className="passo-card__numero">{item.passo}</span>
              </div>
              <h3 className="passo-card__titulo">{item.titulo}</h3>
              <p className="passo-card__desc">{item.descricao}</p>
            </div>
          ))}
        </div>
      </article>

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