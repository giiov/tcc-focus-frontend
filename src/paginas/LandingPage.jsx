import { ArrowDown, ArrowRight, BarChart3, Check, Cloud, FileUp, Layers3, Table2 } from "lucide-react";
import { Link } from "react-router-dom";
import logoNuvem from "../assets/logo-nuvem.png";

const PROVEDORES = ["AWS", "Azure", "Google Cloud", "Oracle Cloud"];

function LandingPage() {
  return (
    <main className="landing" id="topo">
      <header className="landing__nav">
        <Link className="landing__marca" to="/" aria-label="FOCUS Multi-Cloud, página inicial">
          <img src={logoNuvem} alt="" />
          <span><strong>FOCUS</strong> Multi-Cloud</span>
        </Link>
        <nav className="landing__links" aria-label="Navegação principal">
          <Link className="landing__entrar" to="/app">Entrar <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="landing__hero">
        <div className="landing__texto">
          <div className="landing__selo"><span /> FinOps para ambientes multi-cloud</div>
          <h1>Seus custos de nuvem, <em>em um só formato.</em></h1>
          <p className="landing__descricao">
            Compare gastos entre provedores sem perder tempo traduzindo relatórios diferentes.
            Envie seu CSV e explore os dados no padrão aberto FOCUS.
          </p>
          <div className="landing__acoes">
            <Link to="/app" className="landing__botao">Começar agora <ArrowRight size={17} /></Link>
            <a href="#como-funciona" className="landing__link-secundario">Conhecer o projeto <ArrowDown size={15} /></a>
          </div>
          <div className="landing__provedores" aria-label="Provedores suportados">
            <span>Compatível com</span>
            {PROVEDORES.map((provedor) => <span className="landing__provedor" key={provedor}>{provedor}</span>)}
          </div>
        </div>

        <div className="landing__visual" role="img" aria-label="Prévia ilustrativa de custos padronizados, gráfico e colunas FOCUS">
          <div className="landing__orb landing__orb--um" />
          <div className="landing__orb landing__orb--dois" />
          <div className="landing__janela">
            <div className="landing__janela-topo">
              <div className="landing__janela-marca"><img src={logoNuvem} alt="" /><span>Visão geral</span></div>
              <span className="landing__janela-periodo">Arquivo processado</span>
            </div>
            <div className="landing__resumo">
              <span className="landing__rotulo">CUSTOS NORMALIZADOS</span>
              <strong>Uma visão clara dos seus dados</strong>
              <div className="landing__linha-resumo"><span><i /> AWS</span><b>FOCUS</b><span><i /> Azure</span></div>
              <div className="landing__linha-resumo"><span><i /> Google Cloud</span><b>FOCUS</b><span><i /> Oracle</span></div>
            </div>
            <div className="landing__janela-base">
              <div className="landing__mini-card">
                <div className="landing__mini-titulo"><BarChart3 size={15} /> Custos por serviço</div>
                <div className="landing__grafico" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
                <div className="landing__eixo"><span>01</span><span>07</span><span>14</span><span>21</span><span>30</span></div>
              </div>
              <div className="landing__mini-card landing__mini-card--colunas">
                <div className="landing__mini-titulo"><Layers3 size={15} /> Dados padronizados</div>
                <div className="landing__coluna"><span><Check size={12} /> ProviderName</span><span>string</span></div>
                <div className="landing__coluna"><span><Check size={12} /> BilledCost</span><span>decimal</span></div>
                <div className="landing__coluna"><span><Check size={12} /> ChargePeriod</span><span>date</span></div>
              </div>
            </div>
          </div>
          <div className="landing__nota"><span className="landing__nota-icone"><FileUp size={17} /></span><span><strong>Do CSV à análise</strong><small>Em poucos passos</small></span><Check className="landing__nota-check" size={17} /></div>
        </div>
      </section>

      <section className="landing__faixa" id="como-funciona">
        <div className="landing__faixa-intro"><span>UM FLUXO MAIS SIMPLES</span><h2>Menos planilhas diferentes.<br />Mais contexto para decidir.</h2></div>
        <p>O FOCUS Multi-Cloud transforma relatórios de custos em uma estrutura comum para você entender o que está acontecendo entre as nuvens.</p>
      </section>

      <section className="landing__recursos" id="recursos" aria-label="Etapas de uso">
        <article className="landing__recurso"><span className="landing__recurso-numero">01</span><div className="landing__recurso-icone"><FileUp size={19} /></div><h3>Envie seu arquivo</h3><p>Comece com um CSV de custos exportado do seu provedor de nuvem.</p></article>
        <article className="landing__recurso"><span className="landing__recurso-numero">02</span><div className="landing__recurso-icone"><Cloud size={19} /></div><h3>Padronize os dados</h3><p>Os campos são organizados no padrão FOCUS para facilitar comparações.</p></article>
        <article className="landing__recurso"><span className="landing__recurso-numero">03</span><div className="landing__recurso-icone"><Table2 size={19} /></div><h3>Explore os resultados</h3><p>Consulte os dados em tabelas e gráficos, em um só espaço de trabalho.</p></article>
      </section>

      <footer className="landing__rodape"><Link className="landing__marca" to="/"><img src={logoNuvem} alt="" /><span><strong>FOCUS</strong> Multi-Cloud</span></Link><span>Projeto acadêmico de FinOps • FOCUS Multi-Cloud</span><a href="#topo">Voltar ao topo <ArrowRight size={14} /></a></footer>
    </main>
  );
}

export default LandingPage;
