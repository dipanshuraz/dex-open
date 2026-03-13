"use client";

import { useState } from "react";
import { TradesTable } from "./TradesTable";
import { HoldersTable } from "./HoldersTable";
import { PoolsTable } from "./PoolsTable";
import { motion } from "framer-motion";

type Tab = "trades" | "holders" | "pools";

const TABS: { key: Tab; label: string }[] = [
  { key: "trades", label: "Trades" },
  { key: "holders", label: "Holders" },
  { key: "pools", label: "Pools" },
];

export function TabbedPanel({
  chainId,
  tokenAddress,
  pairAddress,
}: {
  chainId: string;
  tokenAddress: string;
  pairAddress: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("trades");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B0C10] transition-colors duration-300">
      {/* Tab Headers */}
      <div className="flex px-4 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-[#0D0B14]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-4 text-xs font-bold transition-all relative ${
              activeTab === tab.key
                ? "text-black dark:text-white"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "trades" && (
          <TradesTable chainId={chainId} tokenAddress={tokenAddress} />
        )}
        {activeTab === "holders" && (
          <HoldersTable chainId={chainId} tokenAddress={tokenAddress} />
        )}
        {activeTab === "pools" && (
          <PoolsTable chainId={chainId} tokenAddress={tokenAddress} />
        )}
      </div>
    </div>
  );
}
