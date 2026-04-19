import { useState, useCallback, useEffect } from 'react';
import { createBrowserSupabaseClient } from '../lib/supabase';

export function useCredits() {
    const [credits, setCredits] = useState<number | 'Unlimited'>(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserSupabaseClient();

    const fetchCredits = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setLoading(false);
            return;
        }

        const res = await fetch('/api/credits', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setCredits(data.credits_left);
            setIsAdmin(data.is_admin);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    return { credits, isAdmin, loading, refetch: fetchCredits };
}
