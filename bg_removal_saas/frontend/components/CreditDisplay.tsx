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
            <div className="fixed top-6 right-6 glass-card px-5 py-2 border-amber-500/30 text-amber-500 font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span>⭐ Admin Badge</span>
                <span className="text-white mx-2">|</span>
                <span>∞ Unlimited</span>
            </div>
        );
    }

    const isLow = credits !== 'Unlimited' && Number(credits) < 10;
    
    return (
        <div className={`fixed top-6 right-6 glass-card px-5 py-2 font-semibold transition-all duration-300 ${pulse ? 'scale-110' : ''} ${isLow ? 'text-red-400 border-red-500/50' : 'text-accent-light'}`}>
            {credits === 0 ? "Get more credits" : `${credits} credits`}
        </div>
    );
}
