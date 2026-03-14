"use client";

import { useState } from "react";
import {
  Crosshair,
  Flame,
  FileText,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { truncateAddress } from "@/lib/utils";
import { useHolders } from "@/hooks/useHolders";
import { useTokenProfile } from "@/hooks/useTokenProfile";

function UserStarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
      <path d="M8 15H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
    </svg>
  );
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
    </svg>
  );
}

function HatGlasseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden
    >
      <path d="M9 18.0003C9 16.8957 8.10457 16.0003 7 16.0003C5.89543 16.0003 5 16.8957 5 18.0003C5.00017 19.1047 5.89554 20.0003 7 20.0003C8.10446 20.0003 8.99983 19.1047 9 18.0003ZM19 18.0003C19 16.8957 18.1046 16.0003 17 16.0003C15.8954 16.0003 15 16.8957 15 18.0003L15.0107 18.2044C15.1131 19.2129 15.9645 20.0003 17 20.0003C18.1045 20.0003 18.9998 19.1047 19 18.0003ZM14.9248 2.00032C15.3466 1.98963 15.7658 2.06838 16.1553 2.23079C16.5449 2.39332 16.8962 2.63622 17.1855 2.94368C17.4386 3.21265 17.6402 3.52538 17.7793 3.86653L17.835 4.01497L17.8428 4.04133L19.7324 10.0003H22C22.5523 10.0003 23 10.448 23 11.0003C22.9998 11.5525 22.5522 12.0003 22 12.0003H2C1.44782 12.0003 1.00017 11.5525 1 11.0003C1 10.448 1.44772 10.0003 2 10.0003H4.24414L5.6123 5.18391C5.79 4.55525 6.1685 4.00193 6.68945 3.60774C7.21059 3.21357 7.84658 3.00023 8.5 3.00032H12C12.1488 3.00036 12.2963 2.96757 12.4307 2.90364L13.707 2.29231C14.0878 2.11036 14.503 2.01104 14.9248 2.00032ZM14.9756 3.99934C14.8702 4.00202 14.766 4.02191 14.667 4.05696L14.5693 4.097L13.293 4.70735C12.9396 4.87598 12.5569 4.97378 12.167 4.99543L12 5.00032H8.5C8.2822 5.00027 8.0702 5.0711 7.89648 5.20247C7.72278 5.33385 7.59637 5.51828 7.53711 5.72786L6.32324 10.0003H17.6338L15.9453 4.67122L15.9053 4.57356C15.8606 4.47859 15.8017 4.39057 15.7295 4.31379C15.6331 4.21131 15.5156 4.13067 15.3857 4.07649C15.2559 4.02234 15.1162 3.9958 14.9756 3.99934ZM21 18.0003C20.9998 20.2093 19.209 22.0003 17 22.0003C14.8597 22.0003 13.1118 20.3191 13.0049 18.2054L13 18.0003L12.9951 17.9007C12.9723 17.672 12.8709 17.4573 12.707 17.2933C12.5429 17.1292 12.3276 17.0279 12.0986 17.0052L12 17.0003C11.7348 17.0003 11.4805 17.1057 11.293 17.2933C11.1055 17.4808 11 17.7352 11 18.0003L10.9951 18.2054C10.8882 20.3191 9.14026 22.0003 7 22.0003C4.79097 22.0003 3.00017 20.2093 3 18.0003C3 15.7912 4.79086 14.0003 7 14.0003C8.30966 14.0003 9.47151 14.63 10.2012 15.6029C10.7175 15.2154 11.3469 15.0003 12 15.0003L12.2969 15.015C12.8426 15.0692 13.3604 15.2747 13.7979 15.6029C14.5275 14.6298 15.6901 14.0003 17 14.0003C19.2091 14.0003 21 15.7912 21 18.0003Z" />
    </svg>
  );
}

function VirusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      fillRule="evenodd"
      className={className}
      aria-hidden
    >
      <path d="M8 2C8 2.74028 8.4022 3.38663 9 3.73244V6.12602C8.63298 6.22048 8.28634 6.36573 7.96803 6.55382L5.93226 4.51804C5.97644 4.35282 6 4.17916 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6C4.17916 6 4.35282 5.97644 4.51804 5.93226L6.55382 7.96803C6.36572 8.28636 6.22047 8.63301 6.126 9.00005H3.73247C3.38667 8.40222 2.7403 8 2 8C0.895431 8 0 8.89543 0 10C0 11.1046 0.895431 12 2 12C2.74026 12 3.38659 11.5978 3.7324 11.0001H6.12603C6.2205 11.3671 6.36575 11.7137 6.55383 12.032L4.51808 14.0678C4.35284 14.0236 4.17917 14 4 14C2.89543 14 2 14.8954 2 16C2 17.1046 2.89543 18 4 18C5.10457 18 6 17.1046 6 16C6 15.8209 5.97645 15.6472 5.93227 15.482L7.96806 13.4462C8.28636 13.6343 8.63299 13.7795 9 13.874V16.2676C8.4022 16.6134 8 17.2597 8 18C8 19.1046 8.89543 20 10 20C11.1046 20 12 19.1046 12 18C12 17.2597 11.5978 16.6134 11 16.2676V13.874C11.367 13.7795 11.7137 13.6343 12.032 13.4462L14.0677 15.482C14.0236 15.6472 14 15.8208 14 16C14 17.1046 14.8954 18 16 18C17.1046 18 18 17.1046 18 16C18 14.8954 17.1046 14 16 14C15.8208 14 15.6472 14.0236 15.482 14.0677L13.4462 12.032C13.6343 11.7137 13.7795 11.3671 13.874 11.0001H16.2676C16.6134 11.5978 17.2597 12 18 12C19.1046 12 20 11.1046 20 10C20 8.89543 19.1046 8 18 8C17.2597 8 16.6133 8.40222 16.2675 9.00005H13.874C13.7795 8.63302 13.6343 8.28638 13.4462 7.96806L15.482 5.93227C15.6472 5.97645 15.8209 6 16 6C17.1046 6 18 5.10457 18 4C18 2.89543 17.1046 2 16 2C14.8954 2 14 2.89543 14 4C14 4.17917 14.0236 4.35284 14.0678 4.51808L12.032 6.55383C11.7137 6.36574 11.367 6.22048 11 6.12602V3.73244C11.5978 3.38663 12 2.74028 12 2C12 0.895431 11.1046 0 10 0C8.89543 0 8 0.895431 8 2Z" />
    </svg>
  );
}

function DexPaymentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 252 300"
      className={className}
      aria-hidden
    >
      <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.498 3.076-2.342 6.434-3.518 9.747-3.518s6.671 1.176 9.748 3.518c8.576 6.538 14.934 16.951 13.821 40.498a5.95 5.95 0 003.84 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 23.502 14.342 3.228 2.622 5.886 5.155 8.814 8.071 7.897.273 19.438-8.5 24.796-16.709-9.221 30.23-51.299 65.929-80.43 79.589-.012-.005-.02-.012-.029-.018-5.228-3.992-11.108-5.988-16.989-5.988s-11.76 1.996-16.988 5.988c-.009.005-.017.014-.029.018-29.132-13.66-71.209-49.359-80.43-79.589 5.357 8.209 16.898 16.982 24.795 16.709 2.929-2.915 5.587-5.449 8.814-8.071C69.31 16.94 77.204 12.083 85.664 8.406 97.882 3.103 111.959.377 126 0m-25.818 106.866c-9.176-4.576-20.854-11.312-32.544-20.541-2.465 5.119-2.735 9.586-1.466 13.193.901 2.542 2.597 4.753 4.826 6.512 2.416 1.901 5.432 3.285 8.766 4.033 6.326 1.425 13.711.593 20.418-3.197" />
      <path d="M197.167 75.016c6.436-6.495 12.107-13.684 16.667-20.099l2.316 4.359c7.456 14.917 11.33 29.774 11.33 46.494l-.016 26.532.14 13.754c.54 33.766 7.846 67.929 24.396 99.193l-34.627-27.922-24.501 39.759-25.74-24.231L126 299.604l-41.132-66.748-25.739 24.231-24.501-39.759L0 245.25c16.55-31.264 23.856-65.427 24.397-99.193l.14-13.754-.016-26.532c0-16.721 3.873-31.578 11.331-46.494l2.315-4.359c4.56 6.415 10.23 13.603 16.667 20.099l-2.01 4.175c-3.905 8.109-5.198 17.176-2.156 25.799 1.961 5.554 5.54 10.317 10.154 13.953 4.48 3.531 9.782 5.911 15.333 7.161 3.616.814 7.3 1.149 10.96 1.035-.854 4.841-1.227 9.862-1.251 14.978L53.2 160.984l25.206 14.129a41.926 41.926 0 015.734 3.869c20.781 18.658 33.275 73.855 41.861 100.816 8.587-26.961 21.08-82.158 41.862-100.816a41.865 41.865 0 015.734-3.869l25.206-14.129-32.665-18.866c-.024-5.116-.397-10.137-1.251-14.978 3.66.114 7.344-.221 10.96-1.035 5.551-1.25 10.854-3.63 15.333-7.161 4.613-3.636 8.193-8.399 10.153-13.953 3.043-8.623 1.749-17.689-2.155-25.799l-2.01-4.175z" />
    </svg>
  );
}

function UsersRoundIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
    </svg>
  );
}

function SlashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 2 2 22" />
    </svg>
  );
}

function InfoCard({
  icon: Icon,
  value,
  label,
  valueClassName = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  valueClassName?: string;
}) {
  return (
    <div className="h-14 flex flex-col justify-center items-center bg-genius-indigo border border-genius-blue rounded-sm p-1.5 min-h-0">
      <div className={`flex items-center gap-1.5 text-sm ${valueClassName}`}>
        <Icon className="size-3.5 shrink-0" />
        <div>{value}</div>
      </div>
      <div className="text-[10px] text-genius-cream/50 uppercase">{label}</div>
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
  const [isExpanded, setIsExpanded] = useState(true);
  const { holders, loading } = useHolders(tokenAddress, chainId);
  const { profile } = useTokenProfile(tokenAddress);

  let top10Pct = "-";
  if (!loading && holders.length > 0) {
    const sum = holders.slice(0, 10).reduce((acc, h) => acc + (h.percentage || 0), 0);
    if (sum > 0) top10Pct = `${sum.toFixed(2)}%`;
  }
  const top10Red = top10Pct !== "-" && top10Pct !== "—";
  const holdersCount =
    !loading && holders.length > 0 ? holders.length.toLocaleString() : "77,564";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <button
        type="button"
        onClick={() => setIsExpanded((e) => !e)}
        className="flex items-center gap-1 text-xs py-2 px-4 hover:opacity-70 transition-opacity cursor-pointer text-left w-full"
      >
        Token Info
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform shrink-0 ${isExpanded ? "" : "-rotate-90"}`}
          aria-hidden
        />
      </button>

      {isExpanded && (
        <div
          className="flex flex-col gap-3 p-4 pt-1 min-h-0 overflow-y-auto"
          data-sentry-component="AdvancedOverviewTokenInfo"
          data-sentry-source-file="AdvancedOverviewTokenInfo.tsx"
        >
          <div className="grid grid-cols-3 gap-3 text-sm border-l-0">
            <InfoCard
              icon={UserStarIcon}
              value={top10Pct}
              label="TOP 10 H."
              valueClassName={top10Red ? "text-genius-red" : ""}
            />
            <InfoCard icon={ChefHatIcon} value="-" label="DEV H." />
            <InfoCard icon={Crosshair} value="-" label="SNIPERS H." />
            <InfoCard icon={HatGlasseIcon} value="-" label="INSIDERS H." />
            <InfoCard icon={VirusIcon} value="-" label="BUNDLERS H." />
            <InfoCard
              icon={DexPaymentIcon}
              value="Unpaid"
              label="DEX PAYMENT"
              valueClassName="text-genius-red"
            />
            <div className="col-span-3 flex gap-3">
              <InfoCard
                icon={UsersRoundIcon}
                value={holdersCount}
                label="Holders"
              />
              <InfoCard icon={Flame} value="-" label="LP BURNED" />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 border border-genius-blue rounded-sm hover:opacity-70 transition-opacity cursor-pointer">
            <div className="flex items-center gap-1 text-xs">
              <FileText className="w-3.5 h-3.5 opacity-50 shrink-0" aria-hidden />
              <span className="opacity-50">CA:</span> {truncateAddress(tokenAddress)}
            </div>
            <ExternalLink
              className="w-3.5 h-3.5 opacity-50 hover:opacity-70 transition-opacity shrink-0"
              aria-hidden
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2 border border-genius-blue rounded-sm hover:opacity-70 transition-opacity cursor-pointer">
            <div className="flex items-center gap-1 text-xs">
              <ChefHatIcon className="size-3.5 opacity-50 shrink-0" />
              <span className="opacity-50">DA:</span> {truncateAddress(tokenAddress)}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <ChefHatIcon className="size-3.5 text-genius-cream/50 hover:opacity-70 transition-opacity cursor-pointer" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                  <SlashIcon className="h-3.5 w-3.5 text-genius-cream/50" />
                </div>
              </div>
              <ExternalLink
                className="w-3.5 h-3.5 opacity-50 hover:opacity-70 transition-opacity shrink-0"
                aria-hidden
              />
            </div>
          </div>

          {profile && (
            <div className="p-3 border border-genius-blue rounded-sm bg-genius-indigo flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] text-genius-cream">
                <span className="font-semibold">Profile</span>
                {profile.links?.[0]?.url && (
                  <a
                    href={profile.links[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-genius-green hover:opacity-80"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {profile.description && (
                <p className="text-[10px] text-genius-cream/60 leading-snug line-clamp-3">
                  {profile.description}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
