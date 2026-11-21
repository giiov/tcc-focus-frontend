import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

//envolve as páginas que exigem login: quem não está logado é mandado para o /login
function RotaProtegida() {
  const { usuario, carregando } = useAuth();

  //enquanto a sessão está sendo lida, ainda não sabemos se há alguém logado
  //sem essa espera, quem recarrega a página seria mandado para o login por engano
  if (carregando) return <p className="dica">Carregando...</p>;

  if (!usuario) return <Navigate to="/login" replace />;

  //o Outlet mostra a rota filha (aqui, o Layout com as páginas)
  return <Outlet />;
}

export default RotaProtegida;