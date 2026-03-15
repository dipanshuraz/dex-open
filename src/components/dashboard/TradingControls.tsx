"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  RefreshCcw,
  ArrowRightLeft,
  ArrowUp,
  ArrowDown,
  Bell,
  Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Switch } from "@/components/ui/Switch";

type OrderMode = "buy" | "sell";
type OrderType = "market" | "limit";

function SlippageIcon({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 1200"
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden
    >
      <path d="m386.48 1159.2h677.43v40.855h-677.43z" />
      <path d="m1012.1 934.09-11.168-39.309 5.5703 19.668-5.668-19.645c0.5-0.16797 49.809-15.168 95.715-70.809 49.383-60.168 60.953-112.43 61.094-112.93l39.977 8.2852c-0.47656 2.5-13.238 62.07-69.57 130.57-54.496 66.168-113.47 83.48-115.95 84.168z" />
      <path d="m965.17 851.71-11.285-39.285c0.33203-0.070313 32.07-9.9297 61.883-46.07 32.477-39.453 40.191-73.691 40.238-74.047l39.977 8.3555c-0.33203 1.7852-9.3555 43.832-48.715 91.691-38.359 46.57-80.336 58.855-82.098 59.355z" />
      <path d="m1125 491.5-282.95-59.238c-1.2852-0.11719-2.5469-0.40625-3.832-0.59375-19.953-2.5234-38.977 4.0234-52.906 16.355l-147.81 140.95-147.52-135.81 204.55-204.86c9.9766-8.6172 16.715-21.145 17.855-35.383 2.1172-28.523-19.238-53.332-47.715-55.523-15.383-1.1172-29.594 4.5-39.809 14.355l-292.36 269.14c2.3086-7.4297 3.9531-15.117 4.6445-23.191 4.9531-59.523-39.262-111.74-98.855-116.69-59.523-4.9531-111.74 39.168-116.76 98.691-4.9531 59.691 39.215 111.83 98.809 116.76 24.617 2.0703 47.762-4.5703 67.047-16.953l-97.691 215.24-164.76 94.645c-11.953 7.1914-20.977 19.238-23.93 33.953-5.5703 28 12.57 55.383 40.547 60.977 11.859 2.332 23.645 0.42578 33.621-4.7422l168.21-96.43c6.9062-4.4766 12.691-10.594 16.906-18l71.383-120.12 150.64 122.55c35.215 27.477 53.977 42.617 92.191 52.43l180.83 22.145 72.238 207.79c8.4531 22.691 42.168 35.406 59.215 34.691 31.07-1.3555 49.383-18.832 54.07-55.594 1.4531-11.5-0.070313-22.617-3.9766-32.645l-87.262-245.57c-7.6914-17.93-22.855-31.883-42.094-37.785l-84.809-39.453 126.36-122.07 248.29 51.168c1.5234 0.38281 3.1172 0.64453 4.5469 0.76172 36.855 4.6172 70.383-21.309 75-58.094 4.3984-34.555-18.41-66.363-51.91-73.863z" />
    </svg>
  );
}

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "market", label: "Market" },
  { value: "limit",  label: "Limit" },
];

const PRESETS = [1, 2, 3] as const;

type ToggleSetting = { label: string; checked: boolean; onCheckedChange: (v: boolean) => void };

function ToggleRow({ label, checked, onCheckedChange }: ToggleSetting) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-[10px] text-genius-cream/50">{label}</div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={`Toggle ${label}`} />
    </div>
  );
}

type TradingField = {
  value: string;
  onChange: (v: string) => void;
  icon: ReactNode;
  label: string;
  inputClassName?: string;
  overlay?: ReactNode;
};

function TradingInputField({ value, onChange, icon, label, inputClassName, overlay }: TradingField) {
  return (
    <div className="w-full flex flex-col border border-genius-blue rounded-sm">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex w-full border p-3.5 ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-1 border-none bg-genius-blue/40 text-center text-xs rounded-none border-b border-genius-blue",
            inputClassName
          )}
        />
        {overlay}
      </div>
      <div className="h-full flex justify-center items-center gap-1 py-1.5 px-2 text-[10px] uppercase leading-none opacity-50 text-genius-cream">
        {icon}
        {label}
      </div>
    </div>
  );
}

