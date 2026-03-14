"use client";

import React, { useCallback, useEffect, useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

interface TrendingToken {
  symbol: string;
  marketCap: number;
  change24h: number;
  volume24h: number;
  txns24h: number;
  trendScore: number;
  pairAddress: string;
  chainId: string;
  logo: string | null;
}

interface TokenItemProps {
  token: TrendingToken;
  index: number;
}

const TrendingTokenItem = memo(function TrendingTokenItem({ token, index }: TokenItemProps) {
  const isUp = token.change24h >= 0;
  return (
    <Link
      key={`${token.pairAddress}-${index}`}
      href={`/${token.chainId}/${token.pairAddress}`}
      className="flex items-center gap-2 px-5 py-1 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group/token"
    >
      <div className="flex items-center gap-2">
        {token.logo ? (
          <Image
            src={token.logo}
            alt={token.symbol}
            width={16}
            height={16}
            className="w-4 h-4 rounded-full grayscale-[0.2] group-hover/token:grayscale-0 transition-all"
            unoptimized
          />
        ) : (
          <div className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/5 text-[9px] flex items-center justify-center text-gray-400 font-bold border border-black/10 dark:border-white/10 uppercase">
            {token.symbol[0]}
          </div>
        )}

        <span className="text-[12px] font-bold text-gray-900 dark:text-foreground-alt tracking-[0.01em]">
          {token.symbol}
        </span>

        <span className="text-[11px] text-muted-text font-medium">
          ${formatNumber(token.marketCap)}
        </span>

        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold transition-all ${
            isUp ? "bg-green-up-bg text-green-up-text" : "bg-red-down-bg text-red-down-text"
          }`}
        >
          {isUp ? "▲" : "▼"} {Math.abs(token.change24h).toFixed(2)}%
        </div>
      </div>
    </Link>
  );
});

export default function TrendingBar() {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchTrending = useCallback(async () => {
    if (isCollapsed) return;
    try {
      const res = await fetch("/api/trending");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTokens(data);
      }
    } catch (err) {
      console.error("Failed to fetch trending:", err);
    } finally {
      setLoading(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (!isCollapsed) {
      fetchTrending();
    }
    const interval = setInterval(() => {
      if (!isCollapsed) fetchTrending();
    }, 60000);
    return () => clearInterval(interval);
  }, [isCollapsed, fetchTrending]);

  if (loading && tokens.length === 0) {
    return (
      <div className="h-9 w-full bg-white dark:bg-surface-panel border-b border-black/10 dark:border-panel-border flex items-center px-4 overflow-hidden">
        <div className="w-4 h-4 border-2 border-purple-500/50 border-t-purple-400 rounded-full animate-spin mr-2" />
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Loading Trending...</span>
      </div>
    );
  }

  // Double the tokens for seamless loop (simple derived array, no hook needed)
  const displayTokens = [...tokens, ...tokens];

  return (
    <div className={`group relative w-full bg-white dark:bg-surface-dark border-b border-black/10 dark:border-white/[0.05] z-50 transition-all duration-300 ease-in-out ${
      isCollapsed ? "h-0" : "h-9"
    }`}>
      {/* Content Container */}
      <div className={`flex items-center w-full h-9 overflow-hidden transition-opacity duration-300 ${
        isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}>
        {/* Trending Icon */}
        <div className="flex items-center px-3 bg-white dark:bg-surface-dark z-10 border-r border-black/10 dark:border-white/5 h-full">
          <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 relative overflow-hidden h-full flex items-center">
          <div className="flex animate-marquee group-hover:pause-marquee whitespace-nowrap">
            {displayTokens.map((token, idx) => (
              <TrendingTokenItem key={`${token.pairAddress}-${idx}`} token={token} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute left-4 -bottom-4 w-6 h-4 bg-white dark:bg-surface-dark border border-black/10 dark:border-white/10 border-t-0 rounded-b-sm flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all z-[60] shadow-xl group/toggle ${
          isCollapsed ? "opacity-70 hover:opacity-100" : ""
        }`}
        title={isCollapsed ? "Show Trending" : "Hide Trending"}
      >
        <svg 
          className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
