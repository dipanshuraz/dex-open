"use client";

import { useTradeStats } from "@/hooks/useLatestTxs";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, Filter } from "lucide-react";

interface LiveTradesProps {
  chainId: string;
  pairAddress: string;
}

const PERIODS = [
  { key: "m5" as const, label: "5M" },
  { key: "h1" as const, label: "1H" },
  { key: "h6" as const, label: "6H" },
  { key: "h24" as const, label: "24H" },
];

export function LiveTrades({ chainId, pairAddress }: LiveTradesProps) {
  const { stats, loading, error } = useTradeStats(chainId, pairAddress);

  return (
    <div className="bg-[#11121A] flex flex-col h-full rounded-tl-xl border-t border-l border-white/5 overflow-hidden">
      {/* Tabs / Header row */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#171821] border-b border-white/5 text-xs font-sans">
        <div className="flex items-center gap-4 text-gray-400 font-medium">
          <button className="text-white border-b-2 border-purple-500 pb-2 -mb-2 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Transactions
          </button>
          <button className="hover:text-white transition-colors pb-2 -mb-2">Position</button>
          <button className="hover:text-white transition-colors pb-2 -mb-2">Pools</button>
          <button className="hover:text-white transition-colors pb-2 -mb-2">Holders</button>
          <button className="hover:text-white transition-colors pb-2 -mb-2">Traders</button>
          <button className="hover:text-white transition-colors pb-2 -mb-2">Orders</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 flex items-center gap-2">
            Transactions Panel <button className="w-8 h-4 bg-purple-500 rounded-full flex items-center px-0.5"><div className="w-3 h-3 bg-white rounded-full translate-x-4"></div></button>
          </span>
          <button className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-gray-300">
             <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 text-[10px] uppercase font-sans text-gray-500 border-b border-white/5 bg-[#171821]/50">
        <div>Period</div>
        <div className="text-center text-green-500">Buys</div>
        <div className="text-center text-red-500">Sells</div>
        <div className="text-center">Buy %</div>
        <div className="text-right">Volume</div>
      </div>

      {loading || !stats ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-3 text-gray-500 text-xs font-mono">
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <span>Fetching transaction data...</span>
            </>
          ) : (
            <span className="text-red-500/50">Stream Interrupted</span>
          )}
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500/50 text-xs font-mono">Stream Interrupted</div>
      ) : (
        <div className="flex-1 overflow-y-auto text-xs font-mono scrollbar-hide flex flex-col">
          {PERIODS.map(({ key, label }) => {
            const period = stats[key];
            const total = period.buys + period.sells;
            const buyPct = total > 0 ? (period.buys / total) * 100 : 50;
            const isBullish = buyPct >= 50;

            return (
              <div
                key={key}
                className="grid grid-cols-5 gap-2 px-4 py-3 hover:bg-white/5 transition-colors items-center border-b border-white/5 last:border-0 group"
              >
                {/* Period */}
                <div className="text-gray-300 font-bold font-sans">{label}</div>

                {/* Buys */}
                <div className="text-center flex items-center justify-center gap-1 text-green-400 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {period.buys.toLocaleString()}
                </div>

                {/* Sells */}
                <div className="text-center flex items-center justify-center gap-1 text-red-400 font-medium">
                  <TrendingDown className="w-3 h-3" />
                  {period.sells.toLocaleString()}
                </div>

                {/* Buy % bar */}
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-bold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
                    {buyPct.toFixed(0)}%
                  </span>
                  <div className="w-full h-1.5 bg-red-500/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${buyPct}%` }}
                    />
                  </div>
                </div>

                {/* Volume */}
                <div className="text-right text-gray-300 font-sans">
                  ${formatNumber(period.volume)}
                </div>
              </div>
            );
          })}

          {/* Summary row */}
          <div className="mt-auto px-4 py-3 bg-[#171821]/80 border-t border-white/5 flex items-center justify-between text-[10px] font-sans text-gray-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live • refreshes every {process.env.NEXT_PUBLIC_POLL_INTERVAL_SEC ?? 30}s
            </span>
              <span>via DexScreener</span>
          </div>
        </div>
      )}
    </div>
  );
}
