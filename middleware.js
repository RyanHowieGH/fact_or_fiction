// middleware.js
import { updateSession } from '@/utils/supabase/middleware'; // Or relative path

export async function middleware(request) {
  return await updateSession(request);
}

export const config = { matcher: [ /* ... */ ] };