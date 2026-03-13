 "use client";

import { useEffect, useState } from "react";

export interface TrendingToken {
  symbol: string;
  marketCap: number;
  change24h: number;
  volume24h: number;
  txns24h: number;
  trendScore: number;
  pairAddress: string;
  chainId: string;
  logo: string | null;
  tokenAddress?: string;
  boosts?: { score?: number } | null;
}

interface UseTrendingResult {
  tokens: TrendingToken[];
  loading: boolean;
  error: string | null;
}

export function useTrendingTokens(): UseTrendingResult {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/trending");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!isMounted) return;
        setTokens(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error("useTrendingTokens error:", err);
        if (!isMounted) return;
        setError(err?.message || "Failed to load trending tokens");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { tokens, loading, error };
}

