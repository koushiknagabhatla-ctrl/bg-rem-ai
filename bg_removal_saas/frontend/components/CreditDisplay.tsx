'use client';
import { useCredits } from '@/hooks/useCredits';
import { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';

export function CreditDisplay({ triggerTime }: { triggerTime: number }) {
  const { credits, isAdmin, loading, refetch } = useCredits();
  const [pulse, setPulse] = useState(false);
  useEffect(() => { refetch(); setPulse(true); setTimeout(() => setPulse(false), 400); }, [triggerTime, refetch]);

  if (loading) return <div className="h-8 w-24 rounded-full bg-cream-dark animate-pulse" />;
  if (isAdmin) return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-xs font-semibold">
      <Sparkles className="w-3.5 h-3.5" /> Admin
    </div>
  );
  const low = credits !== 'Unlimited' && Number(credits) < 10;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-transform duration-200 ${pulse ? 'scale-105' : ''} ${low ? 'text-red-600 border-red-200/50 bg-red-50/50' : 'text-ink-muted border-ink/[0.06] bg-cream-light'}`}>
      <Coins className="w-3.5 h-3.5" /> {credits === 0 ? 'No credits' : `${credits} credits`}
    </div>
  );
}
