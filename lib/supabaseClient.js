// lib/supabaseClient.js - Keep this simple for now
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
// We will primarily use the context client from _app.js