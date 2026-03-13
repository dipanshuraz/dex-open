const DEX_ICON_MAP: Record<string, string> = {
  uniswap: "🦄",
  curve: "🔵",
  pancake: "🥞",
  sushiswap: "🍣",
  aerodrome: "✈️",
  raydium: "☀️",
  orca: "🐋",
  balancer: "⚖️",
};

export function getDexIcon(dexId: string): string {
  if (!dexId) return "🏦";
  const key = dexId.toLowerCase();
  return DEX_ICON_MAP[key] ?? "🏦";
}

