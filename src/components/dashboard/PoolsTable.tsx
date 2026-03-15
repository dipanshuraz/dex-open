"use client";

import { usePools } from "@/hooks/usePools";
import type { Pool } from "@/types";
import { useNow } from "@/hooks/useNow";
import { formatNumber } from "@/lib/utils";
import { getDexIcon } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { CopyIcon } from "@/components/icons/CopyIcon";
import { ExternalLink } from "lucide-react";
import { TableEmptyState } from "./TableEmptyState";

const POOLS_COLUMNS = [
  "Pool",
  "Pair",
  "Price/Mark Price Diff",
  "Backing Asset Liquidity",
  "Volume (24h)",
  "Age",
  "Buy / Sell",
] as const;

function CopyAndLinkActions({
  copyValue,
  href,
  copyTitle,
  linkLabel,
  copyClassName,
}: {
  copyValue: string;
  href: string;
  copyTitle: string;
  linkLabel: string;
  copyClassName?: string;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(copyValue)}
        className={`text-genius-cream/50 hover:text-genius-cream transition-colors ${copyClassName ?? ""}`}
        title={copyTitle}
      >
        <CopyIcon className="w-3 h-3" />
      </button>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-genius-cream/50 hover:text-genius-cream transition-colors"
        aria-label={linkLabel}
      >
        <ExternalLink className="w-3 h-3" strokeWidth={2} />
      </a>
    </>
  );
}

function PoolRow({ pool, now }: { pool: Pool; now: number }) {
  const seconds = Math.floor((now - pool.age) / 1000);
  let ageStr;
  
  if (seconds < 60) {
    ageStr = `${seconds}s`;
  } else if (seconds < 3600) {
    ageStr = `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    ageStr = `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  } else {
    const d = Math.floor(seconds / 86400);
    const y = Math.floor(d / 365);
    if (y > 0) {
        ageStr = `${y}y, ${d % 365}d, ${Math.floor((seconds % 86400) / 3600)}h`;
    } else {
        ageStr = `${d}d, ${Math.floor((seconds % 86400) / 3600)}h`;
    }
  }

  const dexIcon = getDexIcon(pool.dex);
  const dexName = pool.dex.charAt(0).toUpperCase() + pool.dex.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-7 items-center px-4 py-2.5 hover:bg-genius-blue/40 transition-colors border-b border-genius-blue text-sm leading-5 font-medium font-sans text-genius-cream overflow-hidden gap-x-3 w-full max-w-full"
    >
      <div className="flex items-center gap-2 truncate w-full text-left">
        <span className="text-lg">{dexIcon}</span>
        <span>{dexName}</span>
        <CopyAndLinkActions
          copyValue={pool.pairAddress}
          href={pool.url}
          copyTitle="Copy pool address"
          linkLabel="Open pool in explorer"
          copyClassName="ml-1"
        />
      </div>

      <div className="flex items-center gap-2 truncate w-full text-left">
        <span>{pool.pair}</span>
        <CopyAndLinkActions
          copyValue={pool.pairAddress}
          href={pool.url}
          copyTitle="Copy pair address"
          linkLabel="Open pair in explorer"
        />
      </div>

      <div className="truncate w-full text-left text-genius-cream/60">
        Coming Soon
      </div>

      <div className="truncate w-full text-left">
        {formatNumber(pool.liquidity)}
      </div>

      <div className="truncate w-full text-left">
        ${formatNumber(pool.volume)}
      </div>

      <div className="truncate w-full text-left text-genius-cream/70">
        {ageStr}
      </div>

      <div className="truncate w-full text-left text-genius-cream/60">
        Coming Soon
      </div>
    </motion.div>
  );
}

export function PoolsTable({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
}) {
  const { pools, loading } = usePools(chainId, tokenAddress);
  const now = useNow();

  return (
    <div className="absolute inset-0 flex flex-col font-sans bg-genius-indigo text-genius-cream">
      <div className="sticky top-0 z-10 w-full shrink-0">
        <div className="grid grid-cols-7 w-full px-5 py-1.5 bg-genius-blue/50 items-center gap-2">
          {POOLS_COLUMNS.map((col) => (
            <div key={col} className="text-genius-cream/60 whitespace-nowrap text-xs">{col}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {loading && pools.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-genius-cream/60 text-xs">
            Loading pools...
          </div>
        ) : pools.length === 0 ? (
          <TableEmptyState />
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {pools.map((pool: Pool) => (
                <PoolRow key={pool.pairAddress + pool.dex} pool={pool} now={now} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
