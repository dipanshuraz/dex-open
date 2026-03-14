"use client";

import { use, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { TabbedPanel } from "@/components/dashboard/TabbedPanel";
import { TradingChart } from "@/components/dashboard/TradingChart";
import { AdvancedPanelTokenStats } from "@/components/dashboard/AdvancedPanelTokenStats";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { useMarkets } from "@/hooks/useMarkets";
import { formatNumber } from "@/lib/utils";
import { TokenStats } from "@/components/dashboard/TokenStats";
import { notFound } from "next/navigation";
import { SUPPORTED_CHAINS } from "@/lib/config";
import { TradingControls } from "@/components/dashboard/TradingControls";

interface Props {
  params: Promise<{ chain: string; tokenAddress: string }>;
}

export default function TokenPage({ params }: Props) {
  const { chain, tokenAddress } = use(params);

  // Validate route parameters
  const isValidChain = SUPPORTED_CHAINS.includes(chain.toLowerCase());
  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenAddress);

  if (!isValidChain || !isValidAddress) {
    notFound();
  }

  // Auto-selected pool (best liquidity); no pool selector UI
  const [selectedPairAddress, setSelectedPairAddress] = useState<string>(tokenAddress);
  const searchParams = useSearchParams();
  const initialDexId = searchParams?.get("pool") ?? undefined;
  const { selected } = useMarkets(chain, tokenAddress, initialDexId);
  useEffect(() => {
    if (selected?.pairAddress) setSelectedPairAddress(selected.pairAddress);
  }, [selected?.pairAddress]);
  // Controls the visibility of the right sidebar panel
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  // Resizable chart vs trades panel: chart height as % of the left column (20–80%)
  const [chartHeightPercent, setChartHeightPercent] = useState(55);
  const chartPanelContainerRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = (startClientY: number, startPercent: number) => {
    const container = chartPanelContainerRef.current;
    if (!container) return;
    const move = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const deltaY = e.clientY - startClientY;
      const deltaPercent = (deltaY / rect.height) * 100;
      const next = Math.min(80, Math.max(20, startPercent + deltaPercent));
      setChartHeightPercent(next);
    };
    const stop = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  };

  const { metadata, loading } = usePairMetadata(chain, selectedPairAddress);

  // Tab title: "BTC • $70,724.8755 • Buy BTC on Genius • Trade Crypto Like a Genius"
  useEffect(() => {
    if (!metadata) return;
    const symbol = metadata.baseToken.symbol;
    const priceStr = Number(metadata.priceUsd).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    document.title = `${symbol} • $${priceStr} • Buy ${symbol} on Genius • Trade Crypto Like a Genius`;
    return () => {
      document.title = "Web3 Dashboard";
    };
  }, [metadata]);

  const formatPriceChange = (n: number | undefined) =>
    n == null ? "--" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n));

  // 24H stats (default visible in panel, matching reference)
  const vol24h = metadata?.volume?.h24 ?? 0;
  const buys24h = metadata?.txns?.h24?.buys ?? 0;
  const sells24h = metadata?.txns?.h24?.sells ?? 0;
  const total24h = buys24h + sells24h;
  const buyRatio24h = total24h > 0 ? buys24h / total24h : 0.5;
  const buyVol24h = vol24h * buyRatio24h;
  const sellVol24h = vol24h * (1 - buyRatio24h);
  const vol5m = metadata?.volume?.m5 ?? 0;
  const volChangePct = vol24h > 0 && vol5m > 0 ? ((vol5m * 288 - vol24h) / vol24h) * 100 : 0;

  const timeframes = [
    { label: "5m", value: formatPriceChange(metadata?.priceChange?.m5), positive: (metadata?.priceChange?.m5 ?? 0) >= 0 },
    { label: "1h", value: formatPriceChange(metadata?.priceChange?.h1), positive: (metadata?.priceChange?.h1 ?? 0) >= 0 },
    { label: "4h", value: formatPriceChange(metadata?.priceChange?.h6), positive: (metadata?.priceChange?.h6 ?? 0) >= 0, active: true },
    { label: "24h", value: formatPriceChange(metadata?.priceChange?.h24), positive: (metadata?.priceChange?.h24 ?? 0) >= 0 },
  ];

  return (
    <div className="relative h-full min-h-0 bg-[#070815] text-white selection:bg-purple-500/30 font-sans flex flex-col overflow-hidden">
      {/* Main Grid Layout */}
      <main className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        {/* Left Content Area (Token bar + Chart + Resize Handle + Trades Panel) */}
        <div
          ref={chartPanelContainerRef}
          className="flex-1 flex flex-col min-h-0 min-w-0 p-0 gap-0 overflow-hidden bg:transparent dark:bg-transparent"
        >
          {/* Token bar – left panel only, above chart */}
          <div className="shrink-0 min-w-0 rounded-t-lg overflow-hidden border-genius-blue border-b-0">
            <TopBar chainId={chain} tokenAddress={tokenAddress} />
          </div>

          {/* Candlestick Chart - height controlled by resize handle (flex ratio) */}
          <div
            className="w-full relative overflow-hidden min-h-0"
            style={{
              flex: `${chartHeightPercent} 1 0`,
              minHeight: 120,
              maxHeight: "80%",
            }}
          >
            <TradingChart
              chainId={chain}
              tokenAddress={tokenAddress}
              resizeTrigger={chartHeightPercent}
            />
          </div>

          {/* Resize handle – drag to change chart vs table height (joined: one increases, other decreases) */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Resize chart and trades panel"
            className="resizer min-h-1 w-full bg-genius-blue cursor-ns-resize hover:bg-genius-pink/30 transition-colors flex items-center justify-center shrink-0"
            style={{ touchAction: "none" }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleResizeStart(e.clientY, chartHeightPercent);
            }}
          >
            <div className="w-4 h-0.5 bg-genius-cream/30 rounded-full" aria-hidden />
          </div>

          {/* Trades / Holders / Pools tabs - takes remaining height (flex ratio) */}
          <div
            className="w-full relative min-h-0 rounded-b-lg overflow-hidden"
            style={{
              flex: `${100 - chartHeightPercent} 1 0`,
            }}
          >
            <TabbedPanel
              chainId={chain}
              pairAddress={selectedPairAddress}
              tokenAddress={tokenAddress}
              marketCap={metadata?.marketCap ?? metadata?.fdv}
            />
          </div>
        </div>

        {/* Right Sidebar – collapsible advanced panel wrapper.
            When collapsed, wrapper width is 0 so the left panel can occupy full width. */}
        <div
          className={`relative shrink-0 h-full min-h-0 overflow-visible transition-[width] duration-300 ease-in-out ${
            isRightCollapsed ? "w-0 min-w-0" : "w-[350px] min-w-0"
          }`}
        >
          {/* Sidebar content – fills wrapper when expanded */}
          <div
            className={`absolute right-0 top-0 bottom-0 flex flex-col overflow-y-auto min-w-0 w-[350px] max-w-[350px] border-l border-genius-blue bg-genius-indigo custom-scrollbar transition-all duration-300 ease-in-out ${
              isRightCollapsed ? "max-w-0 opacity-0 pointer-events-none border-l-0" : "opacity-100"
            }`}
          >
            <div className="flex flex-col gap-0 shrink-0 min-h-0">
              <AdvancedPanelTokenStats
                stats={{
                  volumeLabel: "4H VOLUME",
                  volumeValue: loading ? "--" : `$${formatNumber(vol24h)}`,
                  buysCount: loading ? "--" : formatCount(buys24h),
                  buysValue: loading ? "--" : `$${formatNumber(buyVol24h)}`,
                  sellsCount: loading ? "--" : formatCount(sells24h),
                  sellsValue: loading ? "--" : `$${formatNumber(sellVol24h)}`,
                  volChange: loading ? "--" : `${volChangePct >= 0 ? "+" : ""}${volChangePct.toFixed(2)}%`,
                  volChangePositive: volChangePct >= 0,
                  buyBarPercent: total24h > 0 ? buyRatio24h * 100 : 50,
                }}
                timeframes={timeframes}
              />
              <TradingControls />
            </div>
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <TokenStats chainId={chain} tokenAddress={tokenAddress} />
            </div>
          </div>
        </div>

        {/* Toggle pinned at the boundary between main content and sidebar.
            When collapsed, it slides to the right edge (only icon visible). */}
        <button
          type="button"
          onClick={() => setIsRightCollapsed((prev) => !prev)}
          className="absolute top-1/2 -translate-y-1/2 z-40 bg-genius-indigo border border-genius-blue rounded-sm px-1.5 py-1 hover:bg-genius-blue transition-colors duration-300 ease-in-out"
          style={{ right: isRightCollapsed ? 0 : 350 }}
          aria-label={isRightCollapsed ? "Show side panel" : "Hide side panel"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3 h-3 text-genius-cream transition-transform ${
              isRightCollapsed ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </main>
    </div>
  );
}
