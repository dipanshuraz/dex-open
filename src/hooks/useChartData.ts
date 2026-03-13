"use client";

import { useEffect, useRef, useState } from "react";
import { POLLING_CONFIG } from "@/lib/config";

const DEFAULT_POLL_MS = POLLING_CONFIG.chartData;

export interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ── Client-side in-memory cache: key = `${coingeckoId}:${days}` ──
// Candles are stored permanently per session; stale check uses `fetchedAt`.
interface CacheEntry {
  candles: OHLCCandle[];
  fetchedAt: number;
}
const chartCache = new Map<string, CacheEntry>();

export function useChartData(coingeckoId: string | null, days: number = 7, pollMs?: number) {
  const effectivePollMs = pollMs ?? DEFAULT_POLL_MS;
  const cacheKey = `${coingeckoId}:${days}`;

  // Seed state from cache immediately (avoids loading flash on period switch)
  const [candles, setCandles] = useState<OHLCCandle[]>(() => {
    return chartCache.get(cacheKey)?.candles ?? [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const hit = chartCache.get(cacheKey);
    return !hit || hit.candles.length === 0;
  });
  const [error, setError] = useState<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!coingeckoId) return;
    let isMounted = true;

    // Immediately use cached candles if available
    const hit = chartCache.get(cacheKey);
    if (hit && hit.candles.length > 0) {
      setCandles(hit.candles);
      setLoading(false);
    } else {
      setLoading(true);
    }

    async function fetchCandles() {
      try {
        const res = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coingeckoId, days }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { candles: data, error: apiError } = await res.json();
        if (apiError) throw new Error(apiError);
        if (isMounted && data) {
          chartCache.set(cacheKey, { candles: data, fetchedAt: Date.now() });
          setCandles(data);
          setLoading(false);
          setError(null);
        }
      } catch (err: any) {
        console.error("Chart data error:", err.message);
        if (isMounted) { setError(err); setLoading(false); }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }

    fetchCandles();
    intervalRef.current = setInterval(fetchCandles, effectivePollMs);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coingeckoId, days, effectivePollMs]);

  return { candles, loading, error };
}
