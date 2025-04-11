// app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Server client

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username, highest_streak')
            .not('username', 'is', null)
            .order('highest_streak', { ascending: false })
            .limit(10);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        return NextResponse.json({ message: error.message || 'Failed to fetch' }, { status: 500 });
    }
}