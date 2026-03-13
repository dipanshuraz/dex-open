"use client";

import { useTrades, Trade } from "@/hooks/useTrades";
import { formatNumber } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/decodeSwap";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

// ── Live clock ──
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ── Helpers ──
function shortAddr(a: string) {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function ageStr(now: number, ts: number) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

// ── Single row ──
function TradeRow({
  trade,
  now,
  explorer,
}: {
  trade: Trade;
  now: number;
  explorer: string;
}) {
  const isBuy = trade.type === "BUY";
  const color = isBuy ? "text-[#26a69a]" : "text-[#ef5350]";

  // Flash overlay color for new trades
  const flashBg = trade.isNew
    ? isBuy
      ? "bg-[#26a69a]/15"
      : "bg-[#ef5350]/15"
    : "bg-transparent";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`grid grid-cols-7 items-center px-4 py-[5px] transition-colors duration-700 border-b border-black/[0.05] dark:border-white/[0.03] text-[11px] font-mono group w-full ${
        trade.isNew
          ? `${flashBg} hover:brightness-110`
          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
      }`}
    >
      <div className="text-gray-500 truncate">{ageStr(now, trade.timestamp)}</div>
      <div className={`uppercase font-bold tracking-wider ${color} flex items-center gap-1.5`}>
        {/* Flashing dot for new trades */}
        {trade.isNew && (
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full animate-ping ${
              isBuy ? "bg-[#26a69a]" : "bg-[#ef5350]"
            }`}
          />
        )}
        {trade.type}
        {trade.isWhale && (
          <span className="icon-whale-trade" title="Whale trade">
            🐋
          </span>
        )}
      </div>
      <div className={`${color} truncate`}>${formatNumber(trade.price)}</div>
      <div className={`font-semibold truncate ${color}`}>${formatNumber(trade.total)}</div>
      <div className={`truncate ${color}`}>{formatNumber(trade.amount)}</div>
      <div className="truncate text-gray-400">
        <a
          href={`${explorer}/address/${trade.trader}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {shortAddr(trade.trader)}
        </a>
      </div>
      <div className="flex items-center justify-center">
        <a
          href={`${explorer}/tx/${trade.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-purple-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}

// ── Main table ──
export function TradesTable({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
}) {
  const { trades, loading, loadingMore, hasMore, loadMore, error } = useTrades(
    chainId,
    tokenAddress
  );
  const now = useNow();
  const explorer = getExplorerUrl(chainId);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Infinite scroll: trigger loadMore when near bottom ──
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingMore || !hasMore) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
    if (nearBottom) loadMore();
  }, [loadMore, loadingMore, hasMore]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const filteredTrades = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return trades;
    return trades.filter((t) => {
      const fields: (string | number | null | undefined)[] = [
        t.type,
        t.trader,
        t.txHash,
        t.price,
        t.total,
        t.amount,
      ];
      return fields.some((value) => {
        if (value === null || value === undefined) return false;
        const s = String(value).toLowerCase();
        return s.includes(q);
      });
    });
  }, [trades, debouncedSearch]);

  const hasTrades = trades.length > 0;
  const visibleTrades = filteredTrades;
  const hasVisibleTrades = visibleTrades.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0 font-sans">
      {/* Header row + search */}
      <div className="sticky top-0 z-10 w-full shrink-0 bg-gray-100/95 dark:bg-[#0f1017]/95 backdrop-blur border-b border-black/10 dark:border-[#221A30]">
        <div className="grid grid-cols-7 items-center px-4 py-2 text-[10px] uppercase font-extrabold text-[#8C82A2] tracking-widest">
          <div>Age</div>
          <div>Type</div>
          <div>Price</div>
          <div>Total</div>
          <div>Amount</div>
          <div>Trader</div>
          <div className="text-center">Tx</div>
        </div>
        <div className="px-3 pb-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by trader, tx hash, type, or value…"
            className="w-full rounded-md bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.06] px-3 py-1.5 text-[11px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/70 focus:border-purple-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Error banner */}
        {error && !loading && (
          <div className="absolute top-2 left-3 right-3 z-10 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 font-sans flex items-start gap-2 pointer-events-none">
            <span className="mt-[1px] text-[12px]">!</span>
            <span>
              Trades are not currently available for this token on {chainId}. This pool may not be
              supported yet, or the on-chain data provider is unreachable.
            </span>
          </div>
        )}

        {loading && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500 text-xs min-h-full">
            <div className="w-5 h-5 border-2 border-purple-500/50 border-t-purple-400 rounded-full animate-spin" />
            Connecting to blockchain…
          </div>
        ) : !error && !hasTrades ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs text-center px-6">
            <span>No recent trades found for this token.</span>
            <span className="text-[10px] text-gray-600">
              This pool may be inactive or not yet supported. Try another token or chain.
            </span>
          </div>
        ) : (
          <div className="flex flex-col pb-6">
            {hasVisibleTrades ? (
              <>
                {/* Virtualized rows */}
                <VirtualizedTrades
                  trades={visibleTrades}
                  now={now}
                  explorer={explorer}
                  scrollElement={scrollRef.current}
                />

                {/* Load more indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-4 text-[11px] text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    Loading older trades…
                  </div>
                )}
                {!hasMore && trades.length > 0 && (
                  <div className="flex items-center justify-center py-3 text-[10px] text-gray-600 select-none">
                    — No more trades —
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 text-xs text-center px-6">
                <span>No trades match your search.</span>
                <span className="text-[10px] text-gray-600">
                  Try a different address, tx hash, type (BUY/SELL), or value.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VirtualizedTrades({
  trades,
  now,
  explorer,
  scrollElement,
}: {
  trades: Trade[];
  now: number;
  explorer: string;
  scrollElement: HTMLDivElement | null;
}) {
  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 32,
    overscan: 10,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: rowVirtualizer.getTotalSize(),
        position: "relative",
        width: "100%",
      }}
    >
      {virtualItems.map((virtualRow) => {
        const trade = trades[virtualRow.index];
        if (!trade) return null;

        return (
          <div
            key={trade.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <TradeRow trade={trade} now={now} explorer={explorer} />
          </div>
        );
      })}
    </div>
  );
}
