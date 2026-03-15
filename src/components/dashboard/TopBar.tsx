"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { useTokenProfile } from "@/hooks/useTokenProfile";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useHolders } from "@/hooks/useHolders";
import { CopyIcon } from "@/components/icons/CopyIcon";
import { ShareIcon } from "@/components/icons/ShareIcon";
import { StarSmallIcon } from "@/components/icons/StarSmallIcon";
import { TwitterFillIcon } from "@/components/icons/TwitterFillIcon";
import { EarthIcon } from "@/components/icons/EarthIcon";
import { DexScreenerIcon } from "@/components/icons/DexScreenerIcon";
import { LanguagesIcon } from "@/components/icons/LanguagesIcon";
import { SearchSmallIcon } from "@/components/icons/SearchSmallIcon";
import { SettingsCogIcon } from "@/components/icons/SettingsCogIcon";
import { cn } from "@/lib/utils";

export function TopBar({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
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
      const flash: "up" | "down" = currentPrice > last ? "up" : "down";
      const deferId = setTimeout(() => setPriceFlash(flash), 0);
      const clearId = setTimeout(() => setPriceFlash(null), 400);
      return () => {
        clearTimeout(deferId);
        clearTimeout(clearId);
      };
    }
    lastPriceRef.current = currentPrice;
  }, [currentPrice]);

  if (loading) {
    return (
      <div className="h-16 w-full animate-pulse bg-background border-b border-genius-blue/50" />
    );
  }

  if (error || !metadata) {
    return (
      <div className="h-16 w-full bg-genius-red/10 text-genius-red flex items-center justify-center border-b border-genius-blue/50 text-sm">
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

  // Buy pressure as deviation from 50%: positive = more buys (green), negative = more sells (red)
  const buyPressureDelta = buyPressure - 50;
  const buyPressurePositive = buyPressureDelta >= 0;

  return (
    <div className="group relative flex items-center py-2.5 bg-genius-indigo border-b border-genius-blue text-xs font-sans text-genius-cream w-full min-w-0">
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-genius-indigo to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-genius-indigo to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-6 sm:gap-8 pl-3 pr-4 sm:pl-4 sm:pr-5 overflow-x-auto overflow-y-hidden w-full min-w-0">
        <div className="flex flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 relative group/tokenimage">
            <div className="relative rounded-md border border-genius-blue/80 w-8 h-8 overflow-hidden shrink-0">
              {imageUrl ? (
                <Image src={imageUrl} alt={symbol} width={32} height={32} className="w-full h-full object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-genius-blue text-white font-bold">
                  {symbol.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="whitespace-nowrap text-sm font-medium">{symbol}</div>
              <div className="flex items-center gap-1.5 cursor-pointer group/tokenname min-w-0">
                <div className="opacity-60 text-[11px] truncate max-w-[100px] group-hover/tokenname:opacity-80 transition-opacity">
                  {name}
                </div>
                <button type="button" onClick={handleCopyAddress} className="text-genius-cream/80 hover:text-genius-cream">
                  <CopyIcon />
                </button>
              </div>
              <button type="button" onClick={handleShareUrl} className="text-genius-cream/80 hover:text-genius-cream">
                <ShareIcon />
              </button>
              <StarSmallIcon />
            </div>

            <div className="flex items-center gap-2 text-genius-cream/90">
              <div className="flex gap-2 items-center">
                        {([
                  { href: twitterUrl,     Icon: TwitterFillIcon, label: "Twitter",    rel: "noreferrer" },
                  { href: primaryWebsite, Icon: EarthIcon,        label: "Website",    rel: "noreferrer" },
                  { href: dexscreenerUrl, Icon: DexScreenerIcon,  label: "DexScreener" },
                ] as const).filter((s) => s.href).map(({ href, Icon, label, rel }) => (
                  <a
                    key={label}
                    className="rounded-md flex items-center justify-center text-xs bg-transparent size-3.5 text-genius-cream/90 hover:text-genius-cream hover:opacity-100 transition-opacity"
                    target="_blank"
                    rel={rel}
                    href={href!}
                    aria-label={label}
                  >
                    <Icon />
                  </a>
                ))}
                <LanguagesIcon />
              </div>
              <SearchSmallIcon />
            </div>
          </div>
        </div>

        <div className="flex flex-col whitespace-nowrap shrink-0">
          <div className="flex flex-row items-center gap-2 min-w-[120px]">
            <span
              className={cn(
                "text-lg font-bold tracking-tight text-genius-cream transition-all duration-300",
                priceFlash === "up" && "shadow-flash-green scale-[1.03]",
                priceFlash === "down" && "shadow-flash-red scale-[1.03]"
              )}
            >
              {formatCurrency(currentPrice)}
            </span>
            <div className="items-center gap-1 text-xs">
              <div
                className={cn(
                  "text-xs flex w-fit items-center gap-1 px-0.5 py-0 rounded-sm",
                  isPositive ? "text-genius-green bg-genius-green/20" : "text-genius-red bg-genius-red/20"
                )}
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

        {([
          { label: "Volume",       value: `$${formatNumber(metadata.volume?.h24 ?? 0)}`,                     title: formatNumber(metadata.volume?.h24 ?? 0) },
          { label: "M.Cap",        value: `$${formatNumber(metadata.marketCap ?? metadata.fdv ?? 0)}`,        title: formatNumber(metadata.marketCap ?? metadata.fdv ?? 0) },
          { label: "Liquidity",    value: `$${formatNumber(metadata.liquidity?.usd ?? 0)}`,                   title: formatNumber(metadata.liquidity?.usd ?? 0) },
          { label: "Holders",      value: holdersCount != null ? holdersCount.toLocaleString() : "—" },
          { label: "Age",          value: ageStr },
          { label: "Supply",       value: totalSupply != null ? formatNumber(totalSupply) : "—" },
          {
            label: "Buy Pressure",
            value: `${buyPressurePositive ? "+" : ""}${buyPressureDelta.toFixed(1)}%`,
            title: `${buyPressure.toFixed(1)}%`,
            valueClassName: buyPressurePositive ? "text-genius-green" : "text-genius-red",
          },
        ] as const).map(({ label, value, title, valueClassName }) => (
          <div key={label} className="flex flex-col whitespace-nowrap shrink-0">
            <div className="text-genius-cream/65 text-xs whitespace-nowrap">{label}</div>
            <div
              className={cn("text-genius-cream text-sm min-w-0 truncate max-w-[80px]", valueClassName)}
              title={title}
            >
              {value}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center shrink-0"
        >
          <SettingsCogIcon className="text-genius-cream" />
        </button>
        <div className="relative flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm text-sm cursor-pointer border border-genius-blue lg:hover:bg-genius-blue transition-colors">
            <div className="relative overflow-hidden w-[22px] h-[22px]">
              <Image
                src="https://www.tradegenius.com/static/images/verified.png"
                alt="verified"
                width={22}
                height={22}
                className="absolute top-0 left-0 w-full h-full object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
