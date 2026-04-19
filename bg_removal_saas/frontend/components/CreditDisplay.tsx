'use client';
import { useCredits } from '../hooks/useCredits';
import { useEffect, useState } from 'react';

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
            <div className="glass px-5 py-2 border border-amber-500/30 text-amber-500 font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-full text-sm">
                <span>⭐ Core Admin</span>
                <span className="text-white mx-2">|</span>
                <span>∞ Unlimited Generations</span>
            </div>
        );
    }

    const isLow = credits !== 'Unlimited' && Number(credits) < 10;
    
    return (
        <div className={`glass px-5 py-2 font-semibold transition-all duration-300 rounded-full text-sm border ${pulse ? 'scale-105 shadow-xl' : 'shadow-md'} ${isLow ? 'text-red-400 border-red-500/50 bg-red-500/10' : 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10'}`}>
            {credits === 0 ? "Credits Depleted" : `${credits} API Credits`}
        </div>
    );
}
