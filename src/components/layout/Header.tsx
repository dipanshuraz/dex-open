"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MAIN_NAV_ITEMS } from "@/dummy/header";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import { formatNumber } from "@/lib/utils";
import { TrendingFlameIcon } from "@/components/icons/TrendingFlameIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { Search, ClipboardList, Bell, ChevronDown, Cog, X, UserCog } from "lucide-react";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { Switch } from "@/components/ui/Switch";

const HEADER_HEIGHT_COLLAPSED = "52px";
const HEADER_HEIGHT_EXPANDED = "90px";

const TRENDING_NETWORKS = [
  { id: "ethereum", name: "Ethereum", logo: "/static/geniusImages/advanced_network_logos/ethereum.png" },
  { id: "optimism", name: "Optimism", logo: "/static/geniusImages/advanced_network_logos/optimism.png" },
  { id: "bsc", name: "Binance Smart Chain", logo: "/static/geniusImages/advanced_network_logos/binance.png" },
  { id: "polygon", name: "Polygon", logo: "/static/geniusImages/advanced_network_logos/polygon.png" },
  { id: "sonic", name: "Sonic", logo: "/static/geniusImages/advanced_network_logos/sonic.png" },
  { id: "hype", name: "HYPEREVM", logo: "/static/geniusImages/advanced_network_logos/hype.png" },
  { id: "base", name: "Base", logo: "/static/geniusImages/advanced_network_logos/base.png" },
  { id: "arbitrum", name: "Arbitrum", logo: "/static/geniusImages/advanced_network_logos/arbitrum.png" },
  { id: "avalanche", name: "Avalanche", logo: "/static/geniusImages/advanced_network_logos/avalanche.png" },
  { id: "solana", name: "Solana", logo: "/static/geniusImages/advanced_network_logos/solana.png" },
];

