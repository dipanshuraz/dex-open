"use client";

import { useEffect, useRef, useState } from "react";
import { POLLING_CONFIG } from "@/lib/config";

const POLL_INTERVAL_MS = POLLING_CONFIG.transactions;


export interface TransactionsSnapshot {
  priceUsd: number;
  buys5m: number;
  sells5m: number;
  buys1h: number;
  sells1h: number;
  volume: number;
  lastUpdated: number;
}

export interface TransactionsDeltas {
  buys5mIncreased: boolean;
  sells5mIncreased: boolean;
  buys1hIncreased: boolean;
  sells1hIncreased: boolean;
  priceChanged: boolean;
  volumeChanged: boolean;
}

interface UseTransactionsResult {
  data: TransactionsSnapshot | null;
  deltas: TransactionsDeltas;
  loading: boolean;
  error: string | null;
}

const initialDeltas: TransactionsDeltas = {
  buys5mIncreased: false,
  sells5mIncreased: false,
  buys1hIncreased: false,
  sells1hIncreased: false,
  priceChanged: false,
  volumeChanged: false,
};

export function useTransactions(chainId: string, pairAddress: string): UseTransactionsResult {
  const [data, setData] = useState<TransactionsSnapshot | null>(null);
  const [deltas, setDeltas] = useState<TransactionsDeltas>(initialDeltas);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const prevRef = useRef<TransactionsSnapshot | null>(null);

  useEffect(() => {
    if (!pairAddress || !chainId) return;

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchOnce() {
      try {
        const res = await fetch(
          `/api/transactions?chain=${encodeURIComponent(chainId)}&pair=${encodeURIComponent(
            pairAddress
          )}`
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        const next: TransactionsSnapshot = await res.json();
        if (!isMounted) return;

        // Compute deltas compared to the previous snapshot
        const prev = prevRef.current;
        const nextDeltas: TransactionsDeltas = { ...initialDeltas };

        if (prev) {
          nextDeltas.buys5mIncreased = next.buys5m > prev.buys5m;
          nextDeltas.sells5mIncreased = next.sells5m > prev.sells5m;
          nextDeltas.buys1hIncreased = next.buys1h > prev.buys1h;
          nextDeltas.sells1hIncreased = next.sells1h > prev.sells1h;
          nextDeltas.priceChanged = next.priceUsd !== prev.priceUsd;
          nextDeltas.volumeChanged = next.volume !== prev.volume;
        }

        prevRef.current = next;
        setData(next);
        setDeltas(nextDeltas);
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("useTransactions error:", err);
        if (!isMounted) return;
        setError(err?.message || "Failed to load transactions");
        setLoading(false);
      }
    }

    fetchOnce();
    intervalId = setInterval(fetchOnce, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [chainId, pairAddress]);

  return { data, deltas, loading, error };
}

