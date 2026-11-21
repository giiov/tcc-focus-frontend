import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";

//cargos disponíveis para seleção
const CARGOS = [
  "Engenheiro de Software",
  "DevOps / SRE",
  "Analista FinOps",
  "Arquiteto de Nuvem",
  "Gestor Financeiro",
  "Gestor de TI",
  "Outro",
];

//provedores disponíveis para seleção
const PROVEDORES_DISPONIVEIS = ["AWS", "Azure", "GCP", "Oracle"];

function Perfil() {
  //cargo selecionado pelo usuário
  const [cargo, setCargo] = useState("");

  //provedores selecionados pelo usuário (pode marcar mais de um)
  const [provedores, setProvedores] = useState([]);

  //estados de feedback
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  //pega a sessão do contexto para exibir o e-mail do usuário
  const { usuario } = useAuth();

  //quando a página abre, carrega os dados de perfil já salvos (se houver)
  useEffect(() => {
    if (!usuario) return;

    const metadados = usuario.user_metadata || {};
    if (metadados.cargo) setCargo(metadados.cargo);
    if (metadados.provedores) setProvedores(metadados.provedores);
  }, [usuario]);

  //adiciona ou remove um provedor da lista selecionada
  function alternarProvedor(provedor) {
    setProvedores((atual) =>
      atual.includes(provedor)
        ? atual.filter((p) => p !== provedor)
        : [...atual, provedor]
    );
  }

  //envia as informações de perfil para o Supabase Auth
  async function salvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro("");
    setSucesso(false);

    //o updateUser salva os dados em user_metadata na conta do usuário logado
    //não precisa de tabela no banco: o Supabase Auth guarda isso automaticamente
    const { error } = await supabase.auth.updateUser({
      data: { cargo, provedores },
    });

    if (error) {
      setErro("Não foi possível salvar. Tente novamente.");
    } else {
      setSucesso(true);
      //esconde a mensagem de sucesso depois de 3 segundos
      setTimeout(() => setSucesso(false), 3000);
    }

    setSalvando(false);
  }

  return (
    <section>
      <h1 className="pagina__titulo">Perfil</h1>

      <div className="cartao-vidro">
        {/*e-mail da conta, apenas informativo*/}
        <div className="perfil__campo">
          <label className="perfil__rotulo">E-mail</label>
          <p className="perfil__valor">{usuario?.email}</p>
        </div>

        <form onSubmit={salvar}>
          {/*seleção do cargo*/}
          <div className="perfil__campo">
            <label className="perfil__rotulo" htmlFor="cargo">
              Cargo / Função
            </label>
            <select
              id="cargo"
              className="perfil__select"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              <option value="">Selecione seu cargo</option>
              {CARGOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/*seleção dos provedores de nuvem (múltiplos)*/}
          <div className="perfil__campo">
            <label className="perfil__rotulo">
              Provedores que você trabalha
            </label>
            <div className="perfil__provedores">
              {PROVEDORES_DISPONIVEIS.map((p) => (
                <label key={p} className="perfil__provedor">
                  <input
                    type="checkbox"
                    checked={provedores.includes(p)}
                    onChange={() => alternarProvedor(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/*mensagens de erro e sucesso*/}
          {erro && (
            <p className="erro" role="alert">
              {erro}
            </p>
          )}
          {sucesso && (
            <p className="dica" role="status">
              Perfil salvo com sucesso!
            </p>
          )}

          <button
            type="submit"
            className="botao"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Perfil;