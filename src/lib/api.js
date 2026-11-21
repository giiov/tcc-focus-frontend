import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

//erro das chamadas à api: guarda o status para a tela poder decidir o que fazer com ele
export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

//chama a api mandando o token do usuário logado no cabeçalho Authorization
//uso: chamarApi("/conversas")  ou  chamarApi("/conversas", { method: "POST", json: { titulo: "x" } })
export async function chamarApi(caminho, opcoes = {}) {
  //pedimos a sessão a cada chamada, em vez de guardar o token: o supabase renova
  //o token sozinho quando ele está perto de vencer
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new ErroApi("Faça login para continuar.", 401);
  }

  const { json, ...resto } = opcoes;
  const cabecalhos = { ...resto.headers, Authorization: `Bearer ${token}` };

  //com "json" a função monta o corpo e o cabeçalho; com FormData (upload) o navegador
  //define o Content-Type sozinho, por isso não mexemos nele
  if (json !== undefined) {
    cabecalhos["Content-Type"] = "application/json";
    resto.body = JSON.stringify(json);
  }

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { ...resto, headers: cabecalhos });
  } catch {
    throw new ErroApi("Não consegui falar com o servidor. Confira se a API está rodando.", 0);
  }

  //o 204 (apagar) não tem corpo
  const corpo = resposta.status === 204 ? null : await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const mensagem =
      typeof corpo?.detail === "string" ? corpo.detail : "Não foi possível concluir a operação.";
    throw new ErroApi(mensagem, resposta.status);
  }

  return corpo;
}