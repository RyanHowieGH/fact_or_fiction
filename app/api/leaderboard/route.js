// app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
// Keep the import for createClient
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    // *** Create the client *inside* the GET handler ***
    const supabase = createClient();

    try {
        // The rest of the logic remains the same
        const { data, error } = await supabase
            .from('profiles')
            .select('username, highest_streak')
            .not('username', 'is', null)
            .order('highest_streak', { ascending: false })
            .limit(10);

        if (error) {
             // Log the specific Supabase error for better debugging
             console.error("Supabase Fetch Error in /api/leaderboard:", error);
             throw error; // Re-throw to be caught by the outer catch block
        }
        return NextResponse.json(data);

    } catch (error) {
        // Log the final error caught
        console.error("Caught Error in /api/leaderboard GET:", error);
        return NextResponse.json({ message: error.message || 'Failed to fetch leaderboard data' }, { status: 500 });
    }
}