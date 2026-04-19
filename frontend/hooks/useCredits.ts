"use client";

import { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface CreditInfo {
  credits_left: number;
  total_used: number;
  plan: string;
  is_admin: boolean;
}

export function useCredits() {
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const fetchCredits = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setCredits(null);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/credits", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Credits fetch failed: ${res.status}`);
      }

      const data: CreditInfo = await res.json();
      setCredits(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("useCredits error:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCredits();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchCredits();
      } else {
        setCredits(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCredits, supabase]);

  const updateAfterRemoval = useCallback(
    (newCreditsLeft: number) => {
      setCredits((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          credits_left: newCreditsLeft,
          total_used: prev.total_used + 5,
        };
      });
    },
    []
  );

  const refetch = useCallback(() => {
    setLoading(true);
    fetchCredits();
  }, [fetchCredits]);

  return { credits, loading, error, updateAfterRemoval, refetch };
}
