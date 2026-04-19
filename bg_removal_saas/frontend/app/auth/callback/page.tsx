'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    supabase.auth.getSession().then(() => router.push('/'));
  }, [router, supabase]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-3">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground">Verifying...</p>
    </div>
  );
}
