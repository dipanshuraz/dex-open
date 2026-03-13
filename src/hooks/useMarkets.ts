"use client";

import { useEffect, useState } from "react";
import type { DexPair } from "@/lib/dexscreener";

export interface MarketOption {
  id: string;
  label: string;
  dexId: string;
  liquidityUsd: number;
  pairAddress: string;
  isPreferred: boolean;
}

interface UseMarketsResult {
  markets: MarketOption[];
  selected?: MarketOption;
  setSelected: (m: MarketOption) => void;
  loading: boolean;
  error: string | null;
}

export function useMarkets(
  chainId: string,
  tokenAddress: string,
  initialDexId?: string,
): UseMarketsResult {
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [selected, setSelected] = useState<MarketOption | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chainId || !tokenAddress) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/dexscreener", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chainId, tokenAddress }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const pairs: DexPair[] = data.pairs ?? [];

        const sorted = [...pairs].sort(
          (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
        );

        const options: MarketOption[] = sorted.map((p, idx) => ({
          id: p.pairAddress,
          label: `${p.dexId.toUpperCase()} ${p.baseToken.symbol}/${p.quoteToken.symbol}`,
          dexId: p.dexId,
          liquidityUsd: p.liquidity?.usd ?? 0,
          pairAddress: p.pairAddress,
          isPreferred: idx === 0,
        }));

        if (!isMounted) return;
        setMarkets(options);

        // Pre-select pool matching initialDexId (case-insensitive prefix match),
        // falling back to the highest-liquidity pool.
        const needle = initialDexId?.toLowerCase();
        const initial = needle
          ? options.find((o) => o.dexId.toLowerCase().startsWith(needle)) ?? options[0]
          : options[0];
        setSelected(initial);
        setError(null);
      } catch (err: any) {
        console.error("useMarkets error:", err);
        if (!isMounted) return;
        setError(err?.message || "Failed to load markets");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [chainId, tokenAddress, initialDexId]);

  return { markets, selected, setSelected, loading, error };
}

