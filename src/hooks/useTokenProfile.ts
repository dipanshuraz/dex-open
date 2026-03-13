"use client";

import { useEffect, useState } from "react";

export interface TokenProfile {
  tokenAddress: string;
  icon?: string;
  header?: string | null;
  description?: string | null;
  links?: { type?: string | null; label?: string | null; url: string }[] | null;
}

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
      } catch (err: any) {
        console.error("useTokenProfile error:", err);
        if (!isMounted) return;
        setError(err?.message || "Failed to load token profile");
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

