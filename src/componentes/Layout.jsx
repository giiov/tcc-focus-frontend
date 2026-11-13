import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ChartColumn,
  History,
  House,
  Info,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Table,
} from "lucide-react";
import Logo from "./Logo";

//cada item do menu vira um link; guardar em lista evita repetir o mesmo bloco seis vezes
//"Icone" começa com letra maiúscula porque o react só trata como componente nomes assim
const ITENS = [
  { caminho: "/", rotulo: "Início", Icone: House },
  { caminho: "/dados", rotulo: "Dados", Icone: Table },
  { caminho: "/graficos", rotulo: "Gráficos", Icone: ChartColumn },
  { caminho: "/historico", rotulo: "Histórico", Icone: History },
  { caminho: "/assistente", rotulo: "Assistente", Icone: Sparkles },
  { caminho: "/sobre", rotulo: "Sobre", Icone: Info },
];

//o layout é a moldura das páginas internas: sidebar fixa + a página atual ao lado
function Layout() {
  //recolhida guarda se a sidebar mostra só os ícones
  const [recolhida, setRecolhida] = useState(false);

  return (
    <div className={recolhida ? "layout layout--recolhido" : "layout"}>
      <aside className="sidebar">
        <Logo compacto={recolhida} />

        <nav className="menu" aria-label="Menu principal">
          {/*o NavLink sabe se o endereço atual é o dele e avisa pelo isActive
              o "end" faz o Início só ficar ativo em "/", e não em todos os endereços que começam com "/"
              com o texto escondido na sidebar recolhida, o aria-label mantém o nome para leitores de tela*/}
          {ITENS.map(({ caminho, rotulo, Icone }) => (
            <NavLink
              key={caminho}
              to={caminho}
              end={caminho === "/"}
              aria-label={rotulo}
              title={rotulo}
              className={({ isActive }) =>
                isActive ? "menu__item menu__item--ativo" : "menu__item"
              }
            >
              <span className="menu__quadrado">
                <Icone size={20} aria-hidden="true" />
              </span>
              <span className="menu__rotulo">{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__rodape">
          <button
            className="menu__item"
            onClick={() => setRecolhida(!recolhida)}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
          >
            <span className="menu__quadrado">
              {recolhida ? (
                <PanelLeftOpen size={20} aria-hidden="true" />
              ) : (
                <PanelLeftClose size={20} aria-hidden="true" />
              )}
            </span>
            <span className="menu__rotulo">{recolhida ? "Expandir menu" : "Recolher menu"}</span>
          </button>

          {/*por enquanto "Sair" só volta para o login; com o supabase vai encerrar a sessão de verdade*/}
          <Link to="/login" className="menu__item" aria-label="Sair" title="Sair">
            <span className="menu__quadrado">
              <LogOut size={20} aria-hidden="true" />
            </span>
            <span className="menu__rotulo">Sair</span>
          </Link>
        </div>
      </aside>

      {/*o Outlet é o buraco onde o react router coloca a página escolhida (Início, Dados...)*/}
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;