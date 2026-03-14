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

  return (
    <div className="w-full flex-1 flex flex-col font-sans h-full bg-genius-indigo text-genius-cream">
      <header className="sticky top-0 z-10 w-full shrink-0">
        <div className="grid grid-cols-[1fr_60px_2fr_100px] w-full px-5 py-1.5 bg-genius-blue/50 items-center gap-2">
          <div className="text-genius-cream/60 whitespace-nowrap text-xs">Holders</div>
          <div className="text-genius-cream/60 whitespace-nowrap text-xs text-right">%</div>
          <div className="text-genius-cream/60 whitespace-nowrap text-xs text-right">Amount</div>
          <div className="text-genius-cream/60 whitespace-nowrap text-xs text-right">Value</div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading && holders.length === 0 && (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[54px] w-full bg-genius-blue/20 animate-pulse rounded"
              />
            ))}
          </div>
        )}

        {!loading && holders.length === 0 && <TableEmptyState />}

        <div className="flex flex-col">
          {holders.map((holder: Holder) => {
            const percent = holder.percentage ?? 0;
            const clamped = Math.min(Math.max(percent, 0), 100);
            const filledSegments = Math.round((clamped / 100) * 40);

            return (
              <div
                key={holder.address}
                className="flex flex-row w-full px-5 py-2.5 h-[54px] items-center transition-colors hover:bg-genius-blue cursor-pointer border-b border-genius-blue/50"
              >
                <div className="w-[calc(25%-1rem)] flex items-center gap-2 min-w-0">
                  <div className="text-sm text-genius-rank shrink-0">
                    <span className="opacity-50">#</span>
                    {holder.rank}
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleCopy(holder.address)}
                    className="w-fit text-sm text-genius-cream hover:opacity-70 transition-opacity border-2 border-dotted border-genius-blue rounded-sm px-1 truncate"
                  >
                    {truncateAddress(holder.address)}
                  </button>
                </div>

                <div className="w-[60px] flex flex-col text-right shrink-0">
                  <span className="text-sm">
                    {holder.percentage !== null ? `${holder.percentage.toFixed(2)}%` : "—"}
                  </span>
                </div>

                <div className="w-[calc(50%-1rem)] flex justify-end items-center gap-2 min-w-0">
                  <span className="text-sm shrink-0">{formatNumber(holder.balance)}</span>
                  <div className="flex flex-row shrink-0" style={{ height: 12, gap: 1 }}>
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
                  <span className="text-sm shrink-0">{formatNumber(holder.balance)}</span>
                </div>

                <div className="w-[100px] ml-auto flex flex-col text-right shrink-0">
                  <span className="text-sm">
                    {holder.valueUsd != null ? formatCurrency(holder.valueUsd) : "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
