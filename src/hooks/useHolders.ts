"use client";

import { useEffect, useRef, useState } from "react";
import { POLLING_CONFIG } from "@/lib/config";
import type { Holder } from "@/types";

export type { Holder };

const POLL_INTERVAL = POLLING_CONFIG.holders;
const CACHE_TTL = POLL_INTERVAL;

type HoldersCacheEntry = {
  holders: Holder[];
  error: Error | null;
  updatedAt: number;
};

const holdersCache = new Map<string, HoldersCacheEntry>();

export function useHolders(tokenAddress: string, chainId: string = "ethereum") {
  const cacheKey = `${chainId}:${tokenAddress}`;
  const cached = tokenAddress ? holdersCache.get(cacheKey) : undefined;

  const [holders, setHolders] = useState<Holder[]>(cached?.holders ?? []);
  const [loading, setLoading] = useState(
    !cached || Date.now() - cached.updatedAt > CACHE_TTL
  );
  const [error, setError] = useState<Error | null>(cached?.error ?? null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!tokenAddress) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchHolders() {
      try {
        const res = await fetch("/api/holders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenAddress, chainId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = body.error || `HTTP ${res.status}`;
          throw new Error(message);
        }
        const { holders: data, warning } = await res.json();
        if (warning) console.warn("Holders:", warning);
        const normalized = data ?? [];

        // update cache so future mounts reuse it
        const entry: HoldersCacheEntry = {
          holders: normalized,
          error: null,
          updatedAt: Date.now(),
        };
        holdersCache.set(cacheKey, entry);

        if (isMounted) {
          setHolders(normalized);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        const error =
          err instanceof Error ? err : new Error(String(err));
        console.error("Holders error:", error.message);

        // keep last good data in cache; just update error + timestamp
        const previous = holdersCache.get(cacheKey);
        const entry: HoldersCacheEntry = {
          holders: previous?.holders ?? holders,
          error,
          updatedAt: Date.now(),
        };
        holdersCache.set(cacheKey, entry);
        if (isMounted) {
          setError(error);
          setLoading(false);
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }

    fetchHolders();
    intervalRef.current = setInterval(fetchHolders, POLL_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey/holders omitted to avoid loop */
  }, [tokenAddress, chainId]);

  return { holders, loading, error };
}
