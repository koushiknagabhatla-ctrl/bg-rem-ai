'use client';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { LandingView } from '@/components/LandingView';
import { Workspace } from '@/components/Workspace';
import { motion } from 'framer-motion';

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
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full"
        >
            {!session ? <LandingView /> : <Workspace />}
        </motion.div>
    );
}
