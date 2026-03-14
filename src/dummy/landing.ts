export type QuickExample = {
  chain: string;
  address: string;
  label: string;
};

export const LANDING_EXAMPLES: QuickExample[] = [
  { chain: "ethereum", address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", label: "cbBTC" },
  { chain: "ethereum", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", label: "USDC" },
  { chain: "ethereum", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", label: "WETH" },
  { chain: "ethereum", address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", label: "UNI" },
  { chain: "ethereum", address: "0x514910771af9ca656af840dff83e8264ecf986ca", label: "LINK" },
  { chain: "ethereum", address: "0x6982508145454ce325ddbe47a25d4ec3d2311933", label: "PEPE" },
  { chain: "ethereum", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", label: "WBTC" },
  { chain: "ethereum", address: "0xdac17f958d2ee523a2206206994597c13d831ec7", label: "USDT" },
  { chain: "ethereum", address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", label: "SHIB" },
  { chain: "ethereum", address: "0x4d224452801aced8b2f0aebe155379bb5d594381", label: "APE" },
  { chain: "ethereum", address: "0x5a98fcbea516cf06857215779fd812ca3bef1b32", label: "LDO" },
  { chain: "ethereum", address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", label: "MKR" },
  { chain: "ethereum", address: "0xd533a949740bb3306d119cc777fa900ba034cd52", label: "CRV" },
  { chain: "ethereum", address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", label: "SUSHI" },
  { chain: "ethereum", address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", label: "AAVE" },
  { chain: "ethereum", address: "0xc00e94cb662c3520282e6f5717214004a7f26888", label: "COMP" },
  { chain: "ethereum", address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0", label: "wstETH" },
];

export type LandingFeature = {
  label: string;
  icon: "dot" | "shield" | "trending";
};

export const LANDING_FEATURES: LandingFeature[] = [
  { label: "Live data", icon: "dot" },
  { label: "No API key needed", icon: "shield" },
  { label: "300+ DEXs", icon: "trending" },
];
