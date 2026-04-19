'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  useEffect(() => { supabase.auth.getSession().then(() => router.push('/')); }, [router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black">
      <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-xs text-white/20">Verifying...</p>
    </div>
  );
}
