import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const chain = searchParams.get("chain") || "ethereum";

  if (!token) {
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chain}/${token}`, {
        // Cache to prevent getting rate-limited too heavily
        next: { revalidate: 30 }
    });
    
    if (!res.ok) {
        throw new Error(`Dexscreener API returned ${res.status}`);
    }

    const pairs = await res.json();

    if (!Array.isArray(pairs)) {
        return NextResponse.json([]);
    }

    interface DexPairRow {
      dexId?: string;
      baseToken?: { symbol?: string };
      quoteToken?: { symbol?: string };
      liquidity?: { usd?: number };
      volume?: { h24?: number };
      pairCreatedAt?: number;
      pairAddress?: string;
      url?: string;
    }

    const pools = (pairs as DexPairRow[])
      .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
      .slice(0, 10)
      .map((pair) => ({
        dex: pair.dexId,
        pair: `${pair.baseToken?.symbol ?? "?"}/${pair.quoteToken?.symbol ?? "?"}`,
        liquidity: pair.liquidity?.usd || 0,
        volume: pair.volume?.h24 || 0,
        age: pair.pairCreatedAt,
        pairAddress: pair.pairAddress,
        url: pair.url || `https://dexscreener.com/${chain}/${pair.pairAddress ?? ""}`,
      }));

    return NextResponse.json(pools);
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json({ error: "Failed to fetch pools" }, { status: 500 });
  }
}
