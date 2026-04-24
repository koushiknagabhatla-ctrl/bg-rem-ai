'use client';
import { useCredits } from '@/hooks/useCredits';
import { useEffect, useState } from 'react';
import { Sparkles, Coins } from 'lucide-react';

export function CreditDisplay({ triggerTime }: { triggerTime: number }) {
  const { credits, isAdmin, loading, refetch } = useCredits();
  const [pulse, setPulse] = useState(false);
  useEffect(() => { refetch(); setPulse(true); setTimeout(() => setPulse(false), 400); }, [triggerTime, refetch]);

  if (loading) return <div className="h-8 w-24 rounded-full bg-[#1A0E08] animate-pulse" />;
  if (isAdmin) return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5E3C]/20 border border-[#8B5E3C]/30 text-[#E8B98A] text-xs font-semibold">
      <Sparkles className="w-3.5 h-3.5" /> Admin
    </div>
  );
  const low = credits !== 'Unlimited' && Number(credits) < 10;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-transform duration-200 ${pulse ? 'scale-105' : ''} ${low ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-[#BFA899] border-[#8B5E3C]/20 bg-[#1A0E08]/50'}`}>
      <Coins className="w-3.5 h-3.5" /> {credits === 0 ? 'No credits' : `${credits} credits`}
    </div>
  );
}
