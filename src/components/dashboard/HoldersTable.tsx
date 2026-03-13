"use client";

import { useHolders, Holder } from "@/hooks/useHolders";
import { formatCurrency, formatNumber, truncateAddress } from "@/lib/utils";
import { useCallback } from "react";
import { TableEmptyState } from "./TableEmptyState";

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
    <div className="w-full flex-1 flex flex-col font-sans h-full bg-genius-indigo text-genius-cream">
      <div className="grid grid-cols-[1.2fr_3fr_1fr_minmax(200px,2.2fr)_1fr] items-center px-4 py-2.5 bg-genius-indigo border-b border-genius-blue text-sm leading-5 font-medium text-genius-cream/80">
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

        {!loading && holders.length === 0 && <TableEmptyState />}

        <div className="flex flex-col">
          {holders.map((holder: Holder) => {
            const percent = holder.percentage ?? 0;
            const clamped = Math.min(Math.max(percent, 0), 100);
            const filledSegments = Math.round((clamped / 100) * 40); // 40 tiny bars

            return (
              <div
                key={holder.address}
                className="grid grid-cols-[1.2fr_3fr_1fr_minmax(200px,2.2fr)_1fr] items-center gap-3 px-4 py-2.5 hover:bg-genius-blue/40 transition-colors border-b border-genius-blue text-sm leading-5 font-medium"
              >
                {/* Rank */}
                <div className="flex items-center gap-1">
                  <span className={getRankColor(holder.rank)}>#{holder.rank}</span>
                </div>

                {/* Address with copy pill */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleCopy(holder.address)}
                  className="flex items-center gap-1 min-w-[140px] text-genius-cream hover:text-genius-cream/80 cursor-pointer truncate mr-2"
                >
                  <span>{truncateAddress(holder.address)}</span>
                  <span className="text-[9px] text-genius-cream/70 border border-genius-blue rounded px-1 py-0.5">
                    copy
                  </span>
                </button>

                {/* Percentage */}
                <div className="text-right text-genius-cream">
                  {holder.percentage !== null ? `${holder.percentage.toFixed(2)}%` : "—"}
                </div>

                {/* Amount with advanced progress bar */}
                <div className="w-[calc(50%-1rem)] ml-auto flex justify-end items-center gap-2">
                  <div className="text-sm">{formatNumber(holder.balance)}</div>
                  <div
                    className="flex flex-row"
                    style={{ height: 12, gap: 1 }}
                  >
                    {Array.from({ length: 40 }).map((_, idx) => {
                      const filled = idx < filledSegments;
                      const isPink = idx < filledSegments / 2;
                      return (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={idx}
                          className={`h-full rounded-[1px] ${
                            filled
                              ? isPink
                                ? "bg-genius-pink"
                                : "bg-genius-blue"
                              : "bg-genius-indigo"
                          }`}
                          style={{ width: 1 }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-sm text-genius-cream/80">
                    {formatNumber(holder.balance)}
                  </div>
                </div>

                {/* Value */}
                <div className="text-right text-genius-cream">
                  {holder.valueUsd != null ? formatCurrency(holder.valueUsd) : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
