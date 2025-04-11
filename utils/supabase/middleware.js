// utils/supabase/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Initialize Supabase client with inline async cookie methods
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
          // Define getAll inline as async
          getAll: async () => {
            // Access request cookies directly (sync access okay within async wrapper)
            return request.cookies.getAll();
          },
          // Define setAll inline as async
          setAll: async (cookiesToSet) => {
            try {
              // Update request cookies
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
              // Clone response
              response = NextResponse.next({ request: { headers: request.headers } });
              // Update response cookies
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            } catch (error) {
                console.error(`[Supabase Middleware] Failed to set cookies: ${error}`);
            }
          },
      },
    }
  );

  try {
      await supabase.auth.getUser();
  } catch(error) {
      console.error(`[Supabase Middleware] Error during supabase.auth.getUser(): ${error}`);
  }

  return response;
}