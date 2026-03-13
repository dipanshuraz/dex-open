"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MAIN_NAV_ITEMS } from "@/dummy/header";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import { formatNumber } from "@/lib/utils";
import { TrendingFlameIcon } from "@/components/icons/TrendingFlameIcon";
import { StarIcon } from "@/components/icons/StarIcon";
import { ClockIcon } from "@/components/icons/ClockIcon";

const WETH_LOGO =
  "https://www.tradegenius.com/api/proxy-image?url=https%3A%2F%2Fcrypto-token-logos-production.s3.us-west-2.amazonaws.com%2F1_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_small_large_thumb_05b36ccc-965a-44c9-9a7d-075ba457b63c.png";

const Header = () => {
  const { tokens, loading } = useTrendingTokens();
  const displayTokens = tokens.slice(0, 20);
  const [isTrendingCollapsed, setIsTrendingCollapsed] = useState(false);

  return (
    <header className="z-100 fixed top-0 left-0 right-0 flex flex-col bg-genius-indigo">
      {/* Top navigation row - matches reference structure */}
      <div className="flex justify-between items-center border-b border-genius-blue px-4 py-2.5">
        <div className="flex items-center gap-3 pl-2">
          <Link href="/asset">
            <div
              className="relative overflow-hidden -translate-y-[0.05rem]"
              style={{ width: 24, height: 25, minWidth: 24, minHeight: 25 }}
            >
              <Image
                src="/static/genius-advanced.svg"
                alt="Genius"
                width={24}
                height={25}
                className="absolute top-0 left-0"
                loading="eager"
              />
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {MAIN_NAV_ITEMS.slice(0, 7).map((item) => (
              <div key={item.href} className="relative">
                <Link href={item.href}>
                  <div className="text-sm px-2.5 py-1 rounded-sm hover:text-genius-pink transition-colors flex items-center gap-1 hover:bg-genius-pink/20">
                    {item.label}
                  </div>
                </Link>
              </div>
            ))}

            {/* Airdrop pill */}
            <div className="relative">
              <Link href={MAIN_NAV_ITEMS[7]?.href ?? "/points/you"}>
                <div className="text-sm px-2.5 py-1 rounded-sm hover:text-genius-pink transition-colors flex items-center gap-1">
                  <div className="flex items-center gap-2 relative h-2 w-2 cursor-pointer">
                    <div className="cursor-pointer z-999 absolute w-[100px] h-[20px] mx-auto flex max-w-lg items-center justify-center rounded-full">
                      <div className="relative z-10 flex w-full cursor-pointer items-center overflow-hidden rounded-full border border-genius-pink/20 p-[1.5px]">
                        <div className="animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(#FFA3C8_20deg,transparent_120deg)]" />
                        <div className="text-sm relative z-20 flex w-full rounded-full bg-linear-to-b from-genius-blue to-genius-indigo px-2 py-1.5 gap-2 items-center">
                          <div className="relative overflow-hidden" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18 }}>
                            <Image
                              src="/static/genius-advanced.svg"
                              alt="Genius"
                              width={18}
                              height={18}
                              className="absolute top-0 left-0"
                              loading="eager"
                            />
                          </div>
                          Airdrop
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button
            type="button"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 bg-transparent p-2"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-search"
              aria-hidden="true"
            >
              <path d="m21 21-4.34-4.34" />
              <circle cx="11" cy="11" r="8" />
            </svg>
          </button>

          {/* Token selector & zap */}
          <div className="flex items-center border border-genius-blue rounded-sm">
            <div className="flex items-center gap-2 py-[6px] px-2 hover:bg-genius-blue cursor-pointer transition-colors">
              <div className="relative overflow-hidden w-4 h-4 rounded-full" style={{ minWidth: 16, minHeight: 16 }}>
                <Image
                  src={WETH_LOGO}
                  alt="Token"
                  fill
                  className="absolute top-0 left-0"
                  loading="eager"
                  unoptimized
                />
              </div>
              <div className="text-sm max-w-16 truncate">WETH</div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-clipboard-list cursor-pointer"
                aria-hidden="true"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="M12 11h4" />
                <path d="M12 16h4" />
                <path d="M8 11h.01" />
                <path d="M8 16h.01" />
              </svg>
            </div>
            <div className="w-px h-4 bg-genius-blue" />
            <div className="py-[8px] px-2 hover:bg-genius-blue cursor-pointer transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-zap text-genius-pink fill-genius-pink"
                aria-hidden="true"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </div>
          </div>

          <input id="search-input" placeholder="Search" className="hidden" readOnly aria-hidden="true" />

          {/* Spin button */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/static/geniusImages/spin-button.svg"
              alt="Spin"
              className="cursor-pointer h-8.5 object-cover"
            />
          </div>

          {/* Refer / Deposit / balances / notifications / user */}
          <div className="w-fit flex items-center gap-1.5 mx-0">
            <div className="relative">
              <button
                type="button"
                className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all dark:text-genius-pink-foreground py-[7px] bg-genius-pink/20 text-genius-pink px-4 cursor-default lg:hover:brightness-100"
              >
                Refer
              </button>
            </div>
            <button
              type="button"
              className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 bg-genius-blue py-[7px] px-4"
            >
              Deposit
            </button>
            <div className="flex relative items-center gap-2 border border-genius-blue rounded-sm py-[6px] px-2 cursor-default">
              <div className="flex items-center gap-1.5">
                <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 opacity-50">
                  <circle stroke="currentColor" strokeWidth="1" cx="12" cy="12" r="10" />
                  <circle fill="currentColor" cx="12" cy="12" r="7" />
                </svg>
                <span className="text-sm">$0</span>
              </div>
              <div className="w-px h-4 bg-genius-blue" />
              <div className="flex items-center gap-1.5">
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
                  className="lucide lucide-infinity w-4 h-4 opacity-50"
                  aria-hidden="true"
                >
                  <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8" />
                </svg>
                <span className="text-sm">$0</span>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue p-2"
              aria-label="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-bell-dot"
                aria-hidden="true"
              >
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M13.916 2.314A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.74 7.327A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673 9 9 0 0 1-.585-.665" />
                <circle cx="18" cy="8" r="3" />
              </svg>
            </button>

            {/* Notification panel (hidden by default) */}
           
              <div className="relative">
                <div className="border-b border-genius-blue">
                  <div className="w-5/6 flex gap-1.5 p-3 pr-8 overflow-x-auto">
                    <button
                      type="button"
                      className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue lg:text-xs px-4 py-1.5 bg-genius-blue"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue lg:text-xs px-4 py-1.5"
                    >
                      Spot
                    </button>
                    <button
                      type="button"
                      className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue lg:text-xs px-4 py-1.5"
                    >
                      Deposits and Withdraws
                    </button>
                    <button
                      type="button"
                      className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 border border-genius-blue lg:text-xs px-4 py-1.5"
                    >
                      Perps
                    </button>
                  </div>
                </div>
                <div className="z-1 absolute right-12 top-0 bottom-px w-14 bg-linear-to-l from-genius-indigo to-transparent pointer-events-none" />
                <div className="z-2 absolute right-3 top-1/2 -translate-y-[calc(50%+0.5px)] flex items-center gap-0.5">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all bg-transparent p-[7px] hover:bg-genius-blue lg:hover:brightness-100"
                    aria-label="Notification settings"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-cog"
                      aria-hidden="true"
                    >
                      <path d="M11 10.27 7 3.34" />
                      <path d="m11 13.73-4 6.93" />
                      <path d="M12 22v-2" />
                      <path d="M12 2v2" />
                      <path d="M14 12h8" />
                      <path d="m17 20.66-1-1.73" />
                      <path d="m17 3.34-1 1.73" />
                      <path d="M2 12h2" />
                      <path d="m20.66 17-1.73-1" />
                      <path d="m20.66 7-1.73 1" />
                      <path d="m3.34 17 1.73-1" />
                      <path d="m3.34 7 1.73 1" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all bg-transparent p-[7px] hover:bg-genius-red/20 hover:text-genius-red lg:hover:brightness-100"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            
            

            {/* User / settings */}
            <div className="relative flex items-center">
              <svg role="img" viewBox="0 0 20 20" className="w-5 h-5" aria-hidden="true">
                <path
                  d="M11.4984 17.4999C11.5063 17.553 11.5203 17.6062 11.5375 17.6562H6.09367V15.625C6.09367 15.3656 5.8843 15.1563 5.62492 15.1563C5.36553 15.1563 5.15617 15.3656 5.15617 15.625V17.6562H2.5C2.41406 17.6562 2.34375 17.5859 2.34375 17.4999V14.6766C2.34375 12.5297 4.09225 10.7812 6.23908 10.7812H9.03125L8.85 11.0938L8.6625 11.4203C8.33282 11.9906 8.46718 12.7047 8.98125 13.1172L9.26562 13.3437C9.26405 13.375 9.26405 13.4062 9.26405 13.4375C9.26405 13.4687 9.26405 13.5 9.26562 13.5312L8.98125 13.7578C8.46718 14.1703 8.33282 14.8843 8.6625 15.4546L9.3 16.5609C9.53593 16.9702 9.97657 17.2234 10.4484 17.2234C10.6141 17.2234 10.775 17.1937 10.9297 17.1343L11.2672 17.0031C11.3219 17.0359 11.3781 17.0671 11.4344 17.0984L11.4719 17.3437L11.4891 17.4577C11.4906 17.4718 11.4937 17.4859 11.4984 17.4999L11.4984 17.4999ZM8.7501 8.90608C10.5594 8.90608 12.0313 7.43422 12.0313 5.62492C12.0313 3.81562 10.5594 2.34375 8.7501 2.34375C6.9408 2.34375 5.46894 3.81562 5.46894 5.62492C5.46894 7.43422 6.9408 8.90608 8.7501 8.90608ZM17.4001 14.9858L16.7626 16.092C16.6907 16.2154 16.561 16.2858 16.4267 16.2858C16.3798 16.2858 16.3314 16.2779 16.286 16.2592L15.6829 16.0264C15.636 16.0076 15.5892 15.9982 15.5407 15.9982C15.4626 15.9982 15.386 16.0232 15.3204 16.0686C15.1501 16.192 14.9688 16.2982 14.7751 16.3857C14.6579 16.4373 14.5782 16.5482 14.5579 16.6764L14.4595 17.3154C14.4298 17.5045 14.2673 17.6436 14.0751 17.6436H12.8001C12.6798 17.6436 12.5704 17.5889 12.4985 17.4998C12.4626 17.4561 12.436 17.403 12.4235 17.3436C12.4189 17.3342 12.4173 17.3248 12.4157 17.3155L12.3173 16.6748C12.297 16.5483 12.2173 16.4373 12.1001 16.3842C11.9079 16.2967 11.7251 16.1904 11.5548 16.0686C11.4892 16.0217 11.4126 15.9982 11.336 15.9982C11.2876 15.9982 11.2392 16.0076 11.1939 16.0248L10.5892 16.2592C10.5439 16.2779 10.4954 16.2857 10.4485 16.2857C10.3142 16.2857 10.1845 16.2154 10.1126 16.092L9.47511 14.9857C9.3798 14.8201 9.41886 14.6092 9.56886 14.4889L10.0735 14.0842C10.1735 14.0045 10.2282 13.8795 10.2157 13.7514C10.2064 13.6482 10.2017 13.5435 10.2017 13.4373C10.2017 13.331 10.2064 13.2279 10.2173 13.1248C10.2298 12.9967 10.1735 12.8717 10.0735 12.7904L9.56886 12.3857C9.41886 12.2654 9.37979 12.0545 9.47511 11.8889L9.93293 11.0936L10.0236 10.9373L10.1126 10.7826C10.1126 10.7826 10.1126 10.7811 10.1142 10.7811C10.1861 10.6592 10.3142 10.5889 10.4485 10.5889C10.4954 10.5889 10.5439 10.5967 10.5892 10.6154L11.0157 10.7811L11.1939 10.8498C11.2392 10.867 11.2876 10.8764 11.3361 10.8764C11.4126 10.8764 11.4892 10.8529 11.5548 10.8061C11.5673 10.7983 11.5782 10.7889 11.5907 10.7811C11.7501 10.6701 11.922 10.5717 12.1001 10.4904C12.2173 10.4373 12.297 10.3264 12.3173 10.1998L12.4157 9.55917C12.4454 9.3701 12.6079 9.23104 12.8001 9.23104H14.0751C14.2673 9.23104 14.4298 9.3701 14.4595 9.55917L14.5579 10.1982C14.5782 10.3264 14.6579 10.4373 14.7751 10.4889C14.9688 10.5764 15.1501 10.6826 15.3204 10.8061C15.386 10.8514 15.4626 10.8764 15.5407 10.8764C15.5892 10.8764 15.636 10.867 15.6829 10.8482L16.286 10.6154C16.3313 10.5967 16.3798 10.5889 16.4267 10.5889C16.561 10.5889 16.6907 10.6592 16.7626 10.7826L17.4001 11.8889C17.4954 12.0545 17.4563 12.2654 17.3063 12.3857L16.8017 12.7904C16.7017 12.8717 16.6454 12.9967 16.6579 13.1248C16.6688 13.2279 16.6735 13.331 16.6735 13.4373C16.6735 13.5435 16.6688 13.6482 16.6595 13.7513C16.647 13.8795 16.7017 14.0045 16.8017 14.0842L17.3063 14.4888C17.4563 14.6092 17.4954 14.8201 17.4001 14.9857L17.4001 14.9858ZM14.7501 13.4373C14.7501 12.7139 14.161 12.1248 13.4376 12.1248C13.3985 12.1248 13.361 12.1264 13.3235 12.1295C12.6532 12.1873 12.1251 12.7529 12.1251 13.4373C12.1251 14.0373 12.5298 14.5436 13.0798 14.6998C13.1939 14.7326 13.3142 14.7498 13.4376 14.7498C14.161 14.7498 14.7501 14.1608 14.7501 13.4373Z"
                  fill="#EDDFFF"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trending row */}
      <div
        className={`items-center border-t border-genius-blue flex bg-genius-indigo transition-all duration-300 ease-in-out ${
          isTrendingCollapsed ? "h-0 opacity-0 pointer-events-none" : "h-9 opacity-100"
        }`}
      >
        <div className="flex items-center gap-2.5 pl-3">
          <TrendingFlameIcon />
          <StarIcon />
          <ClockIcon />
        </div>

        <div className="relative h-full w-[calc(100%-5rem)] flex items-center">
          <div className="absolute z-10 left-0 top-0 bottom-0 w-4 bg-linear-to-r from-genius-indigo to-transparent" />
          <div className="absolute z-10 right-0 top-0 bottom-0 w-4 bg-linear-to-l from-genius-indigo to-transparent" />

          {loading && displayTokens.length === 0 ? (
            <div className="w-full flex items-center gap-2 px-2 text-[11px] text-genius-cream/60">
              <div className="w-3 h-3 border-2 border-genius-pink/40 border-t-genius-pink rounded-full animate-spin" />
              <span>Loading trending…</span>
            </div>
          ) : displayTokens.length === 0 ? (
            <div className="w-full flex items-center px-2 text-[11px] text-genius-cream/50">
              No trending tokens
            </div>
          ) : (
            <div className="w-full flex items-center gap-1 overflow-x-auto px-2 py-[0.27rem] custom-scrollbar">
              {displayTokens.map((token) => {
                const isUp = token.change24h >= 0;
                return (
                  <Link
                    key={`${token.chainId}-${token.pairAddress}`}
                    href={`/${token.chainId}/${token.pairAddress}`}
                    className="flex items-center gap-1 hover:bg-genius-blue hover:text-genius-cream rounded-sm px-1.5 py-0.5 transition-all"
                  >
                    <div className="relative rounded-sm w-4 h-4 overflow-hidden object-cover">
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center text-[9px] bg-genius-blue/40 rounded-sm w-full h-full">
                          {token.symbol[0] ?? "?"}
                        </div>
                      )}
                    </div>
                    <div className="text-sm truncate max-w-[100px]">{token.symbol}</div>
                    <div className="text-sm text-genius-cream/50 text-center w-[66.5px]">
                      ${formatNumber(token.marketCap)}
                    </div>
                    <div
                      className={`px-1 rounded-[2px] flex justify-center items-center gap-1 ${
                        isUp ? "bg-genius-green/20 text-genius-green" : "bg-genius-red/20 text-genius-red"
                      } w-[56px]`}
                    >
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 512 512"
                        className={`min-h-2 min-w-2 h-2 w-2 ${isUp ? "" : "rotate-180"}`}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M256 32 20 464h472L256 32z" />
                      </svg>
                      <div className="text-[10px] items-center">
                        {Math.abs(token.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle for trending strip */}
      <button
        type="button"
        onClick={() => setIsTrendingCollapsed((prev) => !prev)}
        className="flex absolute left-5 -bottom-2 z-110 bg-genius-indigo border border-genius-blue rounded-sm px-2 py-0.5 hover:bg-genius-blue transition-colors duration-300 ease-in-out"
        aria-label={isTrendingCollapsed ? "Show trending tokens" : "Hide trending tokens"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-chevron-up w-3 h-3 text-genius-cream transition-transform ${
            isTrendingCollapsed ? "" : "rotate-180"
          }`}
          aria-hidden="true"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </header>
  );
};

export default Header;
