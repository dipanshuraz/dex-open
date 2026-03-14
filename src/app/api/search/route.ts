import { NextRequest, NextResponse } from "next/server";

// Lightweight proxy to Dexscreener search endpoint.
// GET /api/search?q=ETH/USDC
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing search query ?q=" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Dexscreener responded ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err: unknown) {
    console.error("Dexscreener search API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

