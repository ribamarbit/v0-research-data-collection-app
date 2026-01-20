import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function createClient() {
  // Se já existe uma instância, reutiliza
  if (client) {
    return client;
  }

  // Verifica se as variáveis de ambiente existem
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[v0] Supabase environment variables not found');
    throw new Error('Supabase configuration missing');
  }

  // Cria nova instância apenas se não existir
  client = createBrowserClient(supabaseUrl, supabaseKey);
  
  return client;
}

export { createBrowserClient } from "@supabase/ssr";
