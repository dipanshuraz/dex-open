"use client";

import { useEffect, useRef, useState } from "react";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { useTokenProfile } from "@/hooks/useTokenProfile";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useHolders } from "@/hooks/useHolders";
import { MarketSelector } from "./MarketSelector";
import { GlobalSearch } from "./GlobalSearch";
import { CopyIcon } from "@/components/icons/CopyIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { StarSmallIcon } from "@/components/icons/StarSmallIcon";
import { TwitterFillIcon } from "@/components/icons/TwitterFillIcon";
import { EarthIcon } from "@/components/icons/EarthIcon";
import { DexScreenerIcon } from "@/components/icons/DexScreenerIcon";
import { LanguagesIcon } from "@/components/icons/LanguagesIcon";
import { SearchSmallIcon } from "@/components/icons/SearchSmallIcon";
import { SettingsCogIcon } from "@/components/icons/SettingsCogIcon";

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
  const { holders } = useHolders(tokenAddress, chainId);
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

  const h24Buys = metadata.txns?.h24?.buys ?? 0;
  const h24Sells = metadata.txns?.h24?.sells ?? 0;
  const totalTxns = h24Buys + h24Sells;
  const buyPressure = totalTxns > 0 ? (h24Buys / totalTxns) * 100 : 0;

  const holdersCount = holders.length > 0 ? holders.length : null;
  const totalSupply =
    holders.length > 0
      ? holders.reduce((acc, h) => acc + (h.balance || 0), 0)
      : null;

  const primaryWebsite = metadata.info?.websites?.[0]?.url || profile?.links?.find((l) => l.type === "website")?.url;
  const twitterLink =
    metadata.info?.socials?.find((s) => s.platform?.toLowerCase() === "twitter" || s.platform?.toLowerCase() === "x")
      ?.handle ||
    profile?.links?.find((l) => (l.type ?? "").toLowerCase() === "twitter")?.url;
  const twitterUrl = twitterLink
    ? twitterLink.startsWith("http")
      ? twitterLink
      : `https://twitter.com/${twitterLink.replace(/^@/, "")}`
    : null;
  const dexscreenerUrl = metadata.url;

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(tokenAddress);
    } catch {
      // ignore
    }
  }

  async function handleShareUrl() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
    } catch {
      // fall back to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  // Age calculation
  const pairCreatedDate = metadata.pairCreatedAt ? new Date(metadata.pairCreatedAt) : null;
  const ageStr = pairCreatedDate
    ? (() => {
        const now = new Date();
        const diffMs = now.getTime() - pairCreatedDate.getTime();
        const days = Math.floor(diffMs / 86400000);
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        if (years > 0) return `${years}y, ${remainingDays}d`;
        return `${days}d`;
      })()
    : "—";

  return (
    <div className="group relative flex items-center py-2.5 bg-genius-indigo border-b border-genius-blue border-r text-xs font-sans text-genius-cream">
      {/* Edge gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-genius-indigo to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-genius-indigo to-transparent z-10 pointer-events-none" />

      {/* Scrollable content row */}
      <div className="flex items-center gap-8 pl-4 pr-5 overflow-x-auto overflow-y-hidden w-full">
        {/* Token + socials + price */}
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center gap-3 relative group/tokenimage">
            <div className="relative rounded-md border-2 border-genius-pink w-8 h-8 overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={symbol} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-genius-blue text-white font-bold">
                  {symbol.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="whitespace-nowrap text-sm">{symbol}</div>
              <div className="flex items-center gap-1.5 cursor-pointer group/tokenname">
                <div className="opacity-50 text-[11px] truncate max-w-[100px] group-hover/tokenname:opacity-70 transition-opacity">
                  {name}
                </div>
                <button type="button" onClick={handleCopyAddress}>
                  <CopyIcon />
                </button>
              </div>
              <button type="button" onClick={handleShareUrl}>
                <ShareIcon />
              </button>
              <StarSmallIcon />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-2 items-center">
                {twitterUrl && (
                  <a
                    className="rounded-md flex items-center justify-center text-xs bg-transparent size-3.5!"
                    target="_blank"
                    rel="noreferrer"
                    href={twitterUrl}
                  >
                    <TwitterFillIcon />
                  </a>
                )}
                {primaryWebsite && (
                  <a
                    className="rounded-md flex items-center justify-center text-xs bg-transparent size-3.5!"
                    target="_blank"
                    rel="noreferrer"
                    href={primaryWebsite}
                  >
                    <EarthIcon />
                  </a>
                )}
                {dexscreenerUrl && (
                  <a
                    className="rounded-md flex items-center justify-center text-xs bg-transparent size-3.5!"
                    target="_blank"
                    href={dexscreenerUrl}
                  >
                    <DexScreenerIcon />
                  </a>
                )}
                <LanguagesIcon />
              </div>
              <SearchSmallIcon />
            </div>
          </div>
        </div>

        {/* Price + 24h change */}
        <div className="flex flex-col whitespace-nowrap">
          <div className="flex flex-row items-center gap-2" style={{ width: 145 }}>
            <span
              className={`text-lg font-bold tracking-tight text-genius-cream transition-all duration-300 ${
                priceFlash === "up"
                  ? "drop-shadow-[0_0_14px_rgba(52,211,153,0.9)] scale-[1.03]"
                  : priceFlash === "down"
                  ? "drop-shadow-[0_0_14px_rgba(248,113,113,0.9)] scale-[1.03]"
                  : ""
              }`}
            >
              {formatCurrency(currentPrice)}
            </span>
            <div className="items-center gap-1 text-xs">
              <div
                className={`text-xs flex w-fit items-center gap-1 px-0.5 py-0 rounded-sm ${
                  isPositive ? "text-genius-green bg-genius-green/20" : "text-genius-red bg-genius-red/20"
                }`}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  className={`h-2 w-2 ${isPositive ? "" : "rotate-180"}`}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M256 32 20 464h472L256 32z" />
                </svg>
                {Math.abs(priceChange24h).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Stat items */}
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Volume</div>
          <div className="text-genius-cream text-sm" style={{ width: 57 }}>
            ${formatNumber(metadata.volume?.h24 ?? 0)}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">M.Cap</div>
          <div className="text-genius-cream text-sm" style={{ width: 66 }}>
            ${formatNumber(metadata.marketCap ?? metadata.fdv ?? 0)}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Liquidity</div>
          <div className="text-genius-cream text-sm" style={{ width: 61 }}>
            ${formatNumber(metadata.liquidity?.usd ?? 0)}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Holders</div>
          <div className="text-genius-cream text-sm" style={{ width: 63 }}>
            {holdersCount != null ? holdersCount.toLocaleString() : "—"}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Age</div>
          <div className="text-genius-cream text-sm" style={{ width: 84 }}>
            {ageStr}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Supply</div>
          <div className="text-genius-cream text-sm" style={{ width: 41 }}>
            {totalSupply != null ? formatNumber(totalSupply) : "—"}
          </div>
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <div className="text-genius-cream/50 text-xs whitespace-nowrap">Buy Pressure</div>
          <div className="text-sm text-genius-green" style={{ width: 76 }}>
            +{buyPressure.toFixed(1)}%
          </div>
        </div>

        {/* Settings / network / verified */}
        <button
          type="button"
          className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
        >
          <SettingsCogIcon className="text-genius-cream" />
        </button>
        <div className="relative flex items-center gap-2">
          {/* Network dropdown via MarketSelector (compact) */}
          <div className="relative">
            <MarketSelector chainId={chainId} tokenAddress={tokenAddress} onPoolSelect={onPoolSelect} />
          </div>
          {/* Verified badge */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-sm cursor-pointer border border-genius-blue lg:hover:bg-genius-blue transition-colors">
            <div className="relative overflow-hidden w-[22px] h-[22px]">
              <img
                src="https://www.tradegenius.com/static/images/verified.png"
                alt="verified"
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Global search stays at end on wide screens */}
        <div className="hidden xl:flex">
          <GlobalSearch />
        </div>
      </div>
    </div>
  );
}
