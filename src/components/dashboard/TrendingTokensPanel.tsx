"use client";

import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import { formatNumber, truncateAddress } from "@/lib/utils";
import { Flame } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrendingTokensPanel() {
  const { tokens, loading, error } = useTrendingTokens();
  const router = useRouter();

  const top = tokens.slice(0, 8);

  return (
    <div className="flex flex-col px-4 pt-4 pb-2 font-sans border-b border-black/10 dark:border-[#221A30]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>Trending</span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">
          Dexscreener
        </span>
      </div>

      {loading ? (
        <div className="text-[11px] text-gray-500 py-3">Loading trending tokens…</div>
      ) : error ? (
        <div className="text-[11px] text-red-400 py-3">Failed to load trending list</div>
      ) : top.length === 0 ? (
        <div className="text-[11px] text-gray-500 py-3">No trending tokens</div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto custom-scrollbar">
          {top.map((t, idx) => (
            <button
              key={`${t.chainId}-${t.tokenAddress}-${idx}`}
              onClick={() => router.push(`/${t.chainId}/${t.tokenAddress}`)}
              className="flex items-center justify-between w-full text-[11px] px-2 py-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-[10px] text-gray-500">{idx + 1}.</span>
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    {t.symbol ?? "Token"}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {t.tokenAddress ? truncateAddress(t.tokenAddress) : "—"}
                  </span>
                </div>
              </div>
              {t.boosts?.score != null && (
                <span className="text-[10px] text-orange-400 font-mono">
                  {formatNumber(t.boosts.score)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

