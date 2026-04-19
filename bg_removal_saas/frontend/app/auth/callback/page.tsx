'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../../lib/supabase';

export default function AuthCallback() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    useEffect(() => {
        supabase.auth.getSession().then(() => {
            router.push('/');
        });
    }, [router, supabase]);

    return <div className="text-center mt-32">Verifying identity...</div>;
}
