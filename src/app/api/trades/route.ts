import { NextRequest, NextResponse } from "next/server";
import { getTradesForToken, fetchOlderTrades, getOldestBlock } from "@/lib/tradeStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chain = searchParams.get("chain") || "ethereum";
  const token = searchParams.get("token");
  const beforeBlockParam = searchParams.get("before"); // block number cursor for pagination

  if (!token) {
    return NextResponse.json(
      { error: "Missing required query param: token" },
      { status: 400 }
    );
  }

  try {
    if (beforeBlockParam) {
      // ── Pagination: fetch older trades before this block ──
      const beforeBlock = parseInt(beforeBlockParam, 10);
      const { trades, oldestBlock } = await fetchOlderTrades(chain, token, beforeBlock);
      // hasMore = true as long as we haven't hit block 0
      return NextResponse.json(
        { trades, oldestBlock, hasMore: oldestBlock > 0 },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // ── Normal: return all cached trades ──
    const trades = await getTradesForToken(chain, token);
    const oldestBlock = getOldestBlock(chain, token);
    // hasMore: true as long as the store is initialized (oldestBlock will always be set
    // now that we write it eagerly before the scan loop starts in tradeStore.ts)
    return NextResponse.json(
      { trades, oldestBlock, hasMore: oldestBlock !== undefined },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    console.error("[/api/trades] error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
