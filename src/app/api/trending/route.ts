import { NextResponse } from "next/server";
import type { DexPair } from "@/lib/dexscreener";

// Ensure route itself is revalidated regularly
export const revalidate = 60;

interface TrendingTokenResponse {
  symbol: string;
  marketCap: number;
  change24h: number;
  volume24h: number;
  txns24h: number;
  trendScore: number;
  pairAddress: string;
  chainId: string;
  logo: string | null;
  // Extra fields used by sidebar panel
  tokenAddress?: string;
  boosts?: { score?: number } | null;
}

export async function GET() {
  try {
    // 1. Fetch boosted tokens
    const boostsRes = await fetch(
      "https://api.dexscreener.com/token-boosts/latest/v1",
      { next: { revalidate: 60 } }
    );

    let boostedPairs: DexPair[] = [];

    if (boostsRes.ok) {
      const boosts = (await boostsRes.json()) as { tokenAddress?: string }[];
      const addresses = Array.from(
        new Set(boosts.map((b) => b.tokenAddress).filter(Boolean))
      ).slice(0, 50); // cap to avoid huge requests

      if (addresses.length > 0) {
        const tokensRes = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`,
          { next: { revalidate: 60 } }
        );

        if (tokensRes.ok) {
          const tokensData: { pairs?: DexPair[] } = await tokensRes.json();
          boostedPairs = tokensData.pairs ?? [];
        }
      }
    }

    let allPairs: DexPair[] = [...boostedPairs];

    // 2. Fallback searches if we don't have enough boosted pairs
    if (allPairs.length < 20) {
      const queries = ["sol", "eth", "usdc"];
      const searchResponses = await Promise.all(
        queries.map((q) =>
          fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`, {
            next: { revalidate: 60 },
          }).catch(() => null)
        )
      );

      for (const res of searchResponses) {
        if (!res || !res.ok) continue;
        const data: { pairs?: DexPair[] } = await res.json();
        if (data.pairs) {
          allPairs = allPairs.concat(data.pairs);
        }
      }
    }

    // 3. Filter & dedupe tokens
    const seen = new Set<string>();

    const filtered: DexPair[] = allPairs.filter((p) => {
      const base = p.baseToken;
      const liquidityUsd = p.liquidity?.usd ?? 0;
      const volume24h = p.volume?.h24 ?? 0;
      const buys = p.txns?.h24?.buys ?? 0;
      const sells = p.txns?.h24?.sells ?? 0;
      const txns24h = buys + sells;

      const hasRequiredFields = Boolean(base?.symbol && p.pairAddress);

      if (
        !hasRequiredFields ||
        liquidityUsd <= 5000 ||
        volume24h <= 2000 ||
        txns24h <= 10
      ) {
        return false;
      }

      const key = `${p.chainId}-${base.address.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });

    // 4. Calculate trend score and normalize
    const scored: TrendingTokenResponse[] = filtered.map((p) => {
      const volume24h = p.volume?.h24 ?? 0;
      const buys = p.txns?.h24?.buys ?? 0;
      const sells = p.txns?.h24?.sells ?? 0;
      const txns24h = buys + sells;
      const priceChange24h = p.priceChange?.h24 ?? 0;
      const liquidityUsd = p.liquidity?.usd ?? 0;

      // Interpret provided formula as a weighted sum of factors
      const trendScore =
        volume24h * 0.5 +
        txns24h * 100 +
        Math.abs(priceChange24h) * 200 +
        liquidityUsd * 0.05;

      const marketCap = p.marketCap ?? p.fdv ?? 0;

      return {
        symbol: p.baseToken.symbol,
        marketCap,
        change24h: priceChange24h,
        volume24h,
        txns24h,
        trendScore,
        pairAddress: p.pairAddress,
        chainId: p.chainId,
        logo: p.info?.imageUrl ?? null,
        tokenAddress: p.baseToken.address,
        boosts: { score: trendScore },
      };
    });

    // 5. Rank tokens by trendScore and return top 20
    scored.sort((a, b) => b.trendScore - a.trendScore);
    const top20 = scored.slice(0, 20);

    // 6. Return normalized response
    return NextResponse.json(top20);
  } catch (error: unknown) {
    console.error("[api/trending] Error:", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
