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

  return (
    <div className="rounded-xl border border-genius-blue/30 bg-card-gradient text-xs text-genius-cream p-4 flex flex-col gap-3 shadow-card">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-genius-purple-light" />
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-genius-cream/70">
            Transactions Activity
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-genius-cream/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-genius-green opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-genius-green" />
          </span>
          <span>Live • 5s</span>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-genius-cream/60">
          <div className="w-4 h-4 mr-2 border-2 border-genius-purple/30 border-t-genius-purple rounded-full animate-spin" />
          Fetching transactions…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-genius-red">
          {error}
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-6 text-[11px] text-genius-cream/60">
          No data
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-lg px-3 py-2 bg-genius-blue/10 border border-genius-blue/30 transition-all duration-300 ${
                flashKeys.priceUsd ? "bg-genius-green/10 scale-[1.02]" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-genius-cream/60 mb-1">
                Price (USD)
              </div>
              <div className="text-[15px] font-semibold text-genius-cream">
                ${formatNumber(data.priceUsd)}
              </div>
            </div>

            <div
              className={`rounded-lg px-3 py-2 bg-genius-blue/10 border border-genius-blue/30 transition-all duration-300 ${
                flashKeys.volume ? "bg-genius-blue/20 scale-[1.02]" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] text-genius-cream/60 mb-1">
                Volume 24h
              </div>
              <div className="text-[15px] font-semibold text-genius-cream">
                ${formatNumber(data.volume)}
              </div>
            </div>
          </div>

          <div className="rounded-lg px-3 py-2 bg-genius-blue/10 border border-genius-blue/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-genius-cream/60">
                5m Activity
              </div>
              <div className="text-[10px] text-genius-cream/60">Buy vs Sell pressure</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div
                className={`flex flex-col gap-0.5 rounded-md px-2 py-1 transition-all duration-300 ${
                  flashKeys.buys5m ? "bg-genius-green/10 scale-[1.03]" : "bg-genius-green/5"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-genius-green">
                  Buys 5m
                </span>
                <span className="text-[14px] font-semibold text-genius-green">
                  +{formatNumber(data.buys5m)}
                </span>
              </div>

              <div
                className={`flex flex-col gap-0.5 rounded-md px-2 py-1 transition-all duration-300 ${
                  flashKeys.sells5m ? "bg-genius-red/10 scale-[1.03]" : "bg-genius-red/5"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-genius-red">
                  Sells 5m
                </span>
                <span className="text-[14px] font-semibold text-genius-red">
                  -{formatNumber(data.sells5m)}
                </span>
              </div>
            </div>

            <div className="mt-1">
              <div className="flex items-center justify-between text-[10px] text-genius-cream/60 mb-1">
                <span>Buy pressure</span>
                <span className="text-genius-green font-semibold">
                  {buyPressurePct.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-genius-red/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-genius-green rounded-full transition-all duration-500"
                  style={{ width: `${buyPressurePct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-stretch">
            <div className="rounded-lg px-3 py-2 bg-genius-blue/10 border border-genius-blue/30 flex flex-col gap-1">
              <div className="text-[10px] uppercase tracking-[0.18em] text-genius-cream/60">
                1h Buys
              </div>
              <div
                className={`text-[14px] font-semibold text-genius-green transition-all duration-300 ${
                  flashKeys.buys1h ? "scale-[1.05]" : ""
                }`}
              >
                +{formatNumber(data.buys1h)}
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-genius-cream/60 mt-1">
                1h Sells
              </div>
              <div
                className={`text-[14px] font-semibold text-genius-red transition-all duration-300 ${
                  flashKeys.sells1h ? "scale-[1.05]" : ""
                }`}
              >
                -{formatNumber(data.sells1h)}
              </div>
            </div>

            <div className="rounded-lg px-3 py-2 bg-genius-blue/5 border border-dashed border-genius-blue/30 flex flex-col justify-between text-[10px] text-genius-cream/60">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Last update</span>
                  <span className="text-genius-cream font-mono">{lastUpdatedText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pair</span>
                  <span className="text-genius-cream font-mono truncate max-w-[140px]">
                    {pairAddress.slice(0, 6)}...{pairAddress.slice(-4)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-genius-cream/50">
                <span className="h-[3px] w-[3px] rounded-full bg-genius-purple-light" />
                <span>Data via Dexscreener</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

