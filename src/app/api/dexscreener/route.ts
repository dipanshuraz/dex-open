import { NextRequest, NextResponse } from "next/server";

// Server-side proxy for DexScreener REST API — no API key required.
// Accepts { chainId, tokenAddress } and fetches all pools for that token,
// returning the most liquid pair as the first element.
export async function POST(req: NextRequest) {
  const { chainId, tokenAddress, pairAddress } = await req.json();

  if (!chainId || (!tokenAddress && !pairAddress)) {
    return NextResponse.json({ error: "Missing chainId, tokenAddress or pairAddress" }, { status: 400 });
  }

  // Choose endpoint based on whether we have a token or a specific pair
  const url = pairAddress 
    ? `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`
    : `https://api.dexscreener.com/token-pairs/v1/${chainId}/${tokenAddress}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `DexScreener responded ${res.status}` }, { status: res.status });
  }

  const data = await res.json();

  // /latest/dex/pairs returns { pairs: [...] }
  // /token-pairs/v1 returns [...] directly
  const pairs = Array.isArray(data) ? data : (data.pairs || []);

  return NextResponse.json({
    schemaVersion: "1.0.0",
    pairs: pairs,
  });
}
