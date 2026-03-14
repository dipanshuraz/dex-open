import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { tokenAddress, chainId } = await req.json();

  if (!tokenAddress) {
    return NextResponse.json({ error: "Missing tokenAddress" }, { status: 400 });
  }

  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ holders: [], error: "MORALIS_API_KEY not configured" });
  }

  try {
    const chain =
      chainId === "arbitrum"
        ? "0xa4b1"
        : chainId === "optimism"
        ? "0xa"
        : chainId === "polygon"
        ? "0x89"
        : chainId === "bsc"
        ? "0x38"
        : chainId === "base"
        ? "0x2105"
        : "0x1"; // default Ethereum

    const url = new URL(
      `https://deep-index.moralis.io/api/v2.2/erc20/${tokenAddress}/owners`
    );
    url.searchParams.set("chain", chain);
    url.searchParams.set("limit", "50");
    url.searchParams.set("order", "DESC");

    const res = await fetch(url.toString(), {
      headers: {
        "X-API-Key": apiKey,
        accept: "application/json",
      },
      // Cache for a short period server-side
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const message =
        (errJson && (errJson.error || errJson.message)) ||
        `Moralis error HTTP ${res.status}`;
      return NextResponse.json({ holders: [], error: message }, { status: 502 });
    }

    const json = (await res.json()) as { result?: Array<Record<string, unknown>> };

    if (!Array.isArray(json.result)) {
      return NextResponse.json({ holders: [], warning: "No holder data" });
    }

    const holders = json.result.map((h: Record<string, unknown>, i: number) => {
      const rawBalance =
        typeof h.balance === "string"
          ? parseFloat(h.balance)
          : Number(h.balance ?? 0);
      const percentage =
        h.percentage_relative_to_total_supply != null
          ? Number(h.percentage_relative_to_total_supply)
          : null;

      const valueUsd =
        h.usd_value != null ? Number(h.usd_value) : null;

      const balanceFormatted =
        h.balance_formatted != null
          ? Number(h.balance_formatted)
          : !isNaN(rawBalance)
          ? rawBalance
          : 0;

      const address = (h.owner_address ?? h.address ?? "") as string;

      return {
        rank: i + 1,
        address,
        balance: balanceFormatted,
        percentage:
          percentage !== null && isNaN(percentage) ? null : percentage,
        valueUsd: valueUsd !== null && isNaN(valueUsd) ? null : valueUsd,
      };
    });

    return NextResponse.json({ holders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
