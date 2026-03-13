import { NextRequest, NextResponse } from "next/server";

// Simple proxy that fetches Dexscreener pair data and returns
// a reduced transactions-focused payload to the client.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = searchParams.get("chain") || "ethereum";
  const pairAddress = searchParams.get("pair");

  if (!pairAddress) {
    return NextResponse.json(
      { error: "Missing required query param: pair" },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      // Always get the freshest numbers
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Dexscreener responded with ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const pair = json?.pair ?? json?.pairs?.[0];

    if (!pair) {
      return NextResponse.json(
        { error: "Pair not found on Dexscreener" },
        { status: 404 }
      );
    }

    const simplified = {
      priceUsd: Number(pair.priceUsd ?? 0),
      buys5m: Number(pair.txns?.m5?.buys ?? 0),
      sells5m: Number(pair.txns?.m5?.sells ?? 0),
      buys1h: Number(pair.txns?.h1?.buys ?? 0),
      sells1h: Number(pair.txns?.h1?.sells ?? 0),
      // Use 24h USD volume as the primary "volume" figure
      volume: Number(pair.volume?.h24 ?? 0),
      lastUpdated: Date.now(),
    };

    return NextResponse.json(simplified);
  } catch (err: any) {
    console.error("Dexscreener transactions API error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

