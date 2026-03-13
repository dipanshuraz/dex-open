"use client";

import { useHolders, Holder } from "@/hooks/useHolders";
import { formatCurrency, formatNumber, truncateAddress } from "@/lib/utils";
import { useCallback } from "react";

export function HoldersTable({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
}) {
  const { holders, loading } = useHolders(tokenAddress, chainId);

  const handleCopy = useCallback((address: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(address).catch(() => {});
    }
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-teal-300";
    if (rank === 3) return "text-orange-400";
    return "text-gray-400";
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans h-full bg-white dark:bg-[#0B0C10]">
      <div className="grid grid-cols-[1fr_2fr_1fr_minmax(200px,2fr)_1fr] items-center px-4 py-2 bg-gray-50/80 dark:bg-[#171821]/50 border-b border-black/10 dark:border-white/5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
        <div>Holders</div>
        <div />
        <div className="text-right">%</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Value</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && holders.length === 0 && (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-full bg-black/5 dark:bg-white/5 animate-pulse rounded"
              ></div>
            ))}
          </div>
        )}

        {!loading && holders.length === 0 && (
          <div className="p-8 text-center text-xs text-gray-500">
            No holder data available or token not yet indexed.
          </div>
        )}

        <div className="flex flex-col">
          {holders.map((holder: Holder) => (
            <div
              key={holder.address}
              className="grid grid-cols-[1fr_2fr_1fr_minmax(200px,2fr)_1fr] items-center gap-2 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/[0.02] text-[11px] font-mono text-gray-800 dark:text-gray-200"
            >
              <div className="flex items-center gap-1">
                <span className={getRankColor(holder.rank)}>#{holder.rank}</span>
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleCopy(holder.address)}
                className="flex items-center gap-1 min-w-[120px] text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer truncate mr-2"
              >
                <span>{truncateAddress(holder.address)}</span>
                <span className="text-[9px] text-gray-500 border border-gray-400 dark:border-gray-600/80 rounded px-1 py-0.5">
                  copy
                </span>
              </button>

              <div className="text-right font-bold text-yellow-600 dark:text-yellow-500/90">
                {holder.percentage !== null
                  ? `${holder.percentage.toFixed(2)}%`
                  : "—"}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-pink-500/60 via-red-500/60 to-indigo-500/40 overflow-hidden">
                  <div
                    className="h-full bg-gray-300 dark:bg-white/80"
                    style={{
                      width: `${
                        holder.percentage !== null
                          ? Math.min(holder.percentage, 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="text-right text-gray-600 dark:text-gray-300">
                  {formatNumber(holder.balance)}
                </div>
              </div>

              <div className="text-right text-gray-600 dark:text-gray-300">
                {holder.valueUsd != null
                  ? formatCurrency(holder.valueUsd)
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
