'use client';
import { useCredits } from '@/hooks/useCredits';
import { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';

export function CreditDisplay({ triggerTime }: { triggerTime: number }) {
  const { credits, isAdmin, loading, refetch } = useCredits();
  const [pulse, setPulse] = useState(false);
  useEffect(() => { refetch(); setPulse(true); setTimeout(() => setPulse(false), 400); }, [triggerTime, refetch]);

  if (loading) return <div className="h-8 w-24 rounded-full bg-white/[0.04] animate-pulse" />;
  if (isAdmin) return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/15 text-amber-400 text-xs font-semibold">
      <Sparkles className="w-3.5 h-3.5" /> Admin — Unlimited
    </div>
  );
  const low = credits !== 'Unlimited' && Number(credits) < 10;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-transform duration-200 ${pulse ? 'scale-105' : ''} ${low ? 'text-red-400 border-red-500/15 bg-red-500/5' : 'text-white/40 border-white/[0.06] bg-white/[0.03]'}`}>
      <Coins className="w-3.5 h-3.5" /> {credits === 0 ? 'No credits' : `${credits} credits`}
    </div>
  );
}
