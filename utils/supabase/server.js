// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr'; // Remove 'type CookieOptions' import
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll(); // No type needed for return
        },
        // Remove the type annotation from cookiesToSet
        setAll(cookiesToSet) {
          try {
             // Logic remains the same
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch (error) {
            console.warn(`[Supabase Server Client] Failed to set cookies in Server Component: ${error}. Ensure middleware is properly configured.`);
          }
        },
      },
    }
  );
}