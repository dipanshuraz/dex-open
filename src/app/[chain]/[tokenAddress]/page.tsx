"use client";

import { use, useState } from "react";
import { TopBar } from "@/components/dashboard/TopBar";
import { TabbedPanel } from "@/components/dashboard/TabbedPanel";
import { TradingChart } from "@/components/dashboard/TradingChart";
import { RightVolumeStats } from "@/components/dashboard/RightVolumeStats";
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

  // Lifted state: tracks which pool pair is selected via the MarketSelector in TopBar
  const [selectedPairAddress, setSelectedPairAddress] = useState<string>(tokenAddress);

  return (
    <div className="relative min-h-screen bg-[#070815] text-white selection:bg-purple-500/30 font-sans flex flex-col overflow-hidden">
      {/* Background glow, matching the assets page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header bar */}
      <div className="relative z-30">
        <TopBar
          chainId={chain}
          tokenAddress={tokenAddress}
          onPoolSelect={setSelectedPairAddress}
        />
      </div>

      {/* Main Grid Layout */}
      <main className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Content Area (Chart + Trading Feed) */}
        <div className="flex-1 flex flex-col min-w-0 p-2 gap-2 overflow-hidden">
          {/* Candlestick Chart - fixed viewport height */}
          <div className="h-[40vh] w-full relative min-h-[220px]">
            <TradingChart chainId={chain} tokenAddress={tokenAddress} />
          </div>

          {/* Trades / Holders / Pools tabs - fixed viewport height */}
          <div className="h-[45vh] w-full relative min-h-0">
            <TabbedPanel
              chainId={chain}
              pairAddress={selectedPairAddress}
              tokenAddress={tokenAddress}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[340px] border-l border-white/5 bg-[#0C0814]/90 backdrop-blur flex flex-col overflow-y-auto overflow-x-hidden p-0 custom-scrollbar">
          <RightVolumeStats chainId={chain} pairAddress={selectedPairAddress} />
          <TradingControls />
          <TokenStats chainId={chain} tokenAddress={tokenAddress} />
        </div>
      </main>
    </div>
  );
}
