// utils/supabase/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let response = NextResponse.next({ /* ... */ });
  const supabase = createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
     { cookies: { /* ... getAll/setAll implementation ... */ } }
  );
  await supabase.auth.getUser();
  return response;
}