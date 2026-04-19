'use client';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { LandingView } from '@/components/LandingView';
import { Workspace } from '@/components/Workspace';

export default function Home() {
    const supabase = createBrowserSupabaseClient();
    const [session, setSession] = useState<any>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-white/30 text-sm">Loading PixelForge...</p>
            </div>
        );
    }

    return !session ? <LandingView /> : <Workspace />;
}
