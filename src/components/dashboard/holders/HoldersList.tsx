"use client";

import { useHolders } from "@/hooks/useHolders";
import { truncateAddress } from "@/lib/utils";
import { Users } from "lucide-react";

export function HoldersList({ tokenAddress }: { tokenAddress: string }) {
  const { holders, loading, error } = useHolders(tokenAddress);

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Top Holders
        </h2>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-blue-400">Live</span>
      </div>

      {loading && holders.length === 0 ? (
         <div className="flex-1 flex justify-center items-center text-gray-400">Loading holders...</div>
      ) : error ? (
         <div className="flex-1 flex justify-center items-center text-red-400 bg-red-500/10 rounded-xl">Error loading holders</div>
      ) : (
         <div className="flex flex-col gap-3 overflow-y-auto pr-2">
           {holders.slice(0, 10).map((holder: any, idx: number) => (
             <div key={holder.address} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                        <span className="text-xs font-mono text-gray-400">{holder.address.slice(2, 4)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-200">{truncateAddress(holder.address)}</span>
                        <span className="text-xs text-gray-500">{holder.balance.toLocaleString()} tokens</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="font-bold text-white">{holder.percentage.toFixed(2)}%</span>
                    {/* Basic visual bar for holding size */}
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                        <div 
                           className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                           style={{ width: `${Math.min(holder.percentage, 100)}%` }}
                        />
                    </div>
                </div>
             </div>
           ))}
           {holders.length === 0 && !loading && (
               <div className="text-center text-gray-500 py-8">No holder data available.</div>
           )}
         </div>
      )}
    </div>
  );
}
