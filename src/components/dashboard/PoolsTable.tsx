"use client";

import { usePools, Pool } from "@/hooks/usePools";
import { formatNumber } from "@/lib/utils";
import { getDexIcon } from "@/lib/theme";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function PoolRow({ pool, now }: { pool: Pool, now: number }) {
  const seconds = Math.floor((now - pool.age) / 1000);
  let ageStr;
  
  if (seconds < 60) {
    ageStr = `${seconds}s`;
  } else if (seconds < 3600) {
    ageStr = `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    ageStr = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  } else {
    const d = Math.floor(seconds / 86400);
    const y = Math.floor(d / 365);
    if (y > 0) {
        ageStr = `${y}y, ${d % 365}d, ${Math.floor((seconds % 86400) / 3600)}h`;
    } else {
        ageStr = `${d}d, ${Math.floor((seconds % 86400) / 3600)}h`;
    }
  }

  const dexIcon = getDexIcon(pool.dex);
  const dexName = pool.dex.charAt(0).toUpperCase() + pool.dex.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-6 items-center px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/2 text-[11px] font-mono group overflow-hidden gap-x-2 w-full max-w-full"
    >
      <div className="flex items-center gap-2 truncate w-full text-left font-sans font-medium text-gray-800 dark:text-gray-200">
        <span className="text-lg">{dexIcon}</span>
        <span>{dexName}</span>
        <button 
           onClick={() => navigator.clipboard.writeText(pool.pairAddress)}
           className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-gray-400 hover:text-gray-900 dark:hover:text-white"
           title="Copy Address"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>

      <div className="font-bold tracking-wide truncate w-full text-left text-gray-800 dark:text-white">
        {pool.pair}
      </div>

      <div className="text-gray-600 dark:text-gray-300 truncate w-full text-left">
        ${formatNumber(pool.liquidity)}
      </div>

      <div className="text-gray-600 dark:text-gray-300 truncate w-full text-left">
        ${formatNumber(pool.volume)}
      </div>

      <div className="text-gray-500 dark:text-gray-400 truncate w-full text-left">
        {ageStr}
      </div>

      <div className="truncate text-left flex items-center">
        <a 
          href={pool.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          View Pool
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </motion.div>
  );
}

export function PoolsTable({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
}) {
  const { pools, loading } = usePools(chainId, tokenAddress);
  const now = useNow();

  return (
    <div className="absolute inset-0 flex flex-col font-sans">
      
      {/* Table Header */}
      <div className="grid grid-cols-6 items-center px-4 py-3 bg-gray-50 dark:bg-[#171821] border-b border-black/10 dark:border-[#221A30] text-[10px] uppercase font-extrabold text-[#8C82A2] tracking-widest sticky top-0 z-10 w-full shrink-0 gap-x-2">
        <div className="truncate w-full text-left">Pool / Dex</div>
        <div className="truncate w-full text-left">Pair</div>
        <div className="truncate w-full text-left flex items-center gap-1">Liquidity <span className="text-[#A78BFA]">▼</span></div>
        <div className="truncate w-full text-left">Volume (24h)</div>
        <div className="truncate w-full text-left">Age</div>
        <div className="truncate text-left">Action</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {loading && pools.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">Loading pools...</div>
        ) : pools.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">No pools found</div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {pools.map((pool: Pool) => (
                <PoolRow key={pool.pairAddress + pool.dex} pool={pool} now={now} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
