"use client";

import { useMemo, useEffect, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatNumber } from "@/lib/utils";
import { Activity } from "lucide-react";

interface TransactionsPanelProps {
  chainId: string;
  pairAddress: string;
}

export function TransactionsPanel({ chainId, pairAddress }: TransactionsPanelProps) {
  const { data, deltas, loading, error } = useTransactions(chainId, pairAddress);
  const [flashKeys, setFlashKeys] = useState<Record<string, boolean>>({});

  // Trigger short-lived flash flags whenever a delta is true
  useEffect(() => {
    const toFlash: string[] = [];
    if (deltas.buys5mIncreased) toFlash.push("buys5m");
    if (deltas.sells5mIncreased) toFlash.push("sells5m");
    if (deltas.buys1hIncreased) toFlash.push("buys1h");
    if (deltas.sells1hIncreased) toFlash.push("sells1h");
    if (deltas.priceChanged) toFlash.push("priceUsd");
    if (deltas.volumeChanged) toFlash.push("volume");

    if (toFlash.length === 0) return;

    setFlashKeys((prev) => {
      const next = { ...prev };
      toFlash.forEach((k) => {
        next[k] = true;
      });
      return next;
    });

    const timeout = setTimeout(() => {
      setFlashKeys((prev) => {
        const next = { ...prev };
        toFlash.forEach((k) => {
          next[k] = false;
        });
        return next;
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [deltas]);

  const buyPressurePct = useMemo(() => {
    if (!data) return 50;
    const total = data.buys5m + data.sells5m;
    if (total === 0) return 50;
    return (data.buys5m / total) * 100;
  }, [data]);

  const lastUpdatedText = useMemo(() => {
    if (!data?.lastUpdated) return "—";
    const deltaSec = Math.floor((Date.now() - data.lastUpdated) / 1000);
    if (deltaSec < 5) return "Just now";
    if (deltaSec < 60) return `${deltaSec}s ago`;
    const minutes = Math.floor(deltaSec / 60);
    return `${minutes}m ago`;
  }, [data?.lastUpdated]);

  const cardBase =
    "rounded-xl border border-white/5 bg-gradient-to-b from-[#11121A] to-[#060612] text-xs text-gray-300 p-4 flex flex-col gap-3 shadow-[0_0_40px_rgba(88,28,135,0.25)]";

  return (
    <div className={cardBase}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400">
            Transactions Activity
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>Live • 5s</span>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-gray-500">
          <div className="w-4 h-4 mr-2 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          Fetching transactions…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-red-400">
          {error}
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-gray-500">
          No data
        </div>
      ) : (
        <>
          {/* Top row: Price & Volume */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-lg px-3 py-2 bg-white/[0.02] border border-white/5 transition-all duration-300 ${
                flashKeys.priceUsd ? "bg-emerald-500/10 scale-[1.02]" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                Price (USD)
              </div>
              <div className="text-[15px] font-semibold text-white">
                ${formatNumber(data.priceUsd)}
              </div>
            </div>

            <div
              className={`rounded-lg px-3 py-2 bg-white/[0.02] border border-white/5 transition-all duration-300 ${
                flashKeys.volume ? "bg-sky-500/10 scale-[1.02]" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">
                Volume 24h
              </div>
              <div className="text-[15px] font-semibold text-sky-300">
                ${formatNumber(data.volume)}
              </div>
            </div>
          </div>

          {/* Middle row: 5m activity */}
          <div className="rounded-lg px-3 py-2 bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                5m Activity
              </div>
              <div className="text-[10px] text-gray-500">Buy vs Sell pressure</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div
                className={`flex flex-col gap-0.5 rounded-md px-2 py-1 transition-all duration-300 ${
                  flashKeys.buys5m ? "bg-emerald-500/10 scale-[1.03]" : "bg-emerald-500/5"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                  Buys 5m
                </span>
                <span className="text-[14px] font-semibold text-emerald-300">
                  +{formatNumber(data.buys5m)}
                </span>
              </div>

              <div
                className={`flex flex-col gap-0.5 rounded-md px-2 py-1 transition-all duration-300 ${
                  flashKeys.sells5m ? "bg-red-500/10 scale-[1.03]" : "bg-red-500/5"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-red-300">
                  Sells 5m
                </span>
                <span className="text-[14px] font-semibold text-red-300">
                  -{formatNumber(data.sells5m)}
                </span>
              </div>
            </div>

            {/* Buy vs Sell progress bar */}
            <div className="mt-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span>Buy pressure</span>
                <span className="text-emerald-300 font-semibold">
                  {buyPressurePct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-red-500/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${buyPressurePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom row: 1h stats & meta */}
          <div className="grid grid-cols-2 gap-3 items-stretch">
            <div className="rounded-lg px-3 py-2 bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                1h Buys
              </div>
              <div
                className={`text-[14px] font-semibold text-emerald-300 transition-all duration-300 ${
                  flashKeys.buys1h ? "scale-[1.05]" : ""
                }`}
              >
                +{formatNumber(data.buys1h)}
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mt-1">
                1h Sells
              </div>
              <div
                className={`text-[14px] font-semibold text-red-300 transition-all duration-300 ${
                  flashKeys.sells1h ? "scale-[1.05]" : ""
                }`}
              >
                -{formatNumber(data.sells1h)}
              </div>
            </div>

            <div className="rounded-lg px-3 py-2 bg-white/[0.01] border border-dashed border-white/10 flex flex-col justify-between text-[10px] text-gray-500">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Last update</span>
                  <span className="text-gray-300 font-mono">{lastUpdatedText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pair</span>
                  <span className="text-gray-300 font-mono truncate max-w-[140px]">
                    {pairAddress.slice(0, 6)}...{pairAddress.slice(-4)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-gray-600">
                <span className="h-[3px] w-[3px] rounded-full bg-purple-400" />
                <span>Data via Dexscreener</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

