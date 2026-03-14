"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries } from "lightweight-charts";
import { useChartData, OHLCCandle } from "@/hooks/useChartData";
import { useTheme } from "next-themes";
import { formatChartPrice } from "@/lib/utils";

function getChartTheme() {
  if (typeof document === "undefined") return { isDark: true, colors: {} };
  const root = document.documentElement;
  const get = (v: string) => getComputedStyle(root).getPropertyValue(v).trim();
  return {
    isDark: true,
    colors: {
      bg: get("--chart-bg") || "#09001a",
      text: get("--chart-text") || "#a3b1d1",
      grid: get("--chart-grid") || "rgba(95, 106, 164, 0.25)",
      border: get("--chart-border") || "rgba(148, 163, 253, 0.35)",
      crosshair: get("--chart-crosshair") || "#9f7aea",
      crosshairBg: get("--chart-crosshair-bg") || "#1a1625",
      up: get("--chart-up") || "#00c46a",
      down: get("--chart-down") || "#ff4b5c",
      wickUp: get("--chart-wick-up") || "#00e387",
      wickDown: get("--chart-wick-down") || "#ff6473",
    },
  };
}

const TickMarkType = {
  Year: 0,
  Month: 1,
  DayOfMonth: 2,
  Time: 3,
  TimeWithSeconds: 4,
} as const;

function timeToDate(time: number | string): Date {
  if (typeof time === "number") return new Date(time * 1000);
  const s = String(time);
  if (s.length === 8) {
    return new Date(
      parseInt(s.slice(0, 4), 10),
      parseInt(s.slice(4, 6), 10) - 1,
      parseInt(s.slice(6, 8), 10)
    );
  }
  return new Date((time as unknown as number) * 1000);
}

