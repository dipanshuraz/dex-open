export type NavItem = {
  label: string;
  href: string;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Discover", href: "/asset" },
  { label: "Launchpads", href: "/launchpads" },
  { label: "Perps", href: "/hyperliquid" },
  { label: "Holdings", href: "/portfolio" },
  { label: "Ghost", href: "/ghost" },
  { label: "Swap", href: "/trade" },
  { label: "Competitions", href: "/points/competitions" },
  { label: "Airdrop", href: "/points/you" },
];

export type TokenSummary = {
  symbol: string;
  network: string;
  badgeSrc: string;
  imageSrc: string;
  marketCap: string;
  changePct: string;
  isDown?: boolean;
};

// Minimal dummy data to power the trending ticker in the header.
export const TRENDING_TOKENS: TokenSummary[] = [
  {
    symbol: "TRUMP",
    network: "Solana",
    badgeSrc: "https://www.tradegenius.com/static/geniusImages/advanced_network_logos/solana.png",
    imageSrc:
      "https://www.tradegenius.com/api/proxy-image?url=https%3A%2F%2Ftoken-media.defined.fi%2F1399811149_6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN_large_34a6fcd4-9c73-4464-976e-328c59ddfc2d.png",
    marketCap: "$754.87M",
    changePct: "35.77%",
  },
  {
    symbol: "SOS",
    network: "Solana",
    badgeSrc: "https://www.tradegenius.com/static/geniusImages/advanced_network_logos/solana.png",
    imageSrc:
      "https://www.tradegenius.com/api/proxy-image?url=https%3A%2F%2Ftoken-media.defined.fi%2F1399811149_DpxKNEi3XVeRByaGqYKvz2w6E2PhPgBAqdayLcQEpump_large_58ce88f14ed3.png",
    marketCap: "$3.43M",
    changePct: "48.82%",
  },
  {
    symbol: "AERO",
    network: "Base",
    badgeSrc: "https://www.tradegenius.com/static/geniusImages/advanced_network_logos/base.png",
    imageSrc:
      "https://www.tradegenius.com/api/proxy-image?url=https%3A%2F%2Ftoken-media.defined.fi%2F8453_0x940181a94a35a4569e4529a3cdfb74e38fd98631_large_d438541c844e.png",
    marketCap: "$301.89M",
    changePct: "0.47%",
    isDown: true,
  },
];

