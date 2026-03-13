import { ethers } from "ethers";

// ──────────────────────────────── ABIs ────────────────────────────────

// Uniswap V2 Swap event
const V2_SWAP_ABI = new ethers.Interface([
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)"
]);

// Uniswap V3 Swap event
const V3_SWAP_ABI = new ethers.Interface([
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)"
]);

// ──────────────────────────────── Topics ────────────────────────────────

export const TOPIC_V2_SWAP = ethers.id("Swap(address,uint256,uint256,uint256,uint256,address)");
export const TOPIC_V3_SWAP = ethers.id("Swap(address,address,int256,int256,uint160,uint128,int24)");

// ──────────────────────────────── Types ────────────────────────────────

export interface DecodedSwap {
  txHash: string;
  logIndex: number;
  trader: string;      // "to" for V2, "recipient" for V3
  sender: string;
  type: "buy" | "sell";
  amount0: bigint;
  amount1: bigint;
  version: "v2" | "v3";
}

// ──────────────────────────────── Decode ────────────────────────────────

export function decodeSwapLog(log: ethers.Log): DecodedSwap | null {
  const topic0 = log.topics[0];

  try {
    if (topic0 === TOPIC_V2_SWAP) {
      const parsed = V2_SWAP_ABI.parseLog({ topics: log.topics as string[], data: log.data });
      if (!parsed) return null;

      const amount0In = parsed.args.amount0In as bigint;
      const amount1In = parsed.args.amount1In as bigint;
      const amount0Out = parsed.args.amount0Out as bigint;
      const amount1Out = parsed.args.amount1Out as bigint;

      // If token0 comes IN → user sold token0 (sell), token0 goes OUT → user bought token0 (buy)
      const isBuy = amount0Out > 0n;

      return {
        txHash: log.transactionHash,
        logIndex: log.index,
        trader: parsed.args.to as string,
        sender: parsed.args.sender as string,
        type: isBuy ? "buy" : "sell",
        amount0: isBuy ? amount0Out : amount0In,
        amount1: isBuy ? amount1In : amount1Out,
        version: "v2",
      };
    }

    if (topic0 === TOPIC_V3_SWAP) {
      const parsed = V3_SWAP_ABI.parseLog({ topics: log.topics as string[], data: log.data });
      if (!parsed) return null;

      const amount0 = parsed.args.amount0 as bigint;
      const amount1 = parsed.args.amount1 as bigint;

      // Negative amounts = tokens flowing OUT of pool → user receives them
      // amount0 < 0 means user received token0 → BUY
      const isBuy = amount0 < 0n;

      return {
        txHash: log.transactionHash,
        logIndex: log.index,
        trader: parsed.args.recipient as string,
        sender: parsed.args.sender as string,
        type: isBuy ? "buy" : "sell",
        amount0: amount0 < 0n ? -amount0 : amount0,
        amount1: amount1 < 0n ? -amount1 : amount1,
        version: "v3",
      };
    }
  } catch (err) {
    console.warn("Failed to decode swap log:", err);
  }

  return null;
}

// ──────────────────────────────── Explorer URLs ────────────────────────────────

const EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io",
  base: "https://basescan.org",
  arbitrum: "https://arbiscan.io",
  optimism: "https://optimistic.etherscan.io",
  polygon: "https://polygonscan.com",
};

export function getExplorerUrl(chainId: string): string {
  return EXPLORERS[chainId.toLowerCase()] || "https://etherscan.io";
}

export function getTxUrl(chainId: string, txHash: string): string {
  return `${getExplorerUrl(chainId)}/tx/${txHash}`;
}

export function getAddressUrl(chainId: string, address: string): string {
  return `${getExplorerUrl(chainId)}/address/${address}`;
}

// ──────────────────────────────── WS URLs ────────────────────────────────

export const ALCHEMY_WS_URLS: Record<string, string> = {
  ethereum: "wss://eth-mainnet.g.alchemy.com/v2/",
  base: "wss://base-mainnet.g.alchemy.com/v2/",
  arbitrum: "wss://arb-mainnet.g.alchemy.com/v2/",
  optimism: "wss://opt-mainnet.g.alchemy.com/v2/",
  polygon: "wss://polygon-mainnet.g.alchemy.com/v2/",
};
