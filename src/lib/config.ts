/**
 * Centralized polling configuration for the Web3 Dashboard.
 * All intervals are in milliseconds.
 */

export const POLLING_CONFIG = {
  // Real-time trades (order book style)
  trades: 3000,

  // Transaction snapshots and deltas
  transactions: 5000,

  // General pair metadata (price, liquidity, mcap)
  // Can be overridden by NEXT_PUBLIC_POLL_INTERVAL_SEC env var
  pairMetadata: Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_SEC || 30) * 1000,

  // Trade performance stats (m5, h1, h6, h24)
  // Defaults to the same as pair metadata
  tradeStats: Number(process.env.NEXT_PUBLIC_POLL_INTERVAL_SEC || 30) * 1000,

  // Liquidity pools list
  pools: 30000,

  // Top holders list
  holders: 2 * 60 * 1000, // 2 minutes

  // Candlestick chart data (limited by CoinGecko free tier)
  chartData: 5 * 60 * 1000, // 5 minutes

  // Server-side metadata refresh (tradeStore)
  metadataRefresh: 30000, // 30 seconds
  revalidate: 30, // 30 seconds (Next.js fetch revalidate)
};

export const CHAINS = [
  { id: "ethereum", label: "Ethereum", color: "#627EEA" },
  { id: "solana", label: "Solana", color: "#9945FF" },
  { id: "bsc", label: "BSC", color: "#F0B90B" },
  { id: "arbitrum", label: "Arbitrum", color: "#12AAFF" },
  { id: "base", label: "Base", color: "#0052FF" },
  { id: "polygon", label: "Polygon", color: "#8247E5" },
];

export const SUPPORTED_CHAINS = CHAINS.map(c => c.id);

