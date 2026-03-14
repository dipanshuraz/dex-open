"use client";

import { usePairMetadata } from "@/hooks/usePairMetadata";
import { formatNumber } from "@/lib/utils";

export function RightVolumeStats({ chainId, pairAddress }: { chainId: string; pairAddress: string }) {
  const { metadata, loading } = usePairMetadata(chainId, pairAddress);

  const vol24h = metadata?.volume?.h24 ?? 0;
  const buys = metadata?.txns?.h24?.buys ?? 0;
  const sells = metadata?.txns?.h24?.sells ?? 0;
  const totalTxns = buys + sells;
  
  // Approximate buy/sell volume split based on txn counts
  const buyRatio = totalTxns > 0 ? (buys / totalTxns) : 0.5;
  const buyVol = vol24h * buyRatio;
  const sellVol = vol24h * (1 - buyRatio);

  const volChange = metadata?.priceChange?.h24 ?? 0; // fallback to price change since dex api doesn't give vol change directly

  return (
    <div className="flex flex-col font-sans px-4 pt-4 pb-0 border-b border-black/10 dark:border-panel-border">
      <div className="flex items-center justify-between text-[11px] font-bold text-gray-800 dark:text-gray-400 tracking-wider">
        <div className="flex flex-col gap-1">
          <span className="uppercase whitespace-nowrap text-gray-500 dark:text-gray-400">Volume 24h</span>
          <span className="text-black dark:text-white text-sm">
            {loading ? "--" : `$${formatNumber(vol24h)}`}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <span className="uppercase">Buys</span>
          <span className="text-genius-green tracking-normal">
            {loading ? "--" : buys}{" "}
            <span className="text-genius-green/70">
              / {loading ? "--" : `$${formatNumber(buyVol)}`}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-1 text-center">
          <span className="uppercase">Sells</span>
          <span className="text-genius-red tracking-normal">
            {loading ? "--" : sells}{" "}
            <span className="text-genius-red/70">
              / {loading ? "--" : `$${formatNumber(sellVol)}`}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="uppercase">Price Change (24h)</span>
          <span className={volChange >= 0 ? "text-genius-green" : "text-genius-red"}>
            {loading ? "--" : `${volChange >= 0 ? "+" : ""}${volChange.toFixed(2)}%`}
          </span>
        </div>
      </div>

      <div className="flex gap-1 mt-3 mb-4 h-[3px] rounded-full overflow-hidden w-full">
        <div className="bg-genius-green" style={{ width: `${buyRatio * 100}%` }} />
        <div className="bg-genius-red" style={{ width: `${(1 - buyRatio) * 100}%` }} />
      </div>
    </div>
  );
}
