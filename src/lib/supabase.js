import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

//falha cedo, com uma mensagem clara, em vez de um erro confuso lá dentro da biblioteca
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local (veja o .env.example)"
  );
}

//única instância do app: todo mundo importa este mesmo cliente
export const supabase = createClient(supabaseUrl, supabaseKey);