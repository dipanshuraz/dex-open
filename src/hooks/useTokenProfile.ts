"use client";

import { useEffect, useState } from "react";
import type { TokenProfile } from "@/types";

export type { TokenProfile };

interface UseTokenProfileResult {
  profile: TokenProfile | null;
  loading: boolean;
  error: string | null;
}

export function useTokenProfile(tokenAddress: string): UseTokenProfileResult {
  const [profile, setProfile] = useState<TokenProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenAddress) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/token-profiles?token=${encodeURIComponent(tokenAddress)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!isMounted) return;
        setProfile(data);
        setError(null);
      } catch (err: unknown) {
        console.error("useTokenProfile error:", err);
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load token profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [tokenAddress]);

  return { profile, loading, error };
}