function tickMarkFormatter(time: number | string, tickMarkType: number, _locale: string): string | null {
  const d = timeToDate(time);
  switch (tickMarkType) {
    case TickMarkType.DayOfMonth: return String(d.getDate());
    case TickMarkType.Time:
    case TickMarkType.TimeWithSeconds: {
      const h = d.getHours(); const m = d.getMinutes();
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    case TickMarkType.Month: return d.toLocaleDateString(_locale, { month: "short" }).slice(0, 3);
    case TickMarkType.Year: return String(d.getFullYear()).slice(-2);
    default: return null;
  }
}

const MAINFRAME_COINS: Record<string, string> = {
  "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf": "coinbase-wrapped-btc",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "wrapped-bitcoin",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ethereum",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "usd-coin",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "tether",
};

// ── Period options ──
const PERIODS = [
  { label: "1D", days: 1   },
  { label: "1W", days: 7   },
  { label: "1M", days: 30  },
  { label: "3M", days: 90  },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
] as const;

// ── Update frequency options ──
const FREQUENCIES = [
  { label: "1s", ms: 1_000  },
  { label: "1m", ms: 60_000 },
] as const;

export function TradingChart({
  chainId,
  tokenAddress,
  resizeTrigger,
}: {
  chainId: string;
  tokenAddress: string;
  resizeTrigger?: number;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const candlesRef = useRef<OHLCCandle[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const applySize = useCallback(() => {
    const el = chartContainerRef.current;
    if (!chartRef.current || !el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    chartRef.current.applyOptions({ width: w, height: h });
  }, []);

  const [activePeriod, setActivePeriod] = useState<number>(7);
  const [activeFreq, setActiveFreq] = useState<number>(60_000);
  const [pricing, setPricing] = useState<{ o: number; h: number; l: number; c: number; diff: number; pct: number } | null>(null);

  const coingeckoId = MAINFRAME_COINS[tokenAddress.toLowerCase()] || "bitcoin";
  const { candles, loading } = useChartData(coingeckoId, activePeriod, activeFreq);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const c = getChartTheme().colors;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? c.bg : "#ffffff" },
        textColor: isDark ? c.text : "#333333",
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? c.grid : "rgba(0,0,0,0.04)" },
        horzLines: { color: isDark ? c.grid : "rgba(0,0,0,0.04)" },
      },
      crosshair: {
        vertLine: {
          color: isDark ? c.crosshair : "#5F6472",
          width: 1,
          style: 2,
          labelVisible: true,
          labelBackgroundColor: isDark ? c.crosshairBg : "#eef0f2",
        },
        horzLine: {
          color: isDark ? c.crosshair : "#5F6472",
          width: 1,
          style: 2,
          labelVisible: true,
          labelBackgroundColor: isDark ? c.crosshairBg : "#eef0f2",
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter,
        borderColor: isDark ? c.border : "rgba(0,0,0,0.1)",
        barSpacing: 12,
        minBarSpacing: 4,
      },
      rightPriceScale: {
        borderColor: isDark ? c.border : "rgba(0,0,0,0.1)",
        scaleMargins: { top: 0.15, bottom: 0.15 },
        autoScale: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: c.up,
      downColor: c.down,
      borderVisible: true,
      wickVisible: true,
      wickUpColor: c.wickUp,
      wickDownColor: c.wickDown,
      borderUpColor: c.wickUp,
      borderDownColor: c.wickDown,
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    chart.subscribeCrosshairMove((param) => {
      const currentCandles = candlesRef.current;
      if (!param.time || !param.seriesData.has(candleSeries)) {
        if (currentCandles.length > 0) {
          const last = currentCandles[currentCandles.length - 1];
          const first = currentCandles[0];
          const diff = last.close - first.open;
          setPricing({ o: last.open, h: last.high, l: last.low, c: last.close, diff, pct: (diff / first.open) * 100 });
        }
        return;
      }
      const data = param.seriesData.get(candleSeries) as any;
      if (data && typeof data.close === "number") {
        const first = currentCandles[0];
        if (first) {
          const diff = data.close - first.open;
          setPricing({ o: data.open, h: data.high, l: data.low, c: data.close, diff, pct: (diff / first.open) * 100 });
        }
      }
    });

    const handleWindowResize = () => applySize();
    window.addEventListener("resize", handleWindowResize);

    const ro = new ResizeObserver(() => applySize());
    ro.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      ro.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const c = getChartTheme().colors;
    chartRef.current.applyOptions({
      layout: {
        textColor: isDark ? c.text : "#333333",
        background: { type: ColorType.Solid, color: isDark ? c.bg : "#ffffff" },
      },
      grid: {
        vertLines: { color: isDark ? c.grid : "rgba(0,0,0,0.04)" },
        horzLines: { color: isDark ? c.grid : "rgba(0,0,0,0.04)" },
      },
      crosshair: {
        vertLine: { color: isDark ? c.crosshair : "#5F6472", labelBackgroundColor: isDark ? c.crosshairBg : "#eef0f2" },
        horzLine: { color: isDark ? c.crosshair : "#5F6472", labelBackgroundColor: isDark ? c.crosshairBg : "#eef0f2" },
      },
      timeScale: { borderColor: isDark ? c.border : "rgba(0,0,0,0.1)" },
      rightPriceScale: { borderColor: isDark ? c.border : "rgba(0,0,0,0.1)" },
    });
  }, [isDark]);

  useEffect(() => {
    candlesRef.current = candles;
    if (seriesRef.current && candles.length > 0) {
      seriesRef.current.setData(candles as any);
      chartRef.current?.timeScale().fitContent();
      setTimeout(() => {
        if (candles.length > 0) {
          const last = candles[candles.length - 1];
          const first = candles[0];
          const diff = last.close - first.open;
          setPricing({ o: last.open, h: last.high, l: last.low, c: last.close, diff, pct: (diff / first.open) * 100 });
        }
      }, 0);
    }
  }, [candles]);

  useEffect(() => {
    if (resizeTrigger == null) return;
    const id = requestAnimationFrame(() => applySize());
    return () => cancelAnimationFrame(id);
  }, [resizeTrigger, applySize]);

  return (
    <div className="w-full h-full min-h-0 relative rounded-lg overflow-hidden border border-genius-blue/40 bg-background font-sans flex flex-col">
      <div className="flex items-center h-10 px-4 gap-1 border-b border-genius-blue/30 bg-background z-10 shrink-0">
        {pricing && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-genius-cream/60 mr-4 hidden lg:flex">
            <span>O<span className="ml-0.5 text-genius-cream">{formatChartPrice(pricing.o)}</span></span>
            <span>H<span className="ml-0.5 text-genius-cream">{formatChartPrice(pricing.h)}</span></span>
            <span>L<span className="ml-0.5 text-genius-cream">{formatChartPrice(pricing.l)}</span></span>
            <span>C<span className="ml-0.5 text-genius-cream">{formatChartPrice(pricing.c)}</span></span>
            <span className={pricing.diff >= 0 ? "text-genius-green" : "text-genius-red"}>
              {pricing.diff >= 0 ? "+" : ""}{formatChartPrice(pricing.diff)} ({pricing.pct.toFixed(2)}%)
            </span>
          </div>
        )}

        <div className="flex-1" />

        <span className="text-[10px] text-genius-cream/60 uppercase tracking-widest mr-1">Period:</span>
        {PERIODS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => setActivePeriod(days)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              activePeriod === days
                ? "bg-genius-green text-white shadow shadow-genius-green/30"
                : "text-genius-cream/60 hover:text-genius-cream hover:bg-genius-blue/30"
            }`}
          >
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-genius-blue/20 mx-2" />

        <span className="text-[10px] text-genius-cream/60 uppercase tracking-widest mr-1">Freq:</span>
        {FREQUENCIES.map(({ label, ms }) => (
          <button
            key={label}
            onClick={() => setActiveFreq(ms)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
              activeFreq === ms
                ? "bg-genius-green text-white shadow shadow-genius-green/30"
                : "text-genius-cream/60 hover:text-genius-cream hover:bg-genius-blue/30"
            }`}
          >
            {label}
          </button>
        ))}

        {loading && (
          <div className="w-3 h-3 border border-genius-green border-t-transparent rounded-full animate-spin ml-2" />
        )}
      </div>

      <div className="absolute top-10 left-0 w-10 bottom-0 border-r border-genius-blue/30 flex flex-col items-center py-4 gap-4 text-genius-cream/50 z-10 bg-background/90 backdrop-blur">
        <div className="w-5 h-5 border border-current rounded flex items-center justify-center hover:text-genius-cream cursor-pointer text-xs">+</div>
        <div className="w-5 h-5 border border-current rounded-full hover:text-genius-cream cursor-pointer" />
        <div className="w-5 h-px bg-current hover:bg-genius-cream cursor-pointer mt-4" />
      </div>

      <div className="flex-1 relative min-h-0 bg-background">
        <div ref={chartContainerRef} className="absolute inset-0 left-10 bg-background" />
        {loading && candles.length === 0 && (
          <div className="absolute inset-0 left-10 flex items-center justify-center bg-background/95 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-genius-green/60 border-t-genius-green rounded-full animate-spin" />
              <span className="text-xs text-genius-cream/70">Loading chart...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
