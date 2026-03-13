"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const oldestBlockRef = useRef<number | undefined>(undefined);
  const isFirstPollRef = useRef(true);
  const lastSeenTsRef = useRef<number | undefined>(undefined);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["trades", chainId, tokenAddress],
    queryFn: async () => {
      const url = `/api/trades?chain=${chainId}&token=${tokenAddress}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to fetch trades");
      }
      return res.json();
    },
    enabled: Boolean(chainId && tokenAddress),
    refetchInterval: POLL_MS,
    staleTime: POLL_MS,
  });

  // ── Merge query data into local enriched state (optimistic-style) ──
  useEffect(() => {
    if (!data) return;
    const incoming: Trade[] = data.trades ?? data;
    const isFirst = isFirstPollRef.current;

    if (isFirst) {
      const enriched = enrich(incoming, false);
      setTrades(enriched);
      isFirstPollRef.current = false;
      setError(null);
      if (data.oldestBlock !== undefined) {
        oldestBlockRef.current = data.oldestBlock;
      }
      setHasMore(data.hasMore === true);
      if (enriched.length > 0) {
        lastSeenTsRef.current = Math.max(...enriched.map((t) => t.timestamp));
      }
    } else {
      setTrades((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        const freshRaw = incoming.filter((t) => !seen.has(t.id));
        if (freshRaw.length === 0) return prev;
        const fresh = enrich(freshRaw, true);
        const merged = [...fresh, ...prev];
        merged.sort((a, b) => b.timestamp - a.timestamp);

        const newestTs = Math.max(
          lastSeenTsRef.current ?? 0,
          ...fresh.map((t) => t.timestamp)
        );
        lastSeenTsRef.current = newestTs;

        return merged;
      });

      if (data.oldestBlock !== undefined) {
        oldestBlockRef.current = data.oldestBlock;
      }
      setHasMore(data.hasMore === true);

      // Clear the isNew flash after TTL
      const timeout = setTimeout(() => {
        setTrades((prev) =>
          prev.map((t) => (t.isNew ? { ...t, isNew: false } : t))
        );
      }, NEW_TRADE_TTL);

      return () => clearTimeout(timeout);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      setError((queryError as any)?.message || "Failed to load trades");
    } else {
      setError(null);
    }
  }, [isError, queryError]);

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

  const loading = isLoading && trades.length === 0;

  return { trades, loading, loadingMore, hasMore, loadMore, error };
}

