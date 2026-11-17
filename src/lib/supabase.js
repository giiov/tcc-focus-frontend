
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// cria e exporta a conexão com o Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