export function TradingControls() {
  const [orderMode, setOrderMode] = useState<OrderMode>("buy");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [isExpanded, setIsExpanded] = useState(true);
  const [takeProfitStopLoss, setTakeProfitStopLoss] = useState(false);
  const [fastSwaps, setFastSwaps] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("0");
  const [targetPrice, setTargetPrice] = useState("71,118.923");
  const [targetPricePct, setTargetPricePct] = useState("+0.00");
  const [impliedCapSlider, setImpliedCapSlider] = useState(50);
  const [timeInForce, setTimeInForce] = useState("GTC");
  void setTimeInForce;
  const [slippage, setSlippage] = useState("0.5");
  const [priorityGwei, setPriorityGwei] = useState("0");
  const hasSelectedAsset = false;

  const toggleSettings: ToggleSetting[] = [
    { label: "Take Profit - Stop Loss", checked: takeProfitStopLoss, onCheckedChange: setTakeProfitStopLoss },
    { label: "Fast Swaps Enabled",      checked: fastSwaps,           onCheckedChange: setFastSwaps },
  ];

  const tradingFields: TradingField[] = [
    {
      value: slippage,
      onChange: setSlippage,
      icon: <span className="size-2.5 flex shrink-0 [&>svg]:text-genius-cream"><SlippageIcon className="size-2.5" /></span>,
      label: "Slippage %",
    },
    {
      value: priorityGwei,
      onChange: setPriorityGwei,
      icon: <Fuel className="size-2.5" aria-hidden />,
      label: "Priority (Gwei)",
      inputClassName: "pr-8",
      overlay: (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Image
            src="https://www.tradegenius.com/static/geniusImages/advanced_network_logos/ethereum.png"
            alt="native"
            width={12}
            height={12}
            unoptimized
            className="object-contain"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="relative flex flex-col">
      <div className="relative h-fit bg-genius-indigo p-4">
        <div className="relative flex flex-col gap-2.5">
          {/* Buy / Sell + collapse chevron */}
          <div className="w-full flex items-center gap-2">
            <div className="w-full flex gap-2">
              {(["buy", "sell"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOrderMode(mode)}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all flex-1 h-[36px] border lg:text-xs",
                    orderMode === mode
                      ? mode === "buy"
                        ? "border-transparent text-genius-green bg-genius-green/20 lg:hover:brightness-100"
                        : "border-transparent text-genius-red bg-genius-red/20 lg:hover:brightness-100"
                      : "bg-transparent text-genius-red border-genius-blue lg:hover:brightness-75 hover:bg-genius-blue/80"
                  )}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded((e) => !e)}
              className="cursor-pointer hover:opacity-70 transition-opacity border border-genius-blue rounded-full p-1 shrink-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={cn("w-3.5 h-3.5 transition-transform", !isExpanded && "-rotate-180")}
                aria-hidden
              />
            </button>
          </div>

          {isExpanded && (
            <>
              {/* Market / Limit + refresh */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {ORDER_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOrderType(value)}
                      className={cn(
                        "text-sm cursor-pointer hover:text-genius-cream transition-colors",
                        orderType === value ? "text-genius-cream" : "text-genius-cream/50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-genius-cream/50 cursor-pointer hover:opacity-80 transition-opacity"
                  aria-label="Refresh"
                >
                  <RefreshCcw className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>

              {/* Balance */}
              <div className="relative flex flex-col gap-1.5 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-genius-cream/50">Balance</span>
                </div>
                <button
                  type="button"
                  className="flex justify-between items-center w-full bg-genius-blue cursor-pointer hover:brightness-75 transition-all py-2 px-2.5 rounded-sm text-sm text-left"
                  aria-label="Select asset"
                >
                  <span className="text-xs text-genius-cream/50 py-1">No selectable asset</span>
                </button>
              </div>

              {/* Amount — disabled/faded when no asset selected */}
              <div
                className={cn("relative flex flex-row gap-2", !hasSelectedAsset && "opacity-50 pointer-events-none")}
              >
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="w-fit flex items-center gap-2 text-[10px] text-genius-cream/50">
                    <span className="flex items-center gap-1 hover:text-genius-cream transition-colors cursor-pointer select-none">
                      Amount <ArrowRightLeft className="w-2.5 h-2.5" aria-hidden />
                    </span>
                  </div>
                  <div className="w-full flex flex-row items-center gap-2">
                    <div className="relative text-sm w-full">
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex w-full rounded-sm border border-genius-blue bg-transparent p-3.5 ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 pr-14"
                      />
                      <span className="absolute top-1/2 -translate-y-1/2 right-4 text-xs pointer-events-none text-genius-cream/50">
                        ≈ $NaN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limit-only: Target Price, Implied M. Cap, Time in Force */}
              {orderType === "limit" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="w-fit flex items-center gap-1 text-[10px] text-genius-cream/50 hover:text-genius-cream transition-colors cursor-pointer select-none">
                      Target Price <ArrowRightLeft className="w-2.5 h-2.5" aria-hidden />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          placeholder="0"
                          className="flex w-full rounded-sm border border-genius-blue bg-transparent p-3.5 ring-offset-background file:border-0 file:bg-transparent file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 py-2 pr-12 text-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-genius-cream/50 text-sm">
                          USD
                        </div>
                      </div>
                      <div className="relative flex justify-between items-center w-[45%] border border-genius-blue rounded-sm p-2">
                        <div className="absolute top-1/2 -translate-y-1/2 left-1.5 flex items-center">
                          <ArrowUp className="w-4 h-4 text-genius-green" aria-hidden />
                          <ArrowDown
                            className="w-4 h-4 -translate-x-1 text-genius-cream opacity-50 cursor-pointer hover:opacity-70 transition-opacity"
                            aria-hidden
                          />
                        </div>
                        <input
                          type="text"
                          value={targetPricePct}
                          onChange={(e) => setTargetPricePct(e.target.value)}
                          placeholder="0"
                          className="flex w-full rounded-sm border-none p-3.5 ring-offset-background bg-transparent text-end py-0 px-2 pr-8 text-sm text-genius-green"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-genius-green text-sm">
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-genius-cream/50 flex items-center">
                        Implied M. Cap
                      </div>
                      <div className="text-xs">$5.21B</div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={impliedCapSlider}
                      onChange={(e) => setImpliedCapSlider(Number(e.target.value))}
                      className="w-full h-2.5 rounded-sm appearance-none bg-genius-indigo accent-genius-green [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-genius-green [&::-webkit-slider-thumb]:bg-genius-indigo"
                    />
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs text-genius-cream/50">-100%</span>
                      <span className="text-xs text-genius-cream/50">0%</span>
                      <span className="text-xs text-genius-cream/50">+500%</span>
                    </div>
                  </div>
                  <div className="relative flex flex-col gap-1.5">
                    <div className="text-[10px] text-genius-cream/50">Time in Force</div>
                    <div className="flex items-center">
                      <div className="flex grow justify-between items-center rounded-sm border border-genius-blue py-2 pl-4 pr-3 hover:opacity-70 transition-opacity cursor-pointer">
                        <div className="text-xs">{timeInForce}</div>
                        <ChevronDown className="w-4 h-4 transition-transform" aria-hidden />
                      </div>
                      <button
                        type="button"
                        className="stroke-genius-cream/50 mx-4 hover:opacity-70 hover:cursor-pointer"
                        aria-label="Notifications"
                      >
                        <Bell className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {toggleSettings.map((s) => (
                <ToggleRow key={s.label} {...s} />
              ))}

              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 w-full py-3 lg:text-xs text-wrap",
                  orderType === "market"
                    ? "bg-genius-green text-genius-indigo"
                    : "pointer-events-none bg-genius-yellow text-genius-indigo"
                )}
                disabled={orderType === "limit"}
              >
                {orderType === "market" ? "Deposit To Continue" : "Under Maintenance"}
              </button>

              {/* Presets */}
              <div className="flex items-center gap-2 border border-genius-blue rounded-sm p-1">
                {PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedPreset(n)}
                    className={cn(
                      "flex-1 text-center text-xs rounded-sm py-1.5 cursor-pointer hover:opacity-80 transition-all uppercase",
                      selectedPreset === n ? "text-genius-cream bg-genius-blue" : "text-genius-cream/50"
                    )}
                  >
                    Preset {n}
                  </button>
                ))}
              </div>

              {/* Slippage % + Priority (Gwei) */}
              <div className="flex justify-between gap-2">
                {tradingFields.map((field) => (
                  <TradingInputField key={field.label} {...field} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
