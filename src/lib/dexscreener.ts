// DexScreener typed response shapes

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: { m5: number; h1: number; h6: number; h24: number };
  priceChange: { m5: number; h1: number; h6: number; h24: number };
  liquidity: { usd: number; base: number; quote: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number; // unix ms
  info?: {
    imageUrl?: string;
    websites?: { url: string }[];
    socials?: { platform: string; handle: string }[];
  };
  boosts?: { active: number };
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexPair[] | null;
}

const STABLE_QUOTES = ["USDC", "USDT", "WETH", "WBTC", "DAI", "WETH.E", "USDC.E"];

export type SupportLevel = "NATIVE_DECODE" | "FALLBACK";

/**
 * Maps DexScreener dexId to a decoding support level.
 */
export function getSupportLevel(dexId: string): SupportLevel {
  const native = ["uniswap", "uniswap-v3", "pancakeswap", "sushiswap", "quickswap", "thruster"];
  return native.includes(dexId.toLowerCase()) ? "NATIVE_DECODE" : "FALLBACK";
}

/**
 * Smart Pool Detector: Selects the "best" pool for a token.
 * 1. Filter pools with liquidity > $50k
 * 2. Score = liquidity.usd * 0.7 + volume.h24 * 0.3
 * 3. Return top pool
 */
export function selectBestPool(pairs: DexPair[]): DexPair | null {
  if (!pairs || pairs.length === 0) return null;

  // 1. Filter pools with > $50k liquidity
  const liquidPools = pairs.filter((p) => (p.liquidity?.usd ?? 0) > 50000);
  
  // If no pools > $50k, fall back to all pools
  const candidates = liquidPools.length > 0 ? liquidPools : pairs;

  // 2. Score pools
  const scored = candidates.map((p) => {
    const liq = p.liquidity?.usd ?? 0;
    const vol = p.volume?.h24 ?? 0;
    const score = liq * 0.7 + vol * 0.3;
    return { pair: p, score };
  });

  // 3. Sort and pick top
  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.pair ?? null;
}

// Shared fetch helper — calls our server-side proxy
export async function fetchPairs(
  chainId: string, 
  address: string, 
  searchType: "token" | "pair" = "token"
): Promise<DexPair[]> {
  const body: any = { chainId };
  if (searchType === "pair") body.pairAddress = address;
  else body.tokenAddress = address;

  const res = await fetch("/api/dexscreener", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error ?? `HTTP ${res.status}`);
  }

  const data: DexScreenerResponse = await res.json();
  return data.pairs ?? [];
}

/** @deprecated Use fetchPairs + selectBestPool for tokens, or fetchPairs(..., "pair") for specific pools */
export async function fetchPair(chainId: string, address: string): Promise<DexPair | null> {
  // If it's a specific pool lookup (e.g. from usePairMetadata), use "pair" type
  // A heuristic: if it looks like a single valid address, we'll try pair first? 
  // Actually, usePairMetadata usually passes a pair address.
  const pairs = await fetchPairs(chainId, address, "pair");
  if (pairs.length > 0) return pairs[0];
  
  // Fallback to token search if no pair found (backward compatibility)
  const tokenPairs = await fetchPairs(chainId, address, "token");
  return selectBestPool(tokenPairs);
}
