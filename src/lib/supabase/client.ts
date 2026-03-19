import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Singleton pattern for client
let client: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!client) {
    client = createClient();
  }
  return client;
};
