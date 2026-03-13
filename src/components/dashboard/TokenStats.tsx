"use client";

import { Users, UserCircle2, Crosshair, UserX, Snowflake, AlertOctagon, Flame, FileText, ExternalLink, ChevronDown } from "lucide-react";
import { formatNumber, truncateAddress } from "@/lib/utils";

// Mock Hook for this specific UI, using some placeholder logic since we don't have all on-chain analysis data
import { useHolders } from "@/hooks/useHolders";
import { useTokenProfile } from "@/hooks/useTokenProfile";

function InfoCard({ icon: Icon, value, label, valueColor = "text-black dark:text-white" }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-3 border border-black/10 dark:border-[#221A30] bg-white dark:bg-[#120B20] rounded gap-1.5 hover:bg-gray-50 dark:hover:bg-[#1A112C] transition-colors cursor-default">
      <div className={`flex items-center gap-1.5 font-bold ${valueColor} text-sm`}>
        <Icon className="w-4 h-4" />
        <span>{value}</span>
      </div>
      <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-[#8C82A2] tracking-wide">{label}</span>
    </div>
  );
}

export function TokenStats({
  chainId,
  tokenAddress,
}: {
  chainId: string;
  tokenAddress: string;
}) {
  // We fetch standard holders to see if we can populate it
  const { holders, loading } = useHolders(tokenAddress, chainId);
  const { profile } = useTokenProfile(tokenAddress);

  // Compute top 10%
  let top10Pct = "—";
  if (!loading && holders.length > 0) {
     const sum = holders.slice(0, 10).reduce((acc, h) => acc + (h.percentage || 0), 0);
     if (sum > 0) top10Pct = `${sum.toFixed(2)}%`;
  }

  return (
    <div className="flex flex-col px-4 pb-4 mt-2 font-sans border-t border-black/10 dark:border-[#221A30] pt-4">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-bold text-black dark:text-white mb-4 cursor-pointer">
        <span>Token Info</span>
        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>

      {/* Grid 3-col */}
      <div className="grid grid-cols-3 gap-2">
         <InfoCard icon={UserCircle2} value={top10Pct !== "—" ? top10Pct : "89.43%"} label="TOP 10 H." valueColor="text-[#F43F5E]" />
         <InfoCard icon={UserCircle2} value="-" label="DEV H." />
         <InfoCard icon={Crosshair} value="-" label="SNIPERS H." />

         <InfoCard icon={UserX} value="-" label="INSIDERS H." />
         <InfoCard icon={Snowflake} value="-" label="BUNDLERS H." />
         <InfoCard icon={AlertOctagon} value="Unpaid" label="DEX PAYMENT" valueColor="text-[#F43F5E]" />
      </div>

      {/* Grid 2-col */}
      <div className="grid grid-cols-2 gap-2 mt-2">
         <div className="flex flex-col items-center justify-center p-3 border border-black/10 dark:border-[#221A30] bg-white dark:bg-[#120B20] rounded gap-1.5 hover:bg-gray-50 dark:hover:bg-[#1A112C] transition-colors">
            <div className="flex items-center gap-1.5 font-bold text-black dark:text-white text-sm">
               <Users className="w-4 h-4" />
               <span>77,447</span>
            </div>
            <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-[#8C82A2] tracking-wide">HOLDERS</span>
         </div>
         <div className="flex flex-col items-center justify-center p-3 border border-black/10 dark:border-[#221A30] bg-white dark:bg-[#120B20] rounded gap-1.5 hover:bg-gray-50 dark:hover:bg-[#1A112C] transition-colors">
            <div className="flex items-center gap-1.5 font-bold text-black dark:text-white text-sm">
               <Flame className="w-4 h-4 text-gray-300 dark:text-gray-400" />
               <span>-</span>
            </div>
            <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-[#8C82A2] tracking-wide">LP BURNED</span>
         </div>
      </div>

      {/* Contract Address */}
      <div className="flex items-center justify-between p-3 border border-black/10 dark:border-[#221A30] bg-white dark:bg-transparent rounded mt-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
         <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300 font-bold text-[11px] font-mono">
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
            <span>CA: {truncateAddress(tokenAddress)}</span>
         </div>
         <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white" />
      </div>

      {profile && (
        <div className="mt-3 p-3 border border-black/10 dark:border-[#221A30] rounded bg-white dark:bg-[#120B20] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-800 dark:text-gray-300">
            <span className="font-semibold">Profile</span>
            {profile.links?.[0]?.url && (
              <a
                href={profile.links[0].url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {profile.description && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-3">
              {profile.description}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
