"use client";

import { useMemo } from "react";
import type { DexPair } from "@/lib/dexscreener";
import type { TimeframeItem, TimeframeKey, TokenStatsData } from "@/types";
import { formatNumber, formatPriceChange, formatCompactNumber } from "@/lib/utils";

const TIMEFRAME_LABELS: Record<TimeframeKey, string> = {
  m5: "5M",
  h1: "1H",
  h6: "4H",
  h24: "24H",
};

function getStatsForTimeframe(
  metadata: DexPair | null,
  loading: boolean,
  key: TimeframeKey
): TokenStatsData {
  const vol = metadata?.volume?.[key] ?? 0;
  const buys = metadata?.txns?.[key]?.buys ?? 0;
  const sells = metadata?.txns?.[key]?.sells ?? 0;
  const total = buys + sells;
  const buyRatio = total > 0 ? buys / total : 0.5;
  const buyVol = vol * buyRatio;
  const sellVol = vol * (1 - buyRatio);
  const priceChg = metadata?.priceChange?.[key] ?? 0;

  return {
    volumeLabel: `${TIMEFRAME_LABELS[key]} VOLUME`,
    volumeValue: loading ? "--" : `$${formatNumber(vol)}`,
    buysCount: loading ? "--" : formatCompactNumber(buys),
    buysValue: loading ? "--" : `$${formatNumber(buyVol)}`,
    sellsCount: loading ? "--" : formatCompactNumber(sells),
    sellsValue: loading ? "--" : `$${formatNumber(sellVol)}`,
    volChange: loading ? "--" : formatPriceChange(metadata?.priceChange?.[key]),
    volChangePositive: priceChg >= 0,
    buyBarPercent: total > 0 ? buyRatio * 100 : 50,
  };
}

export function useTokenPageStats(
  metadata: DexPair | null,
  loading: boolean,
  selectedTimeframe: TimeframeKey = "h24"
) {
  return useMemo(() => {
    const stats = getStatsForTimeframe(metadata, loading, selectedTimeframe);

    const timeframes: TimeframeItem[] = [
      { key: "m5", label: "5M", value: formatPriceChange(metadata?.priceChange?.m5), positive: (metadata?.priceChange?.m5 ?? 0) >= 0, active: selectedTimeframe === "m5" },
      { key: "h1", label: "1H", value: formatPriceChange(metadata?.priceChange?.h1), positive: (metadata?.priceChange?.h1 ?? 0) >= 0, active: selectedTimeframe === "h1" },
      { key: "h6", label: "4H", value: formatPriceChange(metadata?.priceChange?.h6), positive: (metadata?.priceChange?.h6 ?? 0) >= 0, active: selectedTimeframe === "h6" },
      { key: "h24", label: "24H", value: formatPriceChange(metadata?.priceChange?.h24), positive: (metadata?.priceChange?.h24 ?? 0) >= 0, active: selectedTimeframe === "h24" },
    ];

    return { stats, timeframes };
  }, [metadata, loading, selectedTimeframe]);
}
