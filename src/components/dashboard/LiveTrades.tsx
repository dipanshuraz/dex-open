"use client";

import { useTradeStats } from "@/hooks/useLatestTxs";
import { formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  PanelRightClose,
  Zap,
  ArrowRightLeft,
} from "lucide-react";

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
    <div className="h-full flex flex-col bg-genius-indigo border-t border-l border-genius-blue overflow-hidden">
      {/* Top tabs + controls – mimic Genius trades header */}
      <div className="flex justify-between items-center gap-2 pl-3 pr-4 min-h-[45px] h-[45px] border-b border-genius-blue bg-genius-indigo">
        <div className="flex items-center gap-1">
          <button className="cursor-pointer transition-colors text-genius-cream bg-genius-blue rounded-sm px-2 py-0.5 text-sm">
            Trades
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Position
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Pools
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Holders
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Traders
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Orders
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            History
          </button>
          <button className="cursor-pointer transition-colors rounded-sm px-2 py-0.5 text-sm text-genius-cream/60 bg-transparent hover:bg-genius-blue hover:text-genius-cream">
            Exited
          </button>
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-linear-to-r from-genius-indigo to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-full bg-linear-to-l from-genius-indigo to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-3 overflow-x-auto px-3">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue gap-1.5 py-[3px] px-2 lg:text-xs">
              Trades Panel
              <PanelRightClose className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <div className="flex flex-row items-center gap-1.5">
              <div className="text-xs text-genius-cream cursor-pointer hover:text-genius-cream/80 transition-colors select-none whitespace-nowrap">
                BTC Only
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  role="switch"
                  aria-checked="false"
                  data-state="unchecked"
                  className="peer inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-genius-pink data-[state=unchecked]:bg-genius-blue h-4 w-[28px] rounded-[2px]"
                >
                  <span
                    data-state="unchecked"
                    className="pointer-events-none block bg-background shadow-lg ring-3 data-[state=checked]:ring-genius-blue data-[state=unchecked]:ring-genius-pink transition-transform data-[state=unchecked]:bg-genius-pink data-[state=checked]:bg-genius-blue data-[state=unchecked]:translate-x-0 h-3 w-3 rounded-[2px] data-[state=checked]:translate-x-[12px]"
                  />
                </button>
              </div>
            </div>

            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue gap-1.5 py-[3px] px-2 lg:text-xs">
              Filter
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 gap-1.5 lg:text-xs py-1 px-2 bg-genius-pink/20 text-genius-pink">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Instant Trade
            </button>
          </div>
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-3 text-genius-cream/60 text-xs font-mono">
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-genius-purple-dark/40 border-t-genius-pink rounded-full animate-spin" />
              <span>Fetching transaction data...</span>
            </>
          ) : (
            <span className="text-genius-red/70">Stream Interrupted</span>
          )}
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-genius-red/70 text-xs font-mono">
          Stream Interrupted
        </div>
      ) : (
        <div className="flex-1 w-full h-full flex flex-col font-mono text-xs">
          {/* Table header – Genius-style */}
          <div className="flex flex-row w-full px-5 py-1.5 bg-genius-blue/50">
            <div className="w-1/6 text-genius-cream/60 whitespace-nowrap text-xs">
              <div className="w-fit flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                Period
                <ArrowRightLeft className="w-3 h-3" aria-hidden="true" />
              </div>
            </div>
            <div className="w-1/6 text-genius-cream/60 whitespace-nowrap text-xs">
              <div>Buys</div>
            </div>
            <div className="w-1/6 text-genius-cream/60 whitespace-nowrap text-xs">
              <div>Sells</div>
            </div>
            <div className="w-1/6 text-genius-cream/60 whitespace-nowrap text-xs">
              <div>Buy %</div>
            </div>
            <div className="w-2/6 text-genius-cream/60 whitespace-nowrap text-xs text-right">
              <div>Volume (USD)</div>
            </div>
          </div>

          <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
            {(() => {
              const maxVolume =
                Math.max(
                  ...PERIODS.map(({ key }) => stats[key]?.volume ?? 0)
                ) || 1;

              return PERIODS.map(({ key, label }) => {
                const period = stats[key];
                const total = period.buys + period.sells;
                const buyPct = total > 0 ? (period.buys / total) * 100 : 50;
                const isBullish = buyPct >= 50;
                const volumeWidth = (period.volume / maxVolume) * 100;

                return (
                  <div
                    key={key}
                    className="relative flex flex-row w-full px-5 py-2.5 h-[38px] items-center transition-colors hover:bg-genius-blue cursor-pointer overflow-hidden border-b border-genius-blue/60 last:border-b-0"
                  >
                    {/* Period */}
                    <div className="w-1/6 flex flex-col relative z-10">
                      <div className="text-sm text-genius-cream/80 font-sans">
                        {label}
                      </div>
                    </div>

                    {/* Buys */}
                    <div className="w-1/6 flex flex-col relative z-10">
                      <div className="text-sm text-genius-green flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {period.buys.toLocaleString()}
                      </div>
                    </div>

                    {/* Sells */}
                    <div className="w-1/6 flex flex-col relative z-10">
                      <div className="text-sm text-genius-red flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {period.sells.toLocaleString()}
                      </div>
                    </div>

                    {/* Buy % */}
                    <div className="w-1/6 flex flex-col relative z-10">
                      <div
                        className={`text-sm ${
                          isBullish ? "text-genius-green" : "text-genius-red"
                        }`}
                      >
                        {buyPct.toFixed(0)}%
                      </div>
                    </div>

                    {/* Volume with gradient bar */}
                    <div className="w-2/6 flex flex-col relative z-10">
                      <div className="relative">
                        <div className="text-sm text-genius-cream">
                          ${formatNumber(period.volume)}
                        </div>
                        <div
                          className={`absolute -top-2.5 -bottom-2.5 left-0 bg-linear-to-r ${
                            isBullish
                              ? "from-genius-green/0 to-genius-green/30"
                              : "from-genius-red/0 to-genius-red/30"
                          } transition-all duration-500 ease-out`}
                          style={{ width: `${volumeWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Footer / live status */}
          <div className="px-5 py-2.5 bg-genius-blue/60 border-t border-genius-blue flex items-center justify-between text-[10px] font-sans text-genius-cream/70">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-genius-green animate-pulse" />
              Live • refreshes every{" "}
              {process.env.NEXT_PUBLIC_POLL_INTERVAL_SEC ?? 30}
              s
            </span>
            <span className="whitespace-nowrap">via DexScreener</span>
          </div>
        </div>
      )}
    </div>
  );
}
