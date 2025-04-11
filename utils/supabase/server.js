// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Keep static import

export function createClient() {
  // Directly pass anonymous async functions to the cookies object
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Define getAll inline as an async function
        getAll: async () => {
          // Invoke cookies() inside the async function
          const cookieStore = cookies();
          return cookieStore.getAll();
        },
        // Define setAll inline as an async function
        setAll: async (cookiesToSet) => {
          // Invoke cookies() inside the async function
          const cookieStore = cookies();
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (error) {
             console.warn(`[Supabase Server Client] Failed to set cookies: ${error}.`);
          }
        },
      },
    }
  );
}