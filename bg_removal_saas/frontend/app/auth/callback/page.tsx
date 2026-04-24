'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  useEffect(() => { supabase.auth.getSession().then(() => router.push('/tool')); }, [router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0C0806]">
      <div className="w-8 h-8 border-2 border-[#8B5E3C]/20 border-t-[#E8B98A] rounded-full animate-spin" />
      <p className="text-xs text-[#BFA899]/40 font-mono tracking-widest uppercase">Authenticating...</p>
    </div>
  );
}
