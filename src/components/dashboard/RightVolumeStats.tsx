"use client";

import type { ReactNode } from "react";
import { usePairMetadata } from "@/hooks/usePairMetadata";
import { formatNumber } from "@/lib/utils";

function StatColumn({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: ReactNode;
  align?: "left" | "center" | "right";
}) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "";
  return (
    <div className={`flex flex-col gap-1 ${alignClass}`}>
      <span className="uppercase whitespace-nowrap">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function RightVolumeStats({ chainId, pairAddress }: { chainId: string; pairAddress: string }) {
  const { metadata, loading } = usePairMetadata(chainId, pairAddress);

  const vol24h = metadata?.volume?.h24 ?? 0;
  const buys = metadata?.txns?.h24?.buys ?? 0;
  const sells = metadata?.txns?.h24?.sells ?? 0;
  const totalTxns = buys + sells;

  const buyRatio = totalTxns > 0 ? buys / totalTxns : 0.5;
  const buyVol = vol24h * buyRatio;
  const sellVol = vol24h * (1 - buyRatio);

  // Fallback to price change since dex api doesn't give vol change directly
  const volChange = metadata?.priceChange?.h24 ?? 0;

  const stats = [
    {
      label: "Volume 24h",
      value: <span className="text-genius-cream text-sm">{loading ? "--" : `$${formatNumber(vol24h)}`}</span>,
      align: "left" as const,
    },
    {
      label: "Buys",
      value: (
        <span className="text-genius-green tracking-normal">
          {loading ? "--" : buys}{" "}
          <span className="text-genius-green/70">/ {loading ? "--" : `$${formatNumber(buyVol)}`}</span>
        </span>
      ),
      align: "center" as const,
    },
    {
      label: "Sells",
      value: (
        <span className="text-genius-red tracking-normal">
          {loading ? "--" : sells}{" "}
          <span className="text-genius-red/70">/ {loading ? "--" : `$${formatNumber(sellVol)}`}</span>
        </span>
      ),
      align: "center" as const,
    },
    {
      label: "Price Change (24h)",
      value: (
        <span className={volChange >= 0 ? "text-genius-green" : "text-genius-red"}>
          {loading ? "--" : `${volChange >= 0 ? "+" : ""}${volChange.toFixed(2)}%`}
        </span>
      ),
      align: "right" as const,
    },
  ];

  return (
    <div className="flex flex-col font-sans px-4 pt-4 pb-0 border-b border-genius-blue">
      <div className="flex items-center justify-between text-[11px] font-bold text-genius-cream/60 tracking-wider">
        {stats.map((s) => (
          <StatColumn key={s.label} label={s.label} value={s.value} align={s.align} />
        ))}
      </div>

      <div className="flex gap-1 mt-3 mb-4 h-[3px] rounded-full overflow-hidden w-full">
        <div className="bg-genius-green" style={{ width: `${buyRatio * 100}%` }} />
        <div className="bg-genius-red" style={{ width: `${(1 - buyRatio) * 100}%` }} />
      </div>
    </div>
  );
}
