// utils/supabase/middleware.js
import { createServerClient } from '@supabase/ssr'; // Remove 'type CookieOptions' import
import { NextResponse } from 'next/server'; // Remove 'type NextRequest' import

// Remove the type annotation from request
export async function updateSession(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
           // Logic remains the same
          return request.cookies.getAll();
        },
         // Remove the type annotation from cookiesToSet
        setAll(cookiesToSet) {
           // Logic remains the same
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}