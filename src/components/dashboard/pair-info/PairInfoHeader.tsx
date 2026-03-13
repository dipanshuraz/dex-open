"use client";

import { usePairMetadata } from "@/hooks/usePairMetadata";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";

export function PairInfoHeader({ chainId, tokenAddress }: { chainId: string; tokenAddress: string }) {
  const { metadata, loading, error } = usePairMetadata(chainId, tokenAddress);

  if (loading) return <div className="h-24 w-full animate-pulse bg-white/5 rounded-xl backdrop-blur-md"></div>;
  if (error || !metadata) return <div className="h-24 w-full bg-red-500/10 text-red-500 flex items-center justify-center rounded-xl border border-red-500/20 backdrop-blur-md">Failed to load Pair Metadata</div>;

  const priceChange24h = metadata.priceChange?.h24 ?? 0;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Activity className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {metadata.baseToken.symbol} <span className="text-gray-500 text-lg">/ {metadata.quoteToken.symbol}</span>
          </h1>
          <p className="text-sm font-mono text-gray-400 mt-1">{tokenAddress}</p>
        </div>
      </div>
      
      <div className="flex gap-8 items-center bg-white/5 px-6 py-4 rounded-xl border border-white/5">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 font-medium">Price</span>
          <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(parseFloat(metadata.priceUsd))}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm text-gray-400 font-medium">24h Change</span>
          <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
          </div>
        </div>

        <div className="hidden lg:flex flex-col">
          <span className="text-sm text-gray-400 font-medium">24h Vol</span>
          <span className="text-lg font-semibold text-white">${formatNumber(metadata.volume?.h24 ?? 0)}</span>
        </div>

        <div className="hidden xl:flex flex-col">
          <span className="text-sm text-gray-400 font-medium">Mkt Cap</span>
          <span className="text-lg font-semibold text-white">${formatNumber(metadata.marketCap ?? metadata.fdv ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
