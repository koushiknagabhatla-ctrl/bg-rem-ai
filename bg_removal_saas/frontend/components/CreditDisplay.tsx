'use client';
import { useCredits } from '@/hooks/useCredits';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function CreditDisplay({ triggerTime }: { triggerTime: number }) {
    const { credits, isAdmin, loading, refetch } = useCredits();
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        refetch();
        setPulse(true);
        setTimeout(() => setPulse(false), 500);
    }, [triggerTime, refetch]);

    if (loading) return null;

    if (isAdmin) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium shadow-lg shadow-amber-500/5">
                <Sparkles className="w-4 h-4" />
                <span>Admin</span>
                <span className="text-white/30 mx-1">•</span>
                <span>∞ Unlimited</span>
            </div>
        );
    }

    const isLow = credits !== 'Unlimited' && Number(credits) < 10;
    
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
            pulse ? 'scale-105' : ''
        } ${
            isLow 
                ? 'text-red-400 border-red-500/20 bg-red-500/10' 
                : 'text-purple-300 border-purple-500/20 bg-purple-500/10'
        }`}>
            {credits === 0 ? "Credits Depleted" : `${credits} Credits`}
        </div>
    );
}
