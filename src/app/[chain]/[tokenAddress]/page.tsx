"use client";

import { use, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { TabbedPanel } from "@/components/dashboard/TabbedPanel";
import { TradingChart } from "@/components/dashboard/TradingChart";
import { AdvancedPanelTokenStats } from "@/components/dashboard/AdvancedPanelTokenStats";
import { TokenStats } from "@/components/dashboard/TokenStats";
import { TradingControls } from "@/components/dashboard/TradingControls";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { useMarkets } from "@/hooks/useMarkets";
import { useResizePanel } from "@/hooks/useResizePanel";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTokenPageStats } from "@/hooks/useTokenPageStats";
import { validateTokenRoute } from "@/lib/validation";
import { SIDEBAR_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TimeframeKey } from "@/types";

interface Props {
  params: Promise<{ chain: string; tokenAddress: string }>;
}

export default function TokenPage({ params }: Props) {
  const { chain, tokenAddress } = use(params);

  if (!validateTokenRoute(chain, tokenAddress)) {
    notFound();
  }

  const searchParams = useSearchParams();
  const initialDexId = searchParams?.get("pool") ?? undefined;
  const { selected } = useMarkets(chain, tokenAddress, initialDexId);
  const selectedPairAddress = selected?.pairAddress ?? tokenAddress;

  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeKey>("h24");
  const chartPanelContainerRef = useRef<HTMLDivElement>(null);
  const { percent: chartHeightPercent, handleResizeStart } = useResizePanel({
    containerRef: chartPanelContainerRef,
  });

  const { metadata, loading } = usePairMetadata(chain, selectedPairAddress);
  const { stats, timeframes } = useTokenPageStats(metadata, loading, selectedTimeframe);

  const documentTitle = metadata
    ? `${metadata.baseToken.symbol} • $${Number(metadata.priceUsd).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })} • Buy ${metadata.baseToken.symbol} on Genius • Trade Crypto Like a Genius`
    : null;
  useDocumentTitle(documentTitle);

  return (
    <div className="relative h-full min-h-0 bg-background text-white selection:bg-purple-500/30 font-sans flex flex-col overflow-hidden">
      <section className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        <div
          ref={chartPanelContainerRef}
          className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden"
        >
          <div className="shrink-0 min-w-0 overflow-hidden">
            <TopBar chainId={chain} tokenAddress={tokenAddress} />
          </div>

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

          <div
            className="w-full relative min-h-0 overflow-hidden"
            style={{ flex: `${100 - chartHeightPercent} 1 0` }}
          >
            <TabbedPanel
              chainId={chain}
              pairAddress={selectedPairAddress}
              tokenAddress={tokenAddress}
              marketCap={metadata?.marketCap ?? metadata?.fdv}
            />
          </div>
        </div>

        <div
          className="relative shrink-0 h-full min-h-0 overflow-visible transition-[width] duration-300 ease-in-out"
          style={{ width: isRightCollapsed ? 0 : SIDEBAR_WIDTH, minWidth: isRightCollapsed ? 0 : undefined }}
        >
          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 flex flex-col overflow-y-auto border-l border-genius-blue bg-genius-indigo custom-scrollbar transition-all duration-300 ease-in-out",
              isRightCollapsed && "opacity-0 pointer-events-none border-l-0"
            )}
            style={{ width: isRightCollapsed ? 0 : SIDEBAR_WIDTH, maxWidth: isRightCollapsed ? 0 : SIDEBAR_WIDTH }}
          >
            <div className="flex flex-col gap-0 shrink-0 min-h-0">
              <AdvancedPanelTokenStats
                stats={stats}
                timeframes={timeframes}
                onTimeframeSelect={setSelectedTimeframe}
              />
              <TradingControls />
            </div>
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <TokenStats chainId={chain} tokenAddress={tokenAddress} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsRightCollapsed((prev) => !prev)}
          className="absolute top-1/2 -translate-y-1/2 z-40 bg-genius-indigo border border-genius-blue rounded-sm px-1.5 py-1 hover:bg-genius-blue transition-colors duration-300 ease-in-out"
          style={{ right: isRightCollapsed ? 0 : SIDEBAR_WIDTH }}
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
            className={cn("w-3 h-3 text-genius-cream transition-transform", isRightCollapsed && "rotate-180")}
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </section>
    </div>
  );
}
