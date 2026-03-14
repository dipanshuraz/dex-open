import { useState, useEffect } from "react";
import { POLLING_CONFIG } from "@/lib/config";
import type { Pool } from "@/types";

export type { Pool };
export function usePools(chain: string, tokenAddress: string) {
  const [data, setData] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenAddress) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pools?chain=${chain}&token=${tokenAddress}`);
        const json = await res.json();
        
        if (mounted && Array.isArray(json)) {
          const sorted = [...json].sort((a, b) => (b.liquidity ?? 0) - (a.liquidity ?? 0));
          setData(sorted);
        }
      } catch (err) {
        console.error("Failed to load pools", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const intervalId = setInterval(load, POLLING_CONFIG.pools);


    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [chain, tokenAddress]);

  return { pools: data, loading };
}
