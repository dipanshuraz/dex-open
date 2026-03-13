"use client";

import { ChevronDown, RefreshCcw } from "lucide-react";

export function TradingControls() {
  return (
    <div className="flex flex-col px-4 py-4 font-sans text-sm">
      
      {/* Tops Tabs: Buy / Sell / Dropdown */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 py-2 rounded bg-green-50 dark:bg-[#1A2525] text-green-600 dark:text-[#34d399] font-bold tracking-wide border border-green-200 dark:border-[#1A3A30]">
          Buy
        </button>
        <button className="flex-1 py-2 rounded bg-transparent text-rose-500 dark:text-[#f43f5e] font-bold tracking-wide border border-rose-200 dark:border-[#3A141A] hover:bg-rose-50 dark:hover:bg-[#3A141A]/50 transition-colors">
          Sell
        </button>
        <button className="w-10 flex items-center justify-center rounded border border-black/10 dark:border-[#221A30] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/5">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Market / Limit */}
      <div className="flex items-center justify-between font-bold mb-3">
         <div className="flex gap-4">
            <span className="text-black dark:text-white cursor-pointer">Market</span>
            <span className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer transition-colors">Limit</span>
         </div>
         <RefreshCcw className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
      </div>

      {/* Balance */}
      <div className="flex flex-col gap-1.5 mb-3">
         <span className="text-xs text-gray-800 dark:text-gray-500 font-bold">Balance</span>
         <div className="w-full h-11 bg-gray-50 dark:bg-[#100B1A] border border-black/10 dark:border-[#221A30] rounded flex items-center px-4 text-gray-500 dark:text-[#8C82A2] font-semibold text-sm">
            No selectable asset
         </div>
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5 mb-5">
         <div className="flex items-center text-xs text-gray-800 dark:text-gray-500 font-bold">
            <span>Amount</span>
            <span className="ml-1 text-[10px]">⇌</span>
         </div>
         <div className="w-full h-11 bg-gray-50 dark:bg-[#100B1A] border border-black/10 dark:border-[#221A30] rounded flex items-center px-4 justify-between focus-within:border-black/20 focus-within:dark:border-[#483768] transition-colors">
            <input type="text" placeholder="0" className="bg-transparent border-none outline-none text-black dark:text-white font-mono w-1/2 placeholder:text-gray-400 dark:placeholder:text-gray-600" />
            <span className="text-gray-400 dark:text-gray-600 font-mono">≈ $NaN</span>
         </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3 mb-5 font-bold text-xs text-gray-800 dark:text-[#8C82A2]">
         <div className="flex justify-between items-center cursor-pointer group">
            <span className="group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Take Profit - Stop Loss</span>
            {/* Toggle switch (Pink off state) */}
            <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-[#35254A] flex items-center px-0.5 border border-black/5 dark:border-[#483768]">
               <div className="w-4 h-4 rounded-full bg-white dark:bg-[#E892B3]"></div>
            </div>
         </div>
         <div className="flex justify-between items-center cursor-pointer group">
            <span className="group-hover:text-black dark:group-hover:text-gray-300 transition-colors">Fast Swaps Enabled</span>
            {/* Toggle switch (Pink on state) */}
            <div className="w-9 h-5 rounded-full bg-pink-100 dark:bg-[#F472B6]/30 flex items-center px-0.5 border border-pink-300 dark:border-[#F472B6]/50">
               <div className="w-4 h-4 rounded-full bg-pink-500 dark:bg-[#F472B6] translate-x-3.5 transition-transform"></div>
            </div>
         </div>
      </div>

      {/* Action Button */}
      <button className="w-full py-2 bg-[#4ADE80] hover:bg-[#3FD674] text-black font-extrabold tracking-wide rounded text-[13px] transition-colors mb-4">
         Deposit To Continue
      </button>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2">
         <button className="py-2.5 bg-gray-50 dark:bg-[#20153B] border border-black/10 dark:border-[#38275A] text-black dark:text-white font-extrabold uppercase text-[11px] rounded hover:bg-gray-100 dark:hover:bg-[#2A1D4E] transition-colors">
            Preset 1
         </button>
         <button className="py-2.5 bg-white dark:bg-transparent border border-black/10 dark:border-[#221A30] text-gray-500 font-extrabold uppercase text-[11px] rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Preset 2
         </button>
         <button className="py-2.5 bg-white dark:bg-transparent border border-black/10 dark:border-[#221A30] text-gray-500 font-extrabold uppercase text-[11px] rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Preset 3
         </button>
      </div>

    </div>
  );
}
