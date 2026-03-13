"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { POLLING_CONFIG } from "@/lib/config";

export interface Trade {
  id: string;
  txHash: string;
  logIndex: number;
  trader: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  timestamp: number;
  isNew?: boolean;
  isWhale?: boolean;
}

const POLL_MS = POLLING_CONFIG.trades;
const WHALE_THRESHOLD = 5000;
const NEW_TRADE_TTL = 1500;

function enrich(data: Trade[], markNew = false): Trade[] {
  return data.map((t) => ({
    ...t,
    isWhale: t.total >= WHALE_THRESHOLD,
    ...(markNew ? { isNew: true } : {}),
  }));
}

export function useTrades(chainId: string, tokenAddress: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oldestBlockRef = useRef<number | undefined>(undefined);
  const isFirstPollRef = useRef(true);

  // ── Polling: initial load then merge-prepend new trades ──
  useEffect(() => {
    if (!tokenAddress || !chainId) return;
    let isMounted = true;
    let tid: ReturnType<typeof setTimeout>;
    isFirstPollRef.current = true;

    setTrades([]);
    setLoading(true);
    setHasMore(false);
    setError(null);
    oldestBlockRef.current = undefined;

    async function poll() {
      try {
        const res = await fetch(`/api/trades?chain=${chainId}&token=${tokenAddress}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch trades");
        }

        const data = await res.json();
        const incoming: Trade[] = data.trades ?? data;
        const isFirst = isFirstPollRef.current;

        if (isMounted) {
          if (isFirst) {
            // First load — populate the list
            setTrades(enrich(incoming, false));
            setLoading(false);
            setError(null);
            isFirstPollRef.current = false;
            if (data.oldestBlock !== undefined) {
              oldestBlockRef.current = data.oldestBlock;
            }
            setHasMore(data.hasMore === true);
          } else {
            // Subsequent polls — only prepend trades we haven't seen before
            setTrades((prev) => {
              const seen = new Set(prev.map((t) => t.id));
              const fresh = enrich(
                incoming.filter((t) => !seen.has(t.id)),
                true // flash new ones
              );
              if (fresh.length === 0) return prev;
              const merged = [...fresh, ...prev];
              merged.sort((a, b) => b.timestamp - a.timestamp);
              return merged;
            });

            // Clear the isNew flash after TTL
            setTimeout(() => {
              if (isMounted) {
                setTrades((prev) =>
                  prev.map((t) => (t.isNew ? { ...t, isNew: false } : t))
                );
              }
            }, NEW_TRADE_TTL);
          }
        }
      } catch (err) {
        console.error("Trades poll error:", err);
        if (isMounted) {
          if (isFirstPollRef.current) {
            setLoading(false);
          }
          setError((err as any)?.message || "Failed to load trades");
        }
      } finally {
        if (isMounted) tid = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      isMounted = false;
      clearTimeout(tid);
    };
  }, [chainId, tokenAddress]);

  // ── Load more (older trades) on scroll ──
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    if (oldestBlockRef.current === undefined) {
      console.warn("[useTrades] loadMore: oldestBlock not yet known, skipping");
      return;
    }
    setLoadingMore(true);
    try {
      const before = oldestBlockRef.current;
      const res = await fetch(
        `/api/trades?chain=${chainId}&token=${tokenAddress}&before=${before}`
      );
      if (!res.ok) throw new Error("Failed to fetch older trades");

      const data = await res.json();
      const incoming: Trade[] = data.trades ?? [];

      setTrades((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        const fresh = enrich(incoming).filter((t) => !seen.has(t.id));
        const merged = [...prev, ...fresh];
        merged.sort((a, b) => b.timestamp - a.timestamp);
        return merged;
      });

      if (data.oldestBlock !== undefined) {
        oldestBlockRef.current = data.oldestBlock;
      }
      setHasMore(data.hasMore === true);
    } catch (err) {
      console.error("loadMore error:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [chainId, tokenAddress, loadingMore, hasMore]);

  return { trades, loading, loadingMore, hasMore, loadMore, error };
}

