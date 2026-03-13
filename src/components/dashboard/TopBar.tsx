"use client";

import { useEffect, useRef, useState } from "react";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { useTokenProfile } from "@/hooks/useTokenProfile";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Star, Settings, Info, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketSelector } from "./MarketSelector";
import { GlobalSearch } from "./GlobalSearch";

export function TopBar({ 
  chainId, 
  tokenAddress, 
  onPoolSelect,
}: { 
  chainId: string; 
  tokenAddress: string;
  onPoolSelect?: (pairAddress: string) => void;
}) {
  const { metadata, loading, error } = usePairMetadata(chainId, tokenAddress);
  const { profile } = useTokenProfile(tokenAddress);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const currentPrice = metadata ? parseFloat(metadata.priceUsd) : NaN;

  useEffect(() => {
    if (!Number.isFinite(currentPrice)) return;
    const last = lastPriceRef.current;
    if (last != null && last !== currentPrice) {
      setPriceFlash(currentPrice > last ? "up" : "down");
      const tid = setTimeout(() => setPriceFlash(null), 400);
      return () => clearTimeout(tid);
    }
    lastPriceRef.current = currentPrice;
  }, [currentPrice]);

  if (loading) {
    return (
      <div className="h-16 w-full animate-pulse bg-white dark:bg-[#171821] border-b border-black/5 dark:border-white/5" />
    );
  }

  if (error || !metadata) {
    return (
      <div className="h-16 w-full bg-red-500/10 text-red-500 flex items-center justify-center border-b border-black/5 dark:border-white/5 text-sm">
        Error Loading Pair Data
      </div>
    );
  }

  const priceChange24h = metadata.priceChange?.h24 ?? 0;
  const isPositive = priceChange24h >= 0;
  const symbol = metadata.baseToken.symbol;
  const name = metadata.baseToken.name;
  const imageUrl = metadata.info?.imageUrl || profile?.icon || null;

  // Age calculation
  const ageStr = metadata.pairCreatedAt
    ? (() => {
        const ms = Date.now() - metadata.pairCreatedAt;
        const days = Math.floor(ms / 86400000);
        if (days >= 365) return `${Math.floor(days / 365)}y, ${days % 365}d`;
        return `${days}d`;
      })()
    : "—";

  return (
    <div className="w-full h-16 bg-white dark:bg-[#171821] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 text-xs font-mono text-gray-600 dark:text-gray-300">
      <div className="flex items-center gap-6 h-full">
        {/* Token Identifiers */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 overflow-hidden">
            {imageUrl
              ? <img src={imageUrl} alt={symbol} className="w-full h-full object-cover" />
              : symbol.charAt(0)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-black dark:text-white font-bold text-base font-sans">{symbol}</span>
              <span className="text-gray-500 font-sans">{name}</span>
              <div className="flex gap-1 ml-1 text-gray-400 dark:text-gray-500">
                <Star className="w-3.5 h-3.5 cursor-pointer hover:text-yellow-500 transition-colors" />
                <Share2 className="w-3.5 h-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                <Settings className="w-3.5 h-3.5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-0.5">
                <span
                  className={`text-lg font-bold tracking-tight bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 bg-clip-text text-transparent transition-all duration-300 ${
                    priceFlash === "up"
                      ? "drop-shadow-[0_0_14px_rgba(52,211,153,0.9)] scale-[1.03]"
                      : priceFlash === "down"
                        ? "drop-shadow-[0_0_14px_rgba(248,113,113,0.9)] scale-[1.03]"
                        : ""
                  }`}
                >
                  {formatCurrency(currentPrice)}
                </span>
                <span className={`px-1 rounded-sm text-[10px] font-bold ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}%
                </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 hidden lg:block"></div>

        {/* Dense Stats Row */}
        <div className="hidden lg:flex items-center gap-6">
            <div className="flex flex-col gap-0.5 whitespace-nowrap">
                <span className="text-gray-500 text-[10px] uppercase font-sans">Volume All Time</span>
                <span className="text-black dark:text-white font-bold">${formatNumber(metadata.volume?.h24 ?? 0)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase font-sans">M.Cap</span>
                <span className="text-black dark:text-white font-bold">${formatNumber(metadata.marketCap ?? metadata.fdv ?? 0)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase font-sans">Liquidity</span>
                <span className="text-black dark:text-white font-bold">${formatNumber(metadata.liquidity?.usd ?? 0)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase font-sans">Txns 24h</span>
                <span className="text-black dark:text-white font-bold">{((metadata.txns?.h24?.buys ?? 0) + (metadata.txns?.h24?.sells ?? 0)).toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase font-sans">Age</span>
                <span className="text-black dark:text-white font-bold">{ageStr}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-[10px] uppercase font-sans flex items-center gap-1">1h Change <Info className="w-3 h-3"/></span>
                <span className={`font-bold ${(metadata.priceChange?.h1 ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {((metadata.priceChange?.h1 ?? 0) >= 0 ? '+' : '')}{(metadata.priceChange?.h1 ?? 0).toFixed(2)}%
                </span>
            </div>
        </div>
      </div>

      {/* Right Actions / Theme Toggle */}
      <div className="flex items-center gap-4 pr-2">
         <MarketSelector chainId={chainId} tokenAddress={tokenAddress} onPoolSelect={onPoolSelect} />
         <GlobalSearch />
         <ThemeToggle />
      </div>
    </div>
  );
}
