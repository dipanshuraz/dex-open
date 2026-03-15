"use client";

import { useTrades } from "@/hooks/useTrades";
import type { Trade } from "@/types";
import { useNow } from "@/hooks/useNow";
import { formatNumber } from "@/lib/utils";
import { getExplorerUrl } from "@/lib/decodeSwap";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Loader2, Funnel, ArrowRightLeft } from "lucide-react";
import { TableEmptyState } from "./TableEmptyState";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

const TRADES_COLUMNS = [
  { key: "time", label: "Time", sortable: true, align: "left" as const },
  { key: "type", label: "Type", sortable: false, align: "left" as const },
  { key: "price", label: "Price", sortable: true, align: "left" as const },
  { key: "amount", label: "Amount", sortable: false, align: "left" as const },
  { key: "totalUsd", label: "Total USD", sortable: true, align: "left" as const },
  { key: "trader", label: "Trader", sortable: false, align: "right" as const },
] as const;

function shortAddr(a: string) {
  if (!a || a.length < 10) return a || "—";
  return `${a.slice(0, 3)}...${a.slice(-3)}`;
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

function TradesTableHeader({
  ageColumnMode,
  priceColumnMode,
  onAgeColumnModeToggle,
  onPriceColumnModeToggle,
}: {
  ageColumnMode: "age" | "time";
  priceColumnMode: "price" | "mcap";
  onAgeColumnModeToggle: () => void;
  onPriceColumnModeToggle: () => void;
}) {
  const TOGGLE_LABEL_BTN = "w-fit flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity";

  const renderLabel = (col: (typeof TRADES_COLUMNS)[number]) => {
    if (col.key === "time") {
      return (
        <button type="button" onClick={onAgeColumnModeToggle} className={TOGGLE_LABEL_BTN}>
          {ageColumnMode === "age" ? "Age" : "Time"}
          <ArrowRightLeft className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      );
    }
    if (col.key === "price") {
      return (
        <button type="button" onClick={onPriceColumnModeToggle} className={TOGGLE_LABEL_BTN}>
          {priceColumnMode === "price" ? "Price" : "M.Cap"}
          <ArrowRightLeft className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      );
    }
    if (col.key === "totalUsd") {
      return (
        <div className={TOGGLE_LABEL_BTN}>
          Total USD
          <ArrowRightLeft className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden />
        </div>
      );
    }
    return col.label;
  };

  return (
    <div className="grid grid-cols-6 w-full px-5 py-1.5 bg-genius-blue/50 items-center gap-2">
      {TRADES_COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`text-genius-cream/60 whitespace-nowrap text-xs ${
            col.align === "right" ? "text-right" : ""
          }`}
        >
          {renderLabel(col)}
        </div>
      ))}
    </div>
  );
}

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

  const flashBg = trade.isNew ? (isBuy ? "bg-genius-green/15" : "bg-genius-red/15") : null;

  const timeLabel =
    ageColumnMode === "age" ? ageStr(now, trade.timestamp) : timeStr(trade.timestamp);
  const priceLabel =
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
      className={cn(
        "relative grid grid-cols-6 w-full px-5 py-2.5 h-[38px] items-center transition-colors hover:bg-genius-blue cursor-pointer overflow-hidden",
        flashBg
      )}
    >
      <div className="min-w-0 flex flex-col relative z-10">
        <span className="text-sm text-genius-cream/80 truncate">{timeLabel}</span>
      </div>
      <div className="min-w-0 flex flex-col relative z-10">
        <span className={cn("text-sm", typeColor)}>
          {trade.isNew && (
            <span
              className={cn(
                "inline-block w-1.5 h-1.5 rounded-full animate-ping mr-1",
                isBuy ? "bg-genius-green" : "bg-genius-red"
              )}
            />
          )}
          {trade.type === "BUY" ? "Buy" : "Sell"}
        </span>
      </div>
      <div className="min-w-0 flex flex-col relative z-10">
        <span className="text-sm text-genius-cream truncate">{priceLabel}</span>
      </div>
      <div className="min-w-0 flex flex-col relative z-10">
        <span className="text-sm text-genius-cream truncate">{formatNumber(trade.amount)}</span>
      </div>
      <div className="min-w-0 relative w-full self-stretch">
        <div className="absolute inset-0 flex items-center">
          <div
            className="absolute inset-y-0 left-0 z-0 transition-[width] duration-500 ease-out"
            style={{
              width: `${gradientPct}%`,
              backgroundImage: isBuy
                ? "linear-gradient(to right, hsl(var(--genius-green) / 0), hsl(var(--genius-green) / 0.3))"
                : "linear-gradient(to right, hsl(var(--genius-red) / 0), hsl(var(--genius-red) / 0.3))",
            }}
          />
          <span className={cn("text-sm relative z-10", typeColor)}>${formatNumber(trade.total)}</span>
        </div>
      </div>
      <div className="flex flex-col relative z-10 items-end justify-center">
        <div className="flex items-center gap-2">
          <a
            href={`${explorer}/address/${trade.trader}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm text-genius-cream hover:opacity-70 transition-opacity border-2 border-dotted border-genius-blue rounded-sm px-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {shortAddr(trade.trader)}
          </a>
          <a
            href={`${explorer}/address/${trade.trader}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-genius-cream/60 hover:text-genius-cream transition-colors cursor-pointer shrink-0"
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
            className="text-genius-cream/60 hover:text-genius-cream transition-colors cursor-pointer shrink-0"
            aria-label="Filter by trader"
          >
            <Funnel className="w-3 h-3" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

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
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const setScrollRef = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el;
    setScrollEl(el);
  }, []);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ageColumnMode, setAgeColumnMode] = useState<"age" | "time">("age");
  const [priceColumnMode, setPriceColumnMode] = useState<"price" | "mcap">("price");

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
    <div className="flex flex-col h-full min-h-0 w-full font-sans bg-genius-indigo text-genius-cream">
      <div className="sticky top-0 z-10 w-full shrink-0">
        <TradesTableHeader
          ageColumnMode={ageColumnMode}
          priceColumnMode={priceColumnMode}
          onAgeColumnModeToggle={() => setAgeColumnMode((m) => (m === "age" ? "time" : "age"))}
          onPriceColumnModeToggle={() => setPriceColumnMode((m) => (m === "price" ? "mcap" : "price"))}
        />
      </div>

      <div ref={setScrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
        {error && !loading && (
          <div className="absolute top-2 left-3 right-3 z-10 rounded-md border border-genius-red/40 bg-genius-red/10 px-3 py-2 text-[11px] text-genius-cream font-sans flex items-start gap-2 pointer-events-none">
            <span className="mt-px text-[12px]">!</span>
            <span>
              Trades are not currently available for this token on {chainId}. This pool may not be
              supported yet, or the on-chain data provider is unreachable.
            </span>
          </div>
        )}

        {loading && trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-genius-cream/60 text-xs min-h-full">
            <div className="w-5 h-5 border-2 border-genius-purple/50 border-t-genius-purple-light rounded-full animate-spin" />
            Connecting to blockchain…
          </div>
        ) : !error && !hasTrades ? (
          <TableEmptyState />
        ) : (
          <div className="flex flex-col pb-6">
            {hasVisibleTrades ? (
              <>
                <VirtualizedTrades
                  trades={visibleTrades}
                  now={now}
                  explorer={explorer}
                  scrollElement={scrollEl}
                  onFilterByTrader={(address) => setSearch(address)}
                  ageColumnMode={ageColumnMode}
                  priceColumnMode={priceColumnMode}
                  marketCap={marketCap}
                />

                {loadingMore && (
                  <div className="flex items-center justify-center gap-2 py-4 text-[11px] text-genius-cream/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-genius-purple-light" />
                    Loading older trades…
                  </div>
                )}
                {!hasMore && trades.length > 0 && (
                  <div className="flex items-center justify-center py-3 text-[10px] text-genius-cream/50 select-none">
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

  /* eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns unstable callbacks */
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
