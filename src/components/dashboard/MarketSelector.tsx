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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setSearch(""), 0);
    const focusId = setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      clearTimeout(id);
      clearTimeout(focusId);
    };
  }, [open]);

  useEffect(() => {
    if (selected) onPoolSelect?.(selected.pairAddress);
  }, [selected, onPoolSelect]);

  function handleSelect(m: MarketOption) {
    setSelected(m);
    setOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("pool", m.dexId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filtered = markets.filter((m) =>
    m.label.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-8 px-3 rounded-sm border border-genius-blue flex items-center text-[10px] text-genius-cream/60 animate-pulse">
        Loading pools…
      </div>
    );
  }

  if (error || !selected) {
    return (
      <div className="h-8 px-3 rounded-sm border border-genius-blue flex items-center text-[10px] text-genius-red">
        No pools
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 px-2 py-[7px] rounded-sm border border-genius-blue bg-transparent hover:brightness-95 transition-all text-sm text-genius-cream cursor-pointer"
      >
        <Zap className="w-4 h-4 text-genius-cream/80 shrink-0" />
        <span className="text-sm whitespace-nowrap font-medium">{selected.label}</span>
        <span className="text-xs text-genius-cream/60 whitespace-nowrap">
          ${formatNumber(selected.liquidityUsd)}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-genius-cream/70 shrink-0 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-lg bg-genius-indigo border border-genius-blue shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-genius-blue text-[10px] uppercase tracking-widest text-genius-cream/60 font-semibold">
            Select Pool
          </div>

          <div className="px-3 py-2 border-b border-genius-blue">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-sm bg-genius-blue/30 border border-genius-blue">
              <Search className="w-3 h-3 text-genius-cream/60 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pools…"
                className="flex-1 bg-transparent text-[11px] text-genius-cream placeholder-genius-cream/50 outline-none"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-genius-cream/50">No pools found</div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-genius-blue/30 transition-colors text-left gap-2 ${
                    m.id === selected.id ? "bg-genius-blue/20" : ""
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-medium text-genius-cream truncate">
                      {m.label}
                    </span>
                    <span className="text-[10px] text-genius-cream/60">
                      ${formatNumber(m.liquidityUsd)} liquidity
                    </span>
                  </div>
                  {m.id === selected.id && (
                    <CheckCircle2 className="w-4 h-4 text-genius-pink shrink-0" />
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
