"use client";

import { useEffect, useState, useRef } from "react";
import { DexPair, fetchPairs, selectBestPool } from "@/lib/dexscreener";
import { formatNumber } from "@/lib/utils";
import { ChevronDown, Layers, Activity, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PoolSelectorProps {
  chainId: string;
  tokenAddress: string;
  onPoolSelect: (pool: DexPair) => void;
  selectedPairAddress?: string;
}

export function PoolSelector({ 
  chainId, 
  tokenAddress, 
  onPoolSelect,
  selectedPairAddress 
}: PoolSelectorProps) {
  const [pools, setPools] = useState<DexPair[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPairs(chainId, tokenAddress);
        setPools(data);
        
        // Auto-select best pool if none selected
        if (data.length > 0 && !selectedPairAddress) {
          const best = selectBestPool(data);
          if (best) onPoolSelect(best);
        }
      } catch (err) {
        console.error("Failed to load pools for selector:", err);
      }
    }
    load();
  }, [chainId, tokenAddress, onPoolSelect, selectedPairAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPool = pools.find(p => p.pairAddress === selectedPairAddress) || selectBestPool(pools);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 group min-w-[240px]"
      >
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
          <Layers size={18} />
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider leading-none mb-1">
            Active Pool
          </span>
          <span className="text-sm font-semibold text-white truncate w-full flex items-center gap-2">
            {selectedPool ? `${selectedPool.dexId.toUpperCase()} ${selectedPool.baseToken.symbol}/${selectedPool.quoteToken.symbol}` : "Loading pools..."}
          </span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 w-[320px] bg-surface-elevated/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden p-2"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-2">
              <span className="text-[10px] uppercase font-black text-purple-400 tracking-[0.2em]">Select Liquidity Pool</span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {pools.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs text-italic">No pools found</div>
              ) : (
                pools.map((pool) => {
                  const isSelected = pool.pairAddress === selectedPairAddress;
                  return (
                    <button
                      key={pool.pairAddress}
                      onClick={() => {
                        onPoolSelect(pool);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col p-3 rounded-xl transition-all text-left ${
                        isSelected 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                          {pool.dexId.toUpperCase()}
                          {pool.labels?.map(l => (
                            <span key={l} className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded uppercase tracking-tighter font-black">
                              {l}
                            </span>
                          ))}
                        </span>
                        <span className="text-[11px] font-mono text-purple-300 font-bold">
                          ${formatNumber(pool.liquidity?.usd ?? 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Activity size={12} className="text-blue-400" />
                          Vol 24h: <span className="text-gray-200">${formatNumber(pool.volume?.h24 ?? 0)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Droplets size={12} className="text-cyan-400" />
                          {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
