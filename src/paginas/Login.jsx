import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FundoQuadrados from "../componentes/FundoQuadrados";
import Logo from "../componentes/Logo";
import logoNuvem from "../assets/logo-nuvem.png";

function Login() {
  //modo controla se o formulário é de "entrar" ou de "criar conta"; o resto da tela é igual
  const [modo, setModo] = useState("entrar");
  //os campos ficam no estado para o react saber o que foi digitado (vamos precisar disso para enviar ao supabase)
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  //o Link só funciona no clique; o useNavigate troca de página pelo código, depois do envio do formulário
  const navegar = useNavigate();

  const criando = modo === "criar";

  function enviar(evento) {
    //sem isso o navegador recarrega a página ao enviar o formulário e perdemos o estado
    evento.preventDefault();

    //por enquanto vai direto para o painel; aqui vai entrar a autenticação do supabase
    navegar("/");
  }

  return (
    <div className="login">
      <FundoQuadrados />

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
                required
              />
            </div>

            <button type="submit" className="botao">
              {criando ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="dica">
            {criando ? "Já tem conta? " : "Ainda não tem conta? "}
            <button
              type="button"
              className="login__alternar"
              onClick={() => setModo(criando ? "entrar" : "criar")}
            >
              {criando ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;