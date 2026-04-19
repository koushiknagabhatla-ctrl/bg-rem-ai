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
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black">
      <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
      <p className="text-xs text-white/20">Loading...</p>
    </div>
  );

  return !session ? <LandingView /> : <Workspace />;
}
