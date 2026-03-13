"use client";

import { useState } from "react";
import { TradesTable } from "./TradesTable";
import { HoldersTable } from "./HoldersTable";
import { PoolsTable } from "./PoolsTable";
import { TableEmptyState } from "./TableEmptyState";
import { PanelRightClose, Zap, ArrowUpDown, ChevronDown, EyeOff, RefreshCcw } from "lucide-react";

type Tab =
  | "trades"
  | "position"
  | "pools"
  | "holders"
  | "traders"
  | "orders"
  | "history"
  | "exited";

const TABS: { key: Tab; label: string }[] = [
  { key: "trades", label: "Trades" },
  { key: "position", label: "Position" },
  { key: "pools", label: "Pools" },
  { key: "holders", label: "Holders" },
  { key: "traders", label: "Traders" },
  { key: "orders", label: "Orders" },
  { key: "history", label: "History" },
  { key: "exited", label: "Exited" },
];

/** Headers for tabs that show empty state (Position, Traders, Orders, History, Exited) */
const POSITION_HEADERS = [
  { label: "Ticker", sortable: true },
  { label: "Balance", sortable: true },
  { label: "Cost" },
  { label: "Avg. Price" },
  { label: "Mark", sortable: true },
  { label: "Unrealized PNL" },
  { label: "Realized PNL" },
];

export function TabbedPanel({
  chainId,
  tokenAddress,
  pairAddress,
  marketCap,
}: {
  chainId: string;
  tokenAddress: string;
  pairAddress: string;
  marketCap?: number;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("trades");
  const [btcOnly, setBtcOnly] = useState(false);
  const [smallTradesOnly, setSmallTradesOnly] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isUsdAscending, setIsUsdAscending] = useState(true);

  const showTrades = activeTab === "trades";
  const showPools = activeTab === "pools";
  const showHolders = activeTab === "holders";
  const showEmptyState =
    activeTab === "position" ||
    activeTab === "traders" ||
    activeTab === "orders" ||
    activeTab === "history" ||
    activeTab === "exited";

  return (
    <div className="h-full flex flex-col bg-genius-indigo border-t border-r border-genius-blue">
      {/* Tabs + right controls row */}
      <div className="flex justify-between items-center gap-2 pl-3 min-h-[45px] h-[45px] shrink-0">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm whitespace-nowrap ${
                  isActive
                    ? "text-genius-cream bg-genius-blue"
                    : "text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-3 h-full bg-linear-to-r from-genius-indigo to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-full bg-linear-to-l from-genius-indigo to-transparent z-10 pointer-events-none" />
          <div className="flex items-center gap-3 overflow-x-auto px-3">
            {/* Trades Panel button (visual only) */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-sm border border-genius-blue text-xs bg-transparent hover:brightness-110 transition-all text-genius-cream/80"
              onClick={() => setPanelVisible((v) => !v)}
            >
              Trades Panel
              <PanelRightClose className="w-3.5 h-3.5" aria-hidden />
            </button>

            {/* Eye off toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center px-2 py-[4px] rounded-sm border border-genius-blue text-xs bg-transparent hover:brightness-110 transition-all text-genius-cream/80"
              aria-pressed={!panelVisible}
              onClick={() => setPanelVisible((v) => !v)}
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden />
            </button>

            {/* USD button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-sm border border-genius-blue text-xs bg-transparent hover:brightness-110 transition-all text-genius-cream/80"
              onClick={() => setIsUsdAscending((v) => !v)}
            >
              USD
              <ArrowUpDown className="w-3.5 h-3.5" aria-hidden />
            </button>

            {/* < $1 toggle */}
            <div className="flex flex-row items-center gap-1.5">
              <span className="text-xs text-genius-cream cursor-pointer hover:text-genius-cream/80 transition-colors select-none whitespace-nowrap">
                &lt;$1
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={smallTradesOnly}
                aria-label="Only trades below $1"
                data-state={smallTradesOnly ? "checked" : "unchecked"}
                onClick={() => setSmallTradesOnly((v) => !v)}
                className={`inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors h-4 w-7 rounded-[2px] ${
                  smallTradesOnly ? "bg-genius-pink" : "bg-genius-blue"
                }`}
              >
                <span
                  className={`pointer-events-none block shadow-lg h-3 w-3 rounded-[2px] transition-transform ${
                    smallTradesOnly ? "translate-x-[12px] bg-genius-blue" : "translate-x-0 bg-genius-pink"
                  }`}
                />
              </button>
            </div>

            {/* BTC Only toggle */}
            <div className="flex flex-row items-center gap-1.5">
              <span className="text-xs text-genius-cream cursor-pointer hover:text-genius-cream/80 transition-colors select-none whitespace-nowrap">
                BTC Only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={btcOnly}
                aria-label="BTC Only filter"
                data-state={btcOnly ? "checked" : "unchecked"}
                onClick={() => setBtcOnly((v) => !v)}
                className={`inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors h-4 w-7 rounded-[2px] ${
                  btcOnly ? "bg-genius-pink" : "bg-genius-blue"
                }`}
              >
                <span
                  className={`pointer-events-none block shadow-lg h-3 w-3 rounded-[2px] transition-transform ${
                    btcOnly ? "translate-x-[12px] bg-genius-blue" : "translate-x-0 bg-genius-pink"
                  }`}
                />
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              className="inline-flex items-center justify-center px-2 py-[4px] rounded-sm border border-genius-blue text-xs bg-transparent hover:brightness-110 transition-all text-genius-cream/80"
              aria-label="Refresh"
            >
              <RefreshCcw className="w-3.5 h-3.5" aria-hidden />
            </button>

            {/* Instant Trade */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 lg:text-xs py-1 px-2 bg-genius-pink/20 text-genius-pink rounded-sm"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Instant Trade
            </button>
          </div>
        </div>
      </div>

      {/* Table headers for empty-state tabs (Position, Traders, Orders, History, Exited) */}
      {showEmptyState && (
        <div className="grid grid-cols-[1fr_1fr_0.8fr_1fr_0.8fr_1fr_1fr_auto] items-center gap-2 px-4 py-2.5 bg-genius-indigo border-b border-genius-blue text-sm font-medium text-genius-cream/80 shrink-0">
          {POSITION_HEADERS.map((h) => (
            <div
              key={h.label}
              className={`flex items-center gap-1 ${h.sortable ? "cursor-pointer hover:text-genius-cream transition-colors" : ""}`}
            >
              {h.label}
              {h.sortable && <ArrowUpDown className="w-3 h-3 shrink-0" aria-hidden />}
            </div>
          ))}
          <button
            type="button"
            className="p-0.5 text-genius-cream/50 hover:text-genius-cream transition-colors"
            aria-label="Column settings"
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden />
          </button>
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        {showTrades && (
          <TradesTable chainId={chainId} tokenAddress={tokenAddress} marketCap={marketCap} />
        )}
        {showHolders && (
          <HoldersTable chainId={chainId} tokenAddress={tokenAddress} />
        )}
        {showPools && (
          <PoolsTable chainId={chainId} tokenAddress={tokenAddress} />
        )}
        {showEmptyState && <TableEmptyState />}
      </div>
    </div>
  );
}
