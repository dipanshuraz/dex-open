import { NextRequest, NextResponse } from "next/server";

// CoinGecko OHLC proxy — no API key required for free tier
// Returns candles: [timestamp_ms, open, high, low, close][]
export async function POST(req: NextRequest) {
  const { coingeckoId, days = 7 } = await req.json();

  if (!coingeckoId) {
    return NextResponse.json({ error: "Missing coingeckoId" }, { status: 400 });
  }

  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/ohlc?vs_currency=usd&days=${days}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 }, // cache for 5 min server-side
  });

  if (!res.ok) {
    return NextResponse.json({ error: `CoinGecko responded ${res.status}` }, { status: res.status });
  }

  // Returns [[timestamp_ms, open, high, low, close], ...]
  const raw: [number, number, number, number, number][] = await res.json();

  // Normalise for lightweight-charts: { time (unix seconds), open, high, low, close }
  const candles = raw.map(([ts, o, h, l, c]) => ({
    time: Math.floor(ts / 1000),
    open: o,
    high: h,
    low: l,
    close: c,
  }));

  return NextResponse.json({ candles });
}
