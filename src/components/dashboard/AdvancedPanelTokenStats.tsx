"use client";

import type { TimeframeItem, TimeframeKey, TokenStatsData } from "@/types";

type AdvancedPanelTokenStatsProps = {
  stats: TokenStatsData;
  timeframes: TimeframeItem[];
  onTimeframeSelect?: (key: TimeframeKey) => void;
};

export function AdvancedPanelTokenStats({
  stats,
  timeframes,
  onTimeframeSelect,
}: AdvancedPanelTokenStatsProps) {
  return (
    <div className="relative group">
      <div
        className="min-h-0 flex flex-col justify-center gap-2 bg-genius-indigo border-b border-genius-blue px-4 pt-[0.55rem] pb-[0.65rem] overflow-hidden transition-opacity duration-200 group-hover:opacity-0 group-hover:pointer-events-none"
        data-sentry-component="AdvancedPanelTokenStats"
        data-sentry-source-file="AdvancedPanelTokenStats.tsx"
      >
        <div className="flex gap-1 whitespace-nowrap">
          <div className="flex flex-col gap-0.5 items-start">
            <div className="text-[10px] text-genius-cream uppercase">{stats.volumeLabel}</div>
            <div className="text-xs">{stats.volumeValue}</div>
          </div>
          <div className="flex flex-col gap-0.5 items-center flex-1 pr-1">
            <div className="text-[10px] text-genius-cream/60 uppercase">Buys</div>
            <div className="flex gap-px text-xs text-genius-green">
              {stats.buysCount}
              <span className="text-genius-cream/60">/</span>
              {stats.buysValue}
            </div>
          </div>
          <div className="flex flex-col gap-0.5 items-center flex-1 pl-1">
            <div className="text-[10px] text-genius-cream/60 uppercase">Sells</div>
            <div className="flex gap-px text-xs text-genius-red">
              {stats.sellsCount}
              <span className="text-genius-cream/60">/</span>
              {stats.sellsValue}
            </div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className="text-[10px] text-genius-cream/60 uppercase">Vol. Change</div>
            <div
              className={`text-xs ${stats.volChangePositive ? "text-genius-green" : "text-genius-red"}`}
            >
              {stats.volChange}
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-1.5">
          <div
            className="h-[2px] bg-genius-green rounded-sm"
            style={{ width: `${stats.buyBarPercent}%` }}
          />
          <div className="h-[2px] bg-genius-red rounded-sm flex-1" />
        </div>
      </div>

      <div
        className="absolute inset-0 z-10 flex flex-col justify-center bg-genius-indigo border-b border-genius-blue opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto"
        aria-hidden
      >
        <div
          className="grid grid-cols-4 divide-x divide-genius-blue border-t border-genius-blue flex-1 min-h-0"
          data-sentry-component="AdvancedOverviewTimeframes"
          data-sentry-source-file="AdvancedOverviewTimeframes.tsx"
        >
          {timeframes.map((tf) => (
            <button
              key={tf.key}
              type="button"
              onClick={() => onTimeframeSelect?.(tf.key)}
              className={`
                flex flex-col justify-center items-center p-1 min-h-0 cursor-pointer
                transition-colors duration-150
                ${tf.active
                  ? "bg-genius-blue text-genius-cream ring-inset ring-1 ring-genius-cream/20"
                  : "bg-genius-indigo text-genius-cream/80 hover:bg-genius-blue/40 hover:text-genius-cream"
                }
              `}
            >
              <div className="text-[10px] uppercase">{tf.label}</div>
              <div
                className={`text-xs ${tf.positive ? "text-genius-green" : "text-genius-red"}`}
              >
                {tf.value}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
