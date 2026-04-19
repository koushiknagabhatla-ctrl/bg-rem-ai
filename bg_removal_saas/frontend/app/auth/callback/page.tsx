'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        supabase.auth.getSession().then(() => {
            router.push('/');
        });
    }, [router, supabase]);

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-4">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Verifying identity...</p>
        </div>
    );
}
