import { NextRequest, NextResponse } from "next/server";

// Proxy for Dexscreener token profiles.
// GET /api/token-profiles?token=0x...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenAddress = searchParams.get("token");

  try {
    const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 }, // profiles change infrequently
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Dexscreener responded ${res.status}` },
        { status: res.status }
      );
    }

    const profiles = await res.json();

    // If no specific token requested, just return the raw list
    if (!tokenAddress) {
      return NextResponse.json(profiles);
    }

    const lower = tokenAddress.toLowerCase();
    const match =
      Array.isArray(profiles) &&
      profiles.find((p: any) => p.tokenAddress?.toLowerCase() === lower);

    if (!match) {
      return NextResponse.json(null);
    }

    return NextResponse.json(match);
  } catch (err: any) {
    console.error("Dexscreener token-profiles API error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

