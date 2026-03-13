"use client";

export type TimeframeItem = {
  label: string;
  value: string;
  positive: boolean;
  active?: boolean;
};

export type TokenStatsData = {
  volumeLabel: string;
  volumeValue: string;
  buysCount: string;
  buysValue: string;
  sellsCount: string;
  sellsValue: string;
  volChange: string;
  volChangePositive: boolean;
  buyBarPercent: number;
};

type AdvancedPanelTokenStatsProps = {
  stats: TokenStatsData;
  timeframes: TimeframeItem[];
  onTimeframeSelect?: (label: string) => void;
};

export function AdvancedPanelTokenStats({
  stats,
  timeframes,
  onTimeframeSelect,
}: AdvancedPanelTokenStatsProps) {
  return (
    <div className="relative group">
      {/* First row: token stats – visible by default (image 2) */}
      <div
        className="min-h-0 flex flex-col justify-center gap-2 bg-genius-indigo border-b border-genius-blue px-4 pt-[0.55rem] pb-[0.65rem] overflow-hidden"
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

      {/* Hover overlay: timeframes (image 3) – visible on group hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto bg-genius-indigo"
        aria-hidden
      >
        <div
          className="grid grid-cols-4 divide-x divide-genius-blue border border-genius-blue h-full border-b border-t-0 border-x-0"
          data-sentry-component="AdvancedOverviewTimeframes"
          data-sentry-source-file="AdvancedOverviewTimeframes.tsx"
        >
          {timeframes.map((tf) => (
            <button
              key={tf.label}
              type="button"
              onClick={() => onTimeframeSelect?.(tf.label)}
              className={`flex flex-col justify-center items-center p-1 min-h-0 transition-colors cursor-pointer ${
                tf.active ? "bg-genius-blue" : "bg-genius-indigo hover:bg-[#140b30]"
              }`}
            >
              <div className="text-[10px] text-genius-cream/60 uppercase">{tf.label}</div>
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
