"use client";

import { useEffect, useRef, useState } from "react";
import { fetchPair, DexPair } from "@/lib/dexscreener";
import { POLLING_CONFIG } from "@/lib/config";

const POLL_INTERVAL = POLLING_CONFIG.pairMetadata;


export function usePairMetadata(chainId: string, pairAddress: string) {
  const [metadata, setMetadata] = useState<DexPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!pairAddress || !chainId) return;
      try {
        const pair = await fetchPair(chainId, pairAddress);
        if (isMounted) {
          setMetadata(pair);
          setLoading(false);
          setError(null);
        }
      } catch (err: unknown) {
        console.error("Pair metadata error:", err instanceof Error ? err.message : err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }

    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [chainId, pairAddress]);

  return { metadata, loading, error };
}
