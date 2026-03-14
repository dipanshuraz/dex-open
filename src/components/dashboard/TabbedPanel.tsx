"use client";

import { useState } from "react";
import { TradesTable } from "./TradesTable";
import { HoldersTable } from "./HoldersTable";
import { PoolsTable } from "./PoolsTable";
import { TableEmptyState } from "./TableEmptyState";
import { PanelRightClose, Zap, ListFilter, ArrowUpDown, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/Switch";

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
  const [panelVisible, setPanelVisible] = useState(true);

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
      {/* Tab bar + action bar: single row, justify-between, 45px height */}
      <div className="flex justify-between items-center gap-2 pl-3 min-h-[45px] h-[45px] shrink-0 border-b border-genius-blue/80 bg-genius-indigo">
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm whitespace-nowrap shrink-0 ${
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

        <div className="relative overflow-hidden flex-1 min-w-0 flex justify-end">
          <div className="absolute top-0 left-0 w-3 h-full bg-linear-to-r from-genius-indigo to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-full bg-linear-to-l from-genius-indigo to-transparent z-10 pointer-events-none" />
          <div className="flex items-center gap-3 overflow-x-auto px-3 scrollbar-hide py-1">
            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue gap-1.5 py-[3px] px-2 lg:text-xs text-genius-cream"
              onClick={() => setPanelVisible((v) => !v)}
            >
              Trades Panel
              <PanelRightClose className="w-3.5 h-3.5" aria-hidden />
            </button>

            <div className="flex flex-row items-center gap-1.5">
              <span className="text-xs text-genius-cream cursor-pointer hover:text-genius-cream/80 transition-colors select-none whitespace-nowrap">
                BTC Only
              </span>
              <Switch
                checked={btcOnly}
                onCheckedChange={setBtcOnly}
                aria-label="Toggle degen"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue gap-1.5 py-[3px] px-2 lg:text-xs text-genius-cream"
            >
              Filter
              <ListFilter className="w-3.5 h-3.5" aria-hidden />
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 gap-1.5 py-1 px-2 lg:text-xs bg-genius-pink/20 text-genius-pink"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden />
              Instant Trade
            </button>
          </div>
        </div>
      </div>

      {/* Table headers for empty-state tabs (Position, Traders, Orders, History, Exited) – same design as TradesTable */}
      {showEmptyState && (
        <header className="sticky top-0 z-10 w-full shrink-0">
          <div className="grid grid-cols-[1fr_1fr_0.8fr_1fr_0.8fr_1fr_1fr_auto] w-full px-5 py-1.5 bg-genius-blue/50 items-center gap-2">
            {POSITION_HEADERS.map((h) => (
              <div
                key={h.label}
                className={`text-genius-cream/60 whitespace-nowrap text-xs flex items-center gap-1 ${h.sortable ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}`}
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
        </header>
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
