"use client";

import { useTrades, Trade } from "@/hooks/useTrades";
import { formatNumber } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/decodeSwap";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Funnel, ArrowRightLeft } from "lucide-react";
import { TableEmptyState } from "./TableEmptyState";
import { useVirtualizer } from "@tanstack/react-virtual";

// ── Mobile breakpoint ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

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

function timeStr(ts: number) {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatMcap(value: number) {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(3)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(3)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(3)}K`;
  return `$${formatNumber(value)}`;
}

// ── Compact mobile row ──
function CompactTradeRow({
  trade,
  now,
  explorer,
}: {
  trade: Trade;
  now: number;
  explorer: string;
}) {
  const isBuy = trade.type === "BUY";
  const accent = isBuy ? "#26a69a" : "#ef5350";
  const bgFlash = trade.isNew
    ? isBuy
      ? "bg-[#26a69a]/10"
      : "bg-[#ef5350]/10"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/4 transition-colors duration-700 ${bgFlash}`}
    >
      {/* Left: type badge + total */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="shrink-0 text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded"
          style={{
            color: accent,
            background: `${accent}22`,
          }}
        >
          {trade.isNew && (
            <span
              className="inline-block w-1 h-1 rounded-full mr-1 animate-ping align-middle"
              style={{ background: accent }}
            />
          )}
          {trade.type}
          {trade.isWhale ? " 🐋" : ""}
        </span>
        <span className="text-[12px] font-semibold font-mono truncate" style={{ color: accent }}>
          ${formatNumber(trade.total)}
        </span>
      </div>

      {/* Right: price · age · tx link */}
      <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
        <span className="text-gray-400">${formatNumber(trade.price)}</span>
        <span className="text-gray-500">{ageStr(now, trade.timestamp)}</span>
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

// ── Desktop single row (6 cols: Age/Time, Type, Price/M.Cap, Amount, Total USD, Trader) ──
function TradeRow({
  trade,
  now,
  explorer,
  maxTotalUsd,
  onFilterByTrader,
  ageColumnMode,
  priceColumnMode,
  marketCap,
}: {
  trade: Trade;
  now: number;
  explorer: string;
  maxTotalUsd: number;
  onFilterByTrader: (address: string) => void;
  ageColumnMode: "age" | "time";
  priceColumnMode: "price" | "mcap";
  marketCap?: number;
}) {
  const isBuy = trade.type === "BUY";
  const typeColor = isBuy ? "text-genius-green" : "text-genius-red";
  const gradientPct =
    maxTotalUsd > 0 ? Math.min(100, (trade.total / maxTotalUsd) * 100) : 0;

  const flashBg = trade.isNew
    ? isBuy
      ? "bg-genius-green/15"
      : "bg-genius-red/15"
    : "bg-transparent";

  const firstColLabel =
    ageColumnMode === "age" ? ageStr(now, trade.timestamp) : timeStr(trade.timestamp);
  const thirdColLabel =
    priceColumnMode === "price"
      ? formatNumber(trade.price)
      : marketCap != null && marketCap > 0
        ? formatMcap(marketCap)
        : "—";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative flex flex-row w-full px-5 py-2.5 h-[38px] items-center transition-colors hover:bg-genius-blue cursor-pointer overflow-hidden ${
        trade.isNew ? flashBg : ""
      }`}
    >
      <div className="w-1/6 flex flex-col relative z-10">
        <div className="text-sm leading-5 font-medium text-genius-cream/80">{firstColLabel}</div>
      </div>
      <div className="w-1/6 flex flex-col relative z-10">
        <div className={`text-sm leading-5 font-medium ${typeColor}`}>
          {trade.isNew && (
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full animate-ping mr-1 ${
                isBuy ? "bg-genius-green" : "bg-genius-red"
              }`}
            />
          )}
          {trade.type === "BUY" ? "Buy" : "Sell"}
          {trade.isWhale && " 🐋"}
        </div>
      </div>
      <div className="w-1/6 flex flex-col relative z-10">
        <div className="text-sm leading-5 font-medium text-genius-cream">{thirdColLabel}</div>
      </div>
      <div className="w-1/6 flex flex-col relative z-10">
        <div className="text-sm leading-5 font-medium text-genius-cream">{formatNumber(trade.amount)}</div>
      </div>
      <div className="w-1/6 flex flex-col relative z-10">
        <div className="relative">
          <div className={`text-sm leading-5 font-medium ${typeColor}`}>${formatNumber(trade.total)}</div>
          <div
            className={`absolute -top-2.5 -bottom-2.5 left-0 transition-all duration-500 ease-out ${
              isBuy
                ? "bg-linear-to-r from-genius-green/0 to-genius-green/30"
                : "bg-linear-to-r from-genius-red/0 to-genius-red/30"
            }`}
            style={{ width: `${gradientPct}%` }}
          />
        </div>
      </div>
      <div className="w-1/6 text-right flex flex-col relative z-10 items-end">
        <div className="flex items-center gap-2">
          <a
            href={`${explorer}/address/${trade.trader}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm text-genius-cream hover:opacity-70 transition-opacity border-2 border-dotted border-genius-blue rounded-sm px-1"
            onClick={(e) => e.stopPropagation()}
          >
            {shortAddr(trade.trader)}
          </a>
          <a
            href={`${explorer}/address/${trade.trader}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-genius-cream/60 hover:text-genius-cream transition-colors cursor-pointer"
            aria-label="View on explorer"
          >
            <ExternalLink className="w-3 h-3" strokeWidth={2} />
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFilterByTrader(trade.trader);
            }}
            className="text-genius-cream/60 hover:text-genius-cream transition-colors cursor-pointer"
            aria-label="Filter by trader"
          >
            <Funnel className="w-3 h-3" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main table ──