const Header = () => {
  const { tokens, loading } = useTrendingTokens();
  const displayTokens = tokens.slice(0, 20);
  const [isTrendingCollapsed, setIsTrendingCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [trendingTimeframe, setTrendingTimeframe] = useState("24H");
  const [networkToggles, setNetworkToggles] = useState<Record<string, boolean>>(
    () => Object.fromEntries(TRENDING_NETWORKS.map((n) => [n.id, true]))
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--navbar-height",
      isTrendingCollapsed ? HEADER_HEIGHT_COLLAPSED : HEADER_HEIGHT_EXPANDED
    );
    return () => {
      document.documentElement.style.removeProperty("--navbar-height");
    };
  }, [isTrendingCollapsed]);

  return (
    <header className="z-[100] fixed top-0 left-0 right-0 flex flex-col bg-genius-indigo shrink-0">
      {/* Top row – always visible (collapsed = only this row) */}
      <div className="flex justify-between items-center border-b border-genius-blue px-4 py-2.5">
        <div className="flex items-center gap-3 pl-2">
          <Link href="/">
            <div
              className="relative overflow-hidden -translate-y-[0.05rem]"
              style={{ width: 24, height: 25, minWidth: 24, minHeight: 25 }}
            >
              <Image
                src="/static/genius-advanced.svg"
                alt="Genius"
                width={24}
                height={25}
                className="absolute top-0 left-0"
                loading="eager"
              />
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {MAIN_NAV_ITEMS.slice(0, 7).map((item) => (
              <div key={item.href} className="relative">
                <Link href={item.href}>
                  <div className="text-sm px-2.5 py-1 rounded-sm hover:text-genius-pink transition-colors flex items-center gap-1 hover:bg-genius-pink/20">
                    {item.label}
                  </div>
                </Link>
              </div>
            ))}

            {/* Airdrop pill */}
            <div className="relative">
              <Link href={MAIN_NAV_ITEMS[7]?.href ?? "/points/you"}>
                <div className="text-sm px-2.5 py-1 rounded-sm hover:text-genius-pink transition-colors flex items-center gap-1">
                  <div className="flex items-center gap-2 relative h-2 w-2 cursor-pointer">
                    <div className="cursor-pointer z-999 absolute w-[100px] h-[20px] mx-auto flex max-w-lg items-center justify-center rounded-full">
                      <div className="relative z-10 flex w-full cursor-pointer items-center overflow-hidden rounded-full border border-genius-pink/20 p-[1.5px]">
                        <div className="animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(#FFA3C8_20deg,transparent_120deg)]" />
                        <div className="text-sm relative z-20 flex w-full rounded-full bg-linear-to-b from-genius-blue to-genius-indigo px-2 py-1.5 gap-2 items-center">
                          <div className="relative overflow-hidden" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18 }}>
                            <Image
                              src="/static/genius-advanced.svg"
                              alt="Genius"
                              width={18}
                              height={18}
                              className="absolute top-0 left-0"
                              loading="eager"
                            />
                          </div>
                          Airdrop
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <GlobalSearch />
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 bg-transparent p-2"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" aria-hidden />
          </button>

          <div className="flex items-center border border-genius-blue rounded-sm">
            <div className="flex items-center gap-2 py-[6px] px-2 hover:bg-genius-blue cursor-pointer transition-colors">
              <ClipboardList className="w-4 h-4 cursor-pointer" aria-hidden />
            </div>
          </div>

          <input id="search-input" placeholder="Search" className="hidden" readOnly aria-hidden />

        </div>
      </div>

      {/* Trending row – visible by default, can be collapsed via toggle */}
      <div
        className={`flex flex-col bg-genius-indigo overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isTrendingCollapsed
            ? "max-h-0 min-h-0 opacity-0 pointer-events-none"
            : "max-h-[500px] min-h-9 opacity-100"
        }`}
      >
        <div className="h-full flex items-center border-b border-genius-blue min-h-9 w-full">
          <div className="flex items-center gap-2.5 pl-3 shrink-0">
          <div className="group relative h-full">
            <div className="hover:opacity-70 transition-opacity cursor-pointer text-genius-cream">
              <TrendingFlameIcon />
            </div>
            <div className="z-10 absolute left-0 right-0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto bg-genius-indigo border border-genius-blue rounded-md max-h-[450px] overflow-y-auto genius-shadow top-[calc(100%+1rem)] w-fit p-3">
              <div className="flex flex-col gap-3 min-w-[390px]">
                <div className="text-xs">Trending</div>
                <button
                  type="button"
                  className="p-4 whitespace-nowrap lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 bg-transparent flex gap-2 border border-genius-blue items-center rounded-sm text-sm px-2 py-[4.5px] w-full justify-between"
                  onClick={() => setTrendingTimeframe((t) => (t === "24H" ? "7D" : t === "7D" ? "30D" : "24H"))}
                >
                  <span>{trendingTimeframe}</span>
                  <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
                </button>
                <div className="flex flex-col gap-3">
                  {TRENDING_NETWORKS.map((net) => (
                    <div key={net.id} className="flex flex-row items-center justify-between">
                      <div className="flex flex-row items-center gap-2">
                        <div className="relative overflow-hidden rounded-full" style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }}>
                          <Image src={net.logo} alt={net.name} width={20} height={20} className="absolute top-0 left-0 object-cover" unoptimized />
                        </div>
                        <div className="text-xs">{net.name}</div>
                      </div>
                      <Switch
                        checked={networkToggles[net.id]}
                        onCheckedChange={(checked) =>
                          setNetworkToggles((prev) => ({ ...prev, [net.id]: checked }))
                        }
                        aria-label={`Toggle ${net.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <StarIcon />
          <ClockIcon />
        </div>
        <div className="relative h-full w-[calc(100%-5rem)] flex items-center min-w-0 flex-1">
          <div className="absolute z-10 left-0 top-0 bottom-0 w-4 bg-linear-to-r from-genius-indigo to-transparent pointer-events-none" />
          <div className="absolute z-10 right-0 top-0 bottom-0 w-4 bg-linear-to-l from-genius-indigo to-transparent pointer-events-none" />

          {loading && displayTokens.length === 0 ? (
            <div className="w-full flex items-center gap-2 px-2 text-[11px] text-genius-cream/60">
              <div className="w-3 h-3 border-2 border-genius-pink/40 border-t-genius-pink rounded-full animate-spin" />
              <span>Loading trending…</span>
            </div>
          ) : displayTokens.length === 0 ? (
            <div className="w-full flex items-center px-2 text-[11px] text-genius-cream/50">
              No trending tokens
            </div>
          ) : (
            <div className="w-full flex items-center gap-1 overflow-x-auto px-2 py-[0.27rem] custom-scrollbar">
              {displayTokens.map((token) => {
                const isUp = token.change24h >= 0;
                return (
                  <Link
                    key={`${token.chainId}-${token.pairAddress}`}
                    href={`/${token.chainId}/${token.pairAddress}`}
                    className="flex items-center gap-1 hover:bg-genius-blue hover:text-genius-cream rounded-sm px-1.5 py-0.5 transition-all shrink-0"
                  >
                    <div className="relative rounded-sm w-4 h-4 overflow-hidden object-cover shrink-0">
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center text-[9px] bg-genius-blue/40 rounded-sm w-full h-full">
                          {token.symbol[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="text-sm truncate max-w-[100px]">{token.symbol}</div>
                    <div className="text-sm text-genius-cream/50 text-center shrink-0" style={{ width: 57 }}>
                      ${formatNumber(token.marketCap)}
                    </div>
                    <div
                      className={`px-1 rounded-[2px] flex justify-center items-center gap-1 shrink-0 ${
                        isUp ? "bg-genius-green/20 text-genius-green" : "bg-genius-red/20 text-genius-red"
                      }`}
                      style={{ width: 56 }}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        className={`min-h-2 min-w-2 h-2 w-2 ${isUp ? "" : "rotate-180"}`}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M256 32 20 464h472L256 32z" />
                      </svg>
                      <div className="text-[10px] items-center">
                        {Math.abs(token.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Expand/collapse toggle */}
      <button
        type="button"
        onClick={() => setIsTrendingCollapsed((prev) => !prev)}
        className="absolute -bottom-2 left-5 z-10 bg-genius-indigo border border-genius-blue rounded-sm px-2 py-0.5 hover:bg-genius-blue transition-colors duration-300 ease-in-out cursor-pointer flex items-center justify-center"
        aria-label={isTrendingCollapsed ? "Show trending tokens" : "Hide trending tokens"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3 h-3 text-genius-cream transition-transform duration-300 ${
            isTrendingCollapsed ? "" : "rotate-180"
          }`}
          aria-hidden
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
