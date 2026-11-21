import { useState } from "react";
import { Navigate } from "react-router-dom";
import FundoQuadrados from "../componentes/FundoQuadrados";
import Logo from "../componentes/Logo";
import logoNuvem from "../assets/logo-nuvem.png";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexto/AuthContext";

//o supabase informa o motivo do erro em "code"; aqui cada código vira uma frase em português
const MENSAGENS_DE_ERRO = {
  invalid_credentials: "E-mail ou senha incorretos.",
  email_not_confirmed: "Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.",
  user_already_exists: "Já existe uma conta com esse e-mail.",
  weak_password: "Senha fraca. Use pelo menos 6 caracteres.",
  email_address_invalid: "Esse e-mail não é válido.",
  over_email_send_rate_limit: "Muitos e-mails enviados. Aguarde alguns minutos e tente de novo.",
};

//se o código não estiver na lista, mostramos uma frase genérica em vez do texto em inglês
function traduzirErro(error) {
  return MENSAGENS_DE_ERRO[error.code] ?? "Não foi possível concluir. Tente novamente.";
}

function Login() {
  //modo controla se o formulário é de "entrar" ou de "criar conta"; o resto da tela é igual
  const [modo, setModo] = useState("entrar");
  //os campos ficam no estado para o react saber o que foi digitado
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const { usuario, carregando } = useAuth();

  const criando = modo === "criar";

  function alternarModo() {
    setModo(criando ? "entrar" : "criar");
    //mensagens do modo anterior não fazem sentido no novo
    setErro("");
    setAviso("");
  }

  async function enviar(evento) {
    //sem isso o navegador recarrega a página ao enviar o formulário e perdemos o estado
    evento.preventDefault();

    setEnviando(true);
    setErro("");
    setAviso("");

    try {
      if (criando) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: senha,
        });

        if (error) {
          setErro(traduzirErro(error));
          return;
        }

        //sem sessão = o projeto exige confirmar o e-mail antes de entrar
        if (!data.session) {
          setAviso("Enviamos um link de confirmação para o seu e-mail. Confirme e depois entre.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

        if (error) {
          setErro(traduzirErro(error));
          return;
        }
      }
      //não há navegar() aqui: quando o login dá certo, o contexto recebe a sessão e o
      //"if (usuario)" lá embaixo redireciona sozinho
    } catch {
      setErro("Não consegui falar com o servidor. Verifique sua conexão.");
    } finally {
      //o finally roda mesmo quando há return dentro do try
      setEnviando(false);
    }
  }

  //estes returns vêm depois de todos os hooks, porque o react exige a mesma ordem de hooks sempre
  if (carregando) return null;
  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="login">
      <FundoQuadrados />

      <div className="login__container">
        {/*lado esquerdo: só decoração e a mensagem do projeto, por isso o alt da imagem fica vazio*/}
        <section className="login__vitrine">
          <img src={logoNuvem} alt="" className="login__nuvem" />
          <h2 className="login__chamada">Todos os custos de nuvem em um único formato</h2>
          <p className="login__apoio">
            Envie o CSV da AWS, Azure, GCP ou Oracle, converta para o padrão FOCUS e analise tudo em um só lugar.
          </p>
        </section>

        <section className="login__lado">
          <div className="login__cartao">
            <Logo />

            <h1>{criando ? "Criar conta" : "Entrar"}</h1>

            <form onSubmit={enviar} className="login__form">
              <div className="campo">
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  autoComplete="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="campo">
                <label htmlFor="senha">Senha</label>
                {/*o autoComplete diz ao navegador se deve sugerir a senha salva ou gerar uma nova*/}
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  autoComplete={criando ? "new-password" : "current-password"}
                  minLength={criando ? 6 : undefined}
                  placeholder="••••••••"
                  required
                />
              </div>

              {erro && (
                <p className="erro" role="alert">
                  {erro}
                </p>
              )}
              {aviso && (
                <p className="dica" role="status">
                  {aviso}
                </p>
              )}

              <button type="submit" className="botao" disabled={enviando}>
                {enviando ? "Aguarde..." : criando ? "Criar conta" : "Entrar"}
              </button>
            </form>

            <p className="dica">
              {criando ? "Já tem conta? " : "Ainda não tem conta? "}
              <button type="button" className="login__alternar" onClick={alternarModo}>
                {criando ? "Entrar" : "Criar conta"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;