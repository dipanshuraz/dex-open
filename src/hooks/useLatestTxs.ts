"use client";

import { useEffect, useState, useRef } from "react";
import { fetchPair } from "@/lib/dexscreener";
import { POLLING_CONFIG } from "@/lib/config";

const POLL_INTERVAL = POLLING_CONFIG.tradeStats;


export interface TradePeriodStats {
  m5:  { buys: number; sells: number; volume: number };
  h1:  { buys: number; sells: number; volume: number };
  h6:  { buys: number; sells: number; volume: number };
  h24: { buys: number; sells: number; volume: number };
}

export function useTradeStats(chainId: string, pairAddress: string) {
  const [stats, setStats] = useState<TradePeriodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      if (!pairAddress || !chainId) return;
      try {
        const pair = await fetchPair(chainId, pairAddress);
        if (!isMounted || !pair) return;

        setStats({
          m5:  { buys: pair.txns.m5.buys,  sells: pair.txns.m5.sells,  volume: pair.volume.m5 ?? 0 },
          h1:  { buys: pair.txns.h1.buys,  sells: pair.txns.h1.sells,  volume: pair.volume.h1 ?? 0 },
          h6:  { buys: pair.txns.h6.buys,  sells: pair.txns.h6.sells,  volume: pair.volume.h6 ?? 0 },
          h24: { buys: pair.txns.h24.buys, sells: pair.txns.h24.sells, volume: pair.volume.h24 ?? 0 },
        });
        setLoading(false);
        setError(null);
      } catch (err: unknown) {
        console.error("Trade stats error:", err instanceof Error ? err.message : err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }

    fetchStats();
    intervalRef.current = setInterval(fetchStats, POLL_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chainId, pairAddress]);

  return { stats, loading, error };
}
