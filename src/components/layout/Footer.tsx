"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings2,
  Headphones,
  BookOpenText,
  Percent,
  Languages,
  MoreHorizontal,
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";

const BASE_IMG = "https://www.tradegenius.com/static/geniusImages";

export type TickerItem = {
  symbol: string;
  name: string;
  price: number;
  image: string;
  chain: string;
  address: string;
};

const MAJOR_TICKERS: TickerItem[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 71449.886,
    image: `${BASE_IMG}/perpetuals_logo/BTC.png`,
    chain: "ethereum",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2111.294,
    image: `${BASE_IMG}/advanced_network_logos/ethereum.png`,
    chain: "ethereum",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 88.742,
    image: `${BASE_IMG}/advanced_network_logos/solana.png`,
    chain: "solana",
    address: "So11111111111111111111111111111111111111112",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    price: 0.096064,
    image: `${BASE_IMG}/advanced_network_logos/polygon.png`,
    chain: "polygon",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: 9.77386,
    image: `${BASE_IMG}/advanced_network_logos/avalanche.png`,
    chain: "ethereum",
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 657.438,
    image: `${BASE_IMG}/advanced_network_logos/binance.png`,
    chain: "bsc",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  },
  {
    symbol: "S",
    name: "Sonic",
    price: 0.04256,
    image: `${BASE_IMG}/advanced_network_logos/sonic.png`,
    chain: "ethereum",
    address: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
  },
  {
    symbol: "SUI",
    name: "Sui",
    price: 1.000102,
    image: `${BASE_IMG}/advanced_network_logos/sui.png`,
    chain: "ethereum",
    address: "0x0000000000000000000000000000000000000000000000000000000000000002",
  },
  {
    symbol: "HYPE",
    name: "Hype",
    price: 36.702,
    image: `${BASE_IMG}/advanced_network_logos/hype.png`,
    chain: "ethereum",
    address: "0x5555555555555555555555555555555555555555",
  },
];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
  if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
}

function TickerChip({ ticker, compact = false }: { ticker: TickerItem; compact?: boolean }) {
  const href = `/${ticker.chain}/${ticker.address}`;
  return (
    <Link href={href}>
      <div className="flex items-center gap-2 hover:opacity-70 transition-opacity">
        <div className="relative overflow-hidden shrink-0" style={{ width: 20, height: 20 }}>
          <Image
            src={ticker.image}
            alt={ticker.symbol}
            width={20}
            height={20}
            className="absolute top-0 left-0 object-cover"
            unoptimized
          />
        </div>
        <span className="whitespace-nowrap text-sm">{formatPrice(ticker.price)}</span>
        {!compact && <span className="text-sm text-genius-cream/50">{ticker.symbol}</span>}
      </div>
    </Link>
  );
}

export function Footer() {
  const [tickerPopupOpen, setTickerPopupOpen] = useState(false);
  const [tickerVisible, setTickerVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(MAJOR_TICKERS.map((t) => [t.symbol, ["BTC", "ETH", "SOL"].includes(t.symbol)]))
  );

  const footerTickers = MAJOR_TICKERS.filter((t) => tickerVisible[t.symbol]);

  return (
    <footer className="z-100 fixed bottom-0 left-0 right-0 flex justify-between items-center bg-genius-indigo border-t border-genius-blue py-2 px-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-genius-green/20 text-sm text-genius-green rounded-sm px-2.5 py-1 cursor-default">
          <div className="w-1.5 h-1.5 bg-genius-green rounded-full animate-pulse" />
          <span>Live</span>
          <span className="text-xs">ap-south-1</span>
        </div>
        <button
          type="button"
          className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 gap-2 py-[3px] px-2 bg-genius-pink/20 text-genius-pink"
        >
          <Settings2 className="w-3.5 h-3.5" aria-hidden />
          Trading Settings
        </button>
        <button
          type="button"
          className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 px-2 gap-2 bg-genius-indigo border border-genius-blue py-[3px]"
        >
          <Headphones className="w-4 h-4" aria-hidden />
          Help
        </button>
        <button
          type="button"
          className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 px-2 gap-2 bg-genius-indigo border border-genius-blue py-[3px]"
        >
          <BookOpenText className="w-4 h-4" aria-hidden />
          Docs
        </button>
        <button
          type="button"
          className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 px-2 gap-2 bg-genius-indigo border border-genius-blue py-[3px]"
        >
          <Percent className="w-4 h-4" aria-hidden />
          PnL
        </button>
        <button
          type="button"
          className="inline-flex p-4 items-center justify-center whitespace-nowrap rounded-sm text-md lg:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:brightness-50 transition-all lg:hover:brightness-75 px-2 gap-2 bg-genius-indigo border border-genius-blue py-[3px]"
          aria-haspopup="menu"
          aria-expanded={false}
        >
          <Languages className="w-4 h-4" aria-hidden />
          English
        </button>
      </div>

      <div className="relative flex items-center">
        <div className="absolute z-10 left-0 top-0 bottom-0 w-6 bg-linear-to-r from-genius-indigo to-transparent pointer-events-none" />
        <div className="absolute z-10 right-4 top-0 bottom-0 w-6 bg-linear-to-l from-genius-indigo to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-6 overflow-x-auto overflow-y-hidden max-w-[45vw] pl-4 pr-5 custom-scrollbar">
          {footerTickers.map((ticker) => (
            <TickerChip key={ticker.symbol} ticker={ticker} compact />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTickerPopupOpen((o) => !o)}
          className="z-10 text-genius-cream/50 hover:text-genius-cream transition-colors p-1"
          aria-label="Major tickers"
        >
          <MoreHorizontal className="w-[18px] h-[18px]" aria-hidden />
        </button>
      </div>

      <div
        className={`absolute bottom-12 right-0 w-[360px] genius-shadow flex flex-col gap-2 bg-genius-indigo border border-genius-blue rounded-md py-3 px-4 transition-opacity ${
          tickerPopupOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!tickerPopupOpen}
      >
        <div className="text-xs text-genius-cream/50">MAJOR TICKERS</div>
        {MAJOR_TICKERS.map((ticker) => (
          <div key={ticker.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative overflow-hidden shrink-0" style={{ width: 20, height: 20 }}>
                <Image
                  src={ticker.image}
                  alt={ticker.symbol}
                  width={20}
                  height={20}
                  className="absolute top-0 left-0 object-cover"
                  unoptimized
                />
              </div>
              <span className="text-sm">{ticker.symbol}</span>
              <span className="text-sm text-genius-cream/50">{formatPrice(ticker.price)}</span>
            </div>
            <Switch
              checked={tickerVisible[ticker.symbol]}
              onCheckedChange={(checked) =>
                setTickerVisible((prev) => ({ ...prev, [ticker.symbol]: checked }))
              }
              aria-label={`Toggle ${ticker.symbol} in ticker bar`}
            />
          </div>
        ))}
      </div>
    </footer>
  );
}
