"use client";

import { useEffect, useRef, useState } from "react";
import { useMarkets, MarketOption } from "@/hooks/useMarkets";
import { formatNumber } from "@/lib/utils";
import { ChevronDown, Zap, CheckCircle2, Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  chainId: string;
  tokenAddress: string;
  onPoolSelect?: (pairAddress: string) => void;
}

export function MarketSelector({ chainId, tokenAddress, onPoolSelect }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read ?pool= from the URL on initial render (e.g. ?pool=uniswap)
  const initialDexId = searchParams.get("pool") ?? undefined;

  const { markets, selected, setSelected, loading, error } = useMarkets(
    chainId,
    tokenAddress,
    initialDexId,
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Notify parent when selection changes
  useEffect(() => {
    if (selected) onPoolSelect?.(selected.pairAddress);
  }, [selected, onPoolSelect]);

  function handleSelect(m: MarketOption) {
    setSelected(m);
    setOpen(false);

    // Keep URL in sync so any pool selection becomes a shareable link
    const params = new URLSearchParams(searchParams.toString());
    params.set("pool", m.dexId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filtered = markets.filter((m) =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-7 px-3 rounded-full bg-black/5 dark:bg-white/5 flex items-center text-[10px] text-gray-500 animate-pulse">
        Loading pools…
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div className="h-7 px-3 rounded-full bg-red-500/10 text-red-400 flex items-center text-[10px]">
        No pools
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Pill trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="group flex items-center gap-2 h-7 px-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10"
      >
        <Zap className="w-3 h-3 text-yellow-400 shrink-0" />
        <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          {selected.label}
        </span>
        <span className="text-[10px] text-gray-500 whitespace-nowrap">
          ${formatNumber(selected.liquidityUsd)} liq
        </span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-9 z-50 w-72 rounded-xl bg-white dark:bg-[#12111A] border border-black/10 dark:border-white/10 shadow-xl shadow-black/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            Select Pool
          </div>

          {/* Search bar */}
          <div className="px-3 py-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <Search className="w-3 h-3 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pools…"
                className="flex-1 bg-transparent text-[11px] text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-gray-500">No pools found</div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left gap-2 ${
                    m.id === selected.id ? "bg-purple-500/5" : ""
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ${formatNumber(m.liquidityUsd)} liquidity
                    </span>
                  </div>
                  {m.id === selected.id && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