export function TradesTable({
  chainId,
  tokenAddress,
  marketCap,
}: {
  chainId: string;
  tokenAddress: string;
  marketCap?: number;
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
  const [ageColumnMode, setAgeColumnMode] = useState<"age" | "time">("age");
  const [priceColumnMode, setPriceColumnMode] = useState<"price" | "mcap">("price");

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
    <div className="flex flex-col h-full min-h-0 font-sans bg-genius-indigo text-genius-cream">
      {/* Header row */}
      <div className="sticky top-0 z-10 w-full shrink-0 bg-genius-indigo border-b border-genius-blue">
        <div className="flex flex-row w-full px-5 py-2 text-sm leading-5 font-medium text-genius-cream/80">
          <button
            type="button"
            onClick={() => setAgeColumnMode((m) => (m === "age" ? "time" : "age"))}
            className="w-1/6 flex items-center gap-1.5 hover:text-genius-cream transition-colors text-left"
          >
            {ageColumnMode === "age" ? "Age" : "Time"}
            <ArrowRightLeft className="w-3 h-3 shrink-0" strokeWidth={2} />
          </button>
          <div className="w-1/6">Type</div>
          <button
            type="button"
            onClick={() => setPriceColumnMode((m) => (m === "price" ? "mcap" : "price"))}
            className="w-1/6 flex items-center gap-1.5 hover:text-genius-cream transition-colors text-left"
          >
            {priceColumnMode === "price" ? "Price" : "M.Cap"}
            <ArrowRightLeft className="w-3 h-3 shrink-0" strokeWidth={2} />
          </button>
          <div className="w-1/6">Amount</div>
          <div className="w-1/6">Total USD</div>
          <div className="w-1/6 text-right">Trader</div>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Error banner */}
        {error && !loading && (
          <div className="absolute top-2 left-3 right-3 z-10 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 font-sans flex items-start gap-2 pointer-events-none">
            <span className="mt-px text-[12px]">!</span>
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
          <TableEmptyState />
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
                  onFilterByTrader={(address) => setSearch(address)}
                  ageColumnMode={ageColumnMode}
                  priceColumnMode={priceColumnMode}
                  marketCap={marketCap}
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
              <TableEmptyState />
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
  onFilterByTrader,
  ageColumnMode,
  priceColumnMode,
  marketCap,
}: {
  trades: Trade[];
  now: number;
  explorer: string;
  scrollElement: HTMLDivElement | null;
  onFilterByTrader: (address: string) => void;
  ageColumnMode: "age" | "time";
  priceColumnMode: "price" | "mcap";
  marketCap?: number;
}) {
  const maxTotalUsd = useMemo(() => {
    if (trades.length === 0) return 0;
    return Math.max(...trades.map((t) => t.total));
  }, [trades]);

  const rowVirtualizer = useVirtualizer({
    count: trades.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 38,
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
              left: 0,
              top: virtualRow.start,
              height: 38,
              width: "100%",
            }}
          >
            <TradeRow
              trade={trade}
              now={now}
              explorer={explorer}
              maxTotalUsd={maxTotalUsd}
              onFilterByTrader={onFilterByTrader}
              ageColumnMode={ageColumnMode}
              priceColumnMode={priceColumnMode}
              marketCap={marketCap}
            />
          </div>
        );
      })}
    </div>
  );
}
