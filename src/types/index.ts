export interface Trade {
  id: string;
  txHash: string;
  logIndex: number;
  trader: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  timestamp: number;
  isNew?: boolean;
  isWhale?: boolean;
}

export interface Holder {
  rank: number;
  address: string;
  balance: number;
  percentage: number | null;
  valueUsd: number | null;
}

export interface Pool {
  dex: string;
  pair: string;
  liquidity: number;
  volume: number;
  age: number;
  pairAddress: string;
  url: string;
}

export interface MarketOption {
  id: string;
  label: string;
  dexId: string;
  liquidityUsd: number;
  pairAddress: string;
  isPreferred: boolean;
}

export interface TokenProfile {
  tokenAddress: string;
  icon?: string;
  header?: string | null;
  description?: string | null;
  links?: { type?: string | null; label?: string | null; url: string }[] | null;
}

export interface TrendingToken {
  symbol: string;
  marketCap: number;
  change24h: number;
  volume24h: number;
  txns24h: number;
  trendScore: number;
  pairAddress: string;
  chainId: string;
  logo: string | null;
  tokenAddress?: string;
  boosts?: { score?: number } | null;
}

export interface OHLCCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type TimeframeKey = "m5" | "h1" | "h6" | "h24";

export interface TimeframeItem {
  key: TimeframeKey;
  label: string;
  value: string;
  positive: boolean;
  active?: boolean;
}

export interface TokenStatsData {
  volumeLabel: string;
  volumeValue: string;
  buysCount: string;
  buysValue: string;
  sellsCount: string;
  sellsValue: string;
  volChange: string;
  volChangePositive: boolean;
  buyBarPercent: number;
}

export type { DexPair } from "@/lib/dexscreener";
