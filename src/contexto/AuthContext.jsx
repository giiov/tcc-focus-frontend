import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {

    //lê a sessão atual do supabase e salva no estado
    //o finally garante que "carregando" termina mesmo se a leitura falhar; sem ele a tela
    //ficaria em "Carregando..." para sempre
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSessao(session))
      .catch(() => setSessao(null))
      .finally(() => setCarregando(false));

      
    // adiciona um listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, novaSessao) => {
      setSessao(novaSessao);
    });

    // retorna uma função de limpeza que remove o listener quando o componente é desmontado
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const valor = {
    sessao,
    usuario: sessao ? sessao.user : null,
    carregando,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  }
  return contexto;
}