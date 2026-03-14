import { ethers } from "ethers";
import { POLLING_CONFIG } from "./config";


// ═══════════════════════════════════════════════════════════════════════
// Server-side trade store — singleton via globalThis
// Manages Alchemy WS connections and stores decoded trades per pool.
// Supports: Uniswap V2, Uniswap V3, Curve, Balancer, and generic swaps.
// ═══════════════════════════════════════════════════════════════════════

// ── ABIs for different DEX swap events ──
const V2_IFACE = new ethers.Interface([
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
]);
const V3_IFACE = new ethers.Interface([
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
]);
// Curve TokenExchange / TokenExchangeUnderlying
const CURVE_IFACE = new ethers.Interface([
  "event TokenExchange(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)",
  "event TokenExchangeUnderlying(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)",
]);

// Topic hashes
const TOPIC_V2_SWAP       = ethers.id("Swap(address,uint256,uint256,uint256,uint256,address)");
const TOPIC_V3_SWAP       = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
const TOPIC_CURVE_EXCHANGE = ethers.id("TokenExchange(address,int128,uint256,int128,uint256)");
const TOPIC_CURVE_UNDERLYING = ethers.id("TokenExchangeUnderlying(address,int128,uint256,int128,uint256)");

// All supported swap topics (used for OR filter)
const ALL_SWAP_TOPICS = [
  TOPIC_V2_SWAP,
  TOPIC_V3_SWAP,
  TOPIC_CURVE_EXCHANGE,
  TOPIC_CURVE_UNDERLYING,
];

// ── Chain configs ──
const RPC_URLS: Record<string, (k: string) => string> = {
  ethereum: (k) => `https://eth-mainnet.g.alchemy.com/v2/${k}`,
  base:     (k) => `https://base-mainnet.g.alchemy.com/v2/${k}`,
  arbitrum: (k) => `https://arb-mainnet.g.alchemy.com/v2/${k}`,
  optimism: (k) => `https://opt-mainnet.g.alchemy.com/v2/${k}`,
  polygon:  (k) => `https://polygon-mainnet.g.alchemy.com/v2/${k}`,
};
const WS_URLS: Record<string, (k: string) => string> = {
  ethereum: (k) => `wss://eth-mainnet.g.alchemy.com/v2/${k}`,
  base:     (k) => `wss://base-mainnet.g.alchemy.com/v2/${k}`,
  arbitrum: (k) => `wss://arb-mainnet.g.alchemy.com/v2/${k}`,
  optimism: (k) => `wss://opt-mainnet.g.alchemy.com/v2/${k}`,
  polygon:  (k) => `wss://polygon-mainnet.g.alchemy.com/v2/${k}`,
};
const BLOCK_TIMES: Record<string, number> = {
  ethereum: 12000, base: 2000, arbitrum: 250, optimism: 2000, polygon: 2000,
};

// ── Types ──
export interface ServerTrade {
  id: string;
  txHash: string;
  logIndex: number;
  trader: string;
  type: "BUY" | "SELL";
  price: number;
  amount: number;
  total: number;
  timestamp: number;
}

interface PairMeta {
  poolAddress: string;
  baseToken:  { address: string; symbol: string; decimals: number };
  quoteToken: { address: string; symbol: string; decimals: number };
  priceUsd: number;
  token0IsBase: boolean;
  dexId: string;
  // Curve-specific: coin index for base and quote
  baseCoinIndex?: number;
  quoteCoinIndex?: number;
}

interface StoreEntry {
  trades: ServerTrade[];
  seenIds: Set<string>;
  meta: PairMeta | null;
  metaFetchedAt: number;
  wsProvider: ethers.WebSocketProvider | null;
  initPromise: Promise<void> | null;
  /** The oldest block number we have ever scanned (undefined = not yet known) */
  oldestBlockScanned?: number;
}

// ── Global store ──
declare global {
  var __tradeStores: Record<string, StoreEntry> | undefined;
}

function getEntry(key: string): StoreEntry {
  if (!globalThis.__tradeStores) globalThis.__tradeStores = {};
  if (!globalThis.__tradeStores[key]) {
    console.log(`[tradeStore] Creating new store entry for key: ${key}`);
    globalThis.__tradeStores[key] = {
      trades: [], seenIds: new Set(), meta: null, metaFetchedAt: 0,
      wsProvider: null, initPromise: null,
    };
  }
  return globalThis.__tradeStores[key];
}

// ── Resolve pair metadata from DexScreener ──
async function resolvePairMeta(
  chain: string, tokenAddress: string, alchemyKey: string, entry: StoreEntry
): Promise<PairMeta | null> {
  if (entry.meta && Date.now() - entry.metaFetchedAt < POLLING_CONFIG.metadataRefresh) return entry.meta;

  try {
    const dsRes = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/${chain}/${tokenAddress}`,
      { next: { revalidate: POLLING_CONFIG.revalidate } }
    );
    type DexScreenerPairItem = {
      pairAddress?: string;
      txns?: { h24?: { buys?: number; sells?: number } };
      dexId?: string;
      baseToken?: { address: string; symbol: string };
      quoteToken?: { address: string; symbol: string };
      priceUsd?: string;
    };
    const pairs = (await dsRes.json()) as DexScreenerPairItem[];
    const supportedPairs = pairs.filter((p) => p.pairAddress && p.pairAddress.length === 42);

    if (supportedPairs.length === 0) {
      console.warn(`[tradeStore] No supported pools found for ${tokenAddress} among ${pairs.length} candidates`);
      return entry.meta;
    }

    if (supportedPairs.length < pairs.length) {
      console.log(`[tradeStore] Filtered out ${pairs.length - supportedPairs.length} unsupported (V4?) pools for ${tokenAddress}`);
    }

    supportedPairs.sort((a, b) => {
      const aTxns = (a.txns?.h24?.buys || 0) + (a.txns?.h24?.sells || 0);
      const bTxns = (b.txns?.h24?.buys || 0) + (b.txns?.h24?.sells || 0);
      return bTxns - aTxns;
    });
    const best = supportedPairs[0];
    if (!best?.pairAddress || !best.baseToken?.address || !best.quoteToken?.address) {
      console.warn("[tradeStore] Best pair missing required fields");
      return entry.meta;
    }
    console.log(`[tradeStore] Selected pool ${best.pairAddress} (${best.dexId}) with ${(best.txns?.h24?.buys||0)+(best.txns?.h24?.sells||0)} 24h txns`);

    const baseAddr  = best.baseToken.address.toLowerCase();
    const quoteAddr = best.quoteToken.address.toLowerCase();
    const token0IsBase = baseAddr < quoteAddr;

    // Fetch decimals
    const provider = new ethers.JsonRpcProvider(RPC_URLS[chain.toLowerCase()]?.(alchemyKey));
    let baseDec = 18, quoteDec = 18;
    try {
      const c = new ethers.Contract(best.baseToken.address, ["function decimals() view returns (uint8)"], provider);
      baseDec = Number(await c.decimals());
    } catch {}
    try {
      const c = new ethers.Contract(best.quoteToken.address, ["function decimals() view returns (uint8)"], provider);
      quoteDec = Number(await c.decimals());
    } catch {}

    // For Curve: try to figure out coin indices
    let baseCoinIndex = 0;
    let quoteCoinIndex = 1;
    if (best.dexId === "curve") {
      try {
        const pool = new ethers.Contract(best.pairAddress, [
          "function coins(uint256) view returns (address)",
        ], provider);
        // Check first 4 coin slots
        for (let i = 0; i < 4; i++) {
          try {
            const addr = (await pool.coins(i) as string).toLowerCase();
            if (addr === baseAddr) baseCoinIndex = i;
            if (addr === quoteAddr) quoteCoinIndex = i;
          } catch { break; }
        }
      } catch {}
    }

    entry.meta = {
      poolAddress: best.pairAddress,
      baseToken:  { address: best.baseToken.address,  symbol: best.baseToken.symbol,  decimals: baseDec },
      quoteToken: { address: best.quoteToken.address, symbol: best.quoteToken.symbol, decimals: quoteDec },
      priceUsd: parseFloat(best.priceUsd || "0"),
      token0IsBase,
      dexId: best.dexId ?? "",
      baseCoinIndex,
      quoteCoinIndex,
    };
    entry.metaFetchedAt = Date.now();
    return entry.meta;
  } catch (err) {
    console.error("[tradeStore] resolvePairMeta error:", err);
    return entry.meta;
  }
}

// ── Decode a single log into a trade ──
function decodeLog(log: ethers.Log, meta: PairMeta): ServerTrade | null {
  const topic0 = log.topics[0];
  try {
    let trader = "";
    let baseAmount = 0;
    let isBuy = false;

    // ── Uniswap V2 ──
    if (topic0 === TOPIC_V2_SWAP) {
      const p = V2_IFACE.parseLog({ topics: log.topics as string[], data: log.data });
      if (!p) return null;
      const a0In  = p.args.amount0In  as bigint;
      const a1In  = p.args.amount1In  as bigint;
      const a0Out = p.args.amount0Out as bigint;
      const a1Out = p.args.amount1Out as bigint;
      trader = ""; // resolved later via tx.from

      let baseRaw: bigint;
      if (meta.token0IsBase) {
        isBuy    = a0Out > 0n;
        baseRaw  = isBuy ? a0Out : a0In;
      } else {
        isBuy    = a1Out > 0n;
        baseRaw  = isBuy ? a1Out : a1In;
      }
      baseAmount = Number(ethers.formatUnits(baseRaw, meta.baseToken.decimals));
    }

    // ── Uniswap V3 ──
    else if (topic0 === TOPIC_V3_SWAP) {
      console.log(`[tradeStore] Decoding V3 log for ${log.transactionHash}`);
      const p = V3_IFACE.parseLog({ topics: log.topics as string[], data: log.data });
      if (!p) {
        console.warn(`[tradeStore] Failed to parse V3 log for ${log.transactionHash}`);
        return null;
      }
      const a0 = p.args.amount0 as bigint;
      const a1 = p.args.amount1 as bigint;
      trader = ""; // resolved later via tx.from

      let baseRaw: bigint;
      if (meta.token0IsBase) {
        isBuy   = a0 < 0n;
        baseRaw = a0 < 0n ? -a0 : a0;
      } else {
        isBuy   = a1 < 0n;
        baseRaw = a1 < 0n ? -a1 : a1;
      }
      baseAmount = Number(ethers.formatUnits(baseRaw, meta.baseToken.decimals));
      console.log(`[tradeStore] V3 Decoded: baseAmount=${baseAmount} isBuy=${isBuy}`);
    }

    // ── Curve TokenExchange / TokenExchangeUnderlying ──
    else if (topic0 === TOPIC_CURVE_EXCHANGE || topic0 === TOPIC_CURVE_UNDERLYING) {
      const p = CURVE_IFACE.parseLog({ topics: log.topics as string[], data: log.data });
      if (!p) return null;

      trader = ""; // resolved later via tx.from
      const soldId    = Number(p.args.sold_id);
      const boughtId  = Number(p.args.bought_id);
      const tokensSold   = p.args.tokens_sold as bigint;
      const tokensBought = p.args.tokens_bought as bigint;

      // Determine buy/sell: if user BOUGHT the base token → BUY
      if (boughtId === (meta.baseCoinIndex ?? 0)) {
        isBuy = true;
        baseAmount = Number(ethers.formatUnits(tokensBought, meta.baseToken.decimals));
      } else if (soldId === (meta.baseCoinIndex ?? 0)) {
        isBuy = false;
        baseAmount = Number(ethers.formatUnits(tokensSold, meta.baseToken.decimals));
      } else {
        // Neither coin is the base token — skip
        return null;
      }
    }

    else {
      return null;
    }

    const total = baseAmount * meta.priceUsd;

    return {
      id: `${log.transactionHash}:${log.index}`,
      txHash: log.transactionHash,
      logIndex: log.index,
      trader,
      type: isBuy ? "BUY" : "SELL",
      price: meta.priceUsd,
      amount: baseAmount,
      total,
      timestamp: 0,
    };
  } catch (err) {
    console.warn("[tradeStore] decodeLog error:", err);
    return null;
  }
}

// ── Add trade to store (dedup) ──
function addTrade(entry: StoreEntry, trade: ServerTrade, append = false) {
  if (entry.seenIds.has(trade.id)) return;
  entry.seenIds.add(trade.id);
  if (append) {
    entry.trades.push(trade);
  } else {
    entry.trades.unshift(trade);
  }
  // Allow up to 500 stored trades
  if (entry.trades.length > 500) {
    const removed = entry.trades.splice(500);
    removed.forEach((t) => entry.seenIds.delete(t.id));
  }
}

// ── Batch-fetch tx.from for a list of trades ──
// Groups by unique txHash, fetches in parallel, fills in trader.
async function enrichWithTxFrom(
  trades: ServerTrade[],
  provider: ethers.JsonRpcProvider
): Promise<void> {
  const unique = [...new Set(trades.map((t) => t.txHash))];
  const fromMap = new Map<string, string>();

  await Promise.all(
    unique.map(async (txHash) => {
      try {
        const tx = await provider.getTransaction(txHash);
        if (tx?.from) fromMap.set(txHash, tx.from);
      } catch {
        // ignore failed lookups
      }
    })
  );

  for (const trade of trades) {
    const from = fromMap.get(trade.txHash);
    if (from) trade.trader = from;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Main public function: returns trades for a token
// ═══════════════════════════════════════════════════════════════════════
export async function getTradesForToken(
  chain: string, tokenAddress: string
): Promise<ServerTrade[]> {
  const key = `${chain}:${tokenAddress}`.toLowerCase();
  const entry = getEntry(key);
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) {
    console.warn("[tradeStore] No ALCHEMY_API_KEY set");
    return entry.trades;
  }

  // Resolve metadata (cached 30s)
  const meta = await resolvePairMeta(chain, tokenAddress, alchemyKey, entry);
  if (!meta) {
    console.warn("[tradeStore] Could not resolve pair metadata");
    return entry.trades;
  }

  // Initialize once per pair
  if (!entry.initPromise) {
    console.log(`[tradeStore] Initializing worker for ${key}...`);
    entry.initPromise = (async () => {
      const chainLower = chain.toLowerCase();
      const rpcBuilder = RPC_URLS[chainLower];
      const wsBuilder  = WS_URLS[chainLower];
      if (!rpcBuilder || !wsBuilder) {
        console.error(`[tradeStore] No RPC/WS builder for chain: ${chainLower}`);
        return;
      }

      const provider  = new ethers.JsonRpcProvider(rpcBuilder(alchemyKey));
      const blockTime = BLOCK_TIMES[chainLower] || 12000;

      // ── Historical: up to 500 blocks in batches of 10 (early-exit at 50 trades) ──
      try {
        const head   = await provider.getBlockNumber();
        const headTs = Date.now();
        const MAX_BATCHES = 50; // 50 * 10 = 500 blocks
        const BATCH_SIZE = 10;
        console.log(`[tradeStore] Fetching history for pool ${meta.poolAddress} (${meta.dexId}) scanning ${MAX_BATCHES * BATCH_SIZE} blocks (10 block batches) back from ${head}`);

        // Set cursor BEFORE the scan so pagination always has a valid starting point
        // even if the scan fails midway through.
        if (entry.oldestBlockScanned === undefined) {
          entry.oldestBlockScanned = head;
        }

        for (let b = 0; b < MAX_BATCHES; b++) {
          const to   = head - b * BATCH_SIZE;
          const from = to - (BATCH_SIZE - 1);
          if (from < 0) break;
          // Advance cursor eagerly so errors in this batch don't block future pagination
          if (from < entry.oldestBlockScanned!) entry.oldestBlockScanned = from;

          try {
            const logs = await provider.getLogs({
              address: meta.poolAddress,
              topics: [ALL_SWAP_TOPICS],
              fromBlock: from,
              toBlock: to,
            });

            console.log(`[tradeStore] Scan blocks ${from}-${to} for ${meta.poolAddress}: found ${logs.length} logs`);

            const batchTrades: ServerTrade[] = [];
            for (const log of logs) {
              const trade = decodeLog(log as ethers.Log, meta);
              if (trade) {
                trade.timestamp = headTs - (head - log.blockNumber) * blockTime;
                batchTrades.push(trade);
              }
            }

            // Enrich all trades in this batch with real tx.from in parallel
            if (batchTrades.length > 0) {
              await enrichWithTxFrom(batchTrades, provider);
              batchTrades.forEach((t) => addTrade(entry, t));
            }
          } catch (batchErr) {
            console.error(`[tradeStore] Batch ${b} error:`, batchErr);
          }

          // Early exit once we have enough trades
          if (entry.trades.length >= 30) {
            console.log(`[tradeStore] Found ${entry.trades.length} trades, stopping scan early`);
            break;
          }

          // Small delay between batches to avoid rate-limiting
          if (b > 0 && b % 10 === 0) {
            await new Promise(r => setTimeout(r, 200));
          }
        }

        entry.trades.sort((a, b) => b.timestamp - a.timestamp);
        console.log(`[tradeStore] Loaded ${entry.trades.length} historical trades, oldest block=${entry.oldestBlockScanned}`);
      } catch (err) {
        console.error("[tradeStore] Historical fetch error:", err);
      }

      // ── WebSocket: live events ──
      try {
        const ws = new ethers.WebSocketProvider(wsBuilder(alchemyKey));
        entry.wsProvider = ws;

        const onLog = async (log: ethers.Log) => {
          const currentMeta = entry.meta || meta;
          const trade = decodeLog(log, currentMeta);
          if (trade) {
            trade.timestamp = Date.now();
            addTrade(entry, trade);
            // Resolve tx.from in background (non-blocking)
            enrichWithTxFrom([trade], provider).catch(() => {});
          }
        };

        // Subscribe to all supported swap event topics
        for (const topic of ALL_SWAP_TOPICS) {
          ws.on({ address: meta.poolAddress, topics: [topic] }, onLog);
        }

        console.log(`[tradeStore] WebSocket listening on ${meta.poolAddress} (${meta.dexId})`);
      } catch (err) {
        console.error("[tradeStore] WS start error:", err);
      }
    })();
  } else {
    console.log(`[tradeStore] initPromise already exists for ${key}`);
  }

  await entry.initPromise;

  // Background price refresh every 30s
  if (Date.now() - entry.metaFetchedAt > POLLING_CONFIG.metadataRefresh) {
    resolvePairMeta(chain, tokenAddress, alchemyKey, entry).catch(() => {});
  }

  return entry.trades;
}

// ═══════════════════════════════════════════════════════════════════════
// Pagination: fetch older trades before a given block
// ═══════════════════════════════════════════════════════════════════════
export async function fetchOlderTrades(
  chain: string,
  tokenAddress: string,
  beforeBlock: number,
): Promise<{ trades: ServerTrade[]; oldestBlock: number }> {
  const key = `${chain}:${tokenAddress}`.toLowerCase();
  const entry = getEntry(key);
  const alchemyKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyKey) return { trades: [], oldestBlock: beforeBlock };

  // Make sure meta + WS is initialised
  const meta = await resolvePairMeta(chain, tokenAddress, alchemyKey, entry);
  if (!meta) return { trades: [], oldestBlock: beforeBlock };

  const chainLower = chain.toLowerCase();
  const rpcBuilder = RPC_URLS[chainLower];
  if (!rpcBuilder) return { trades: [], oldestBlock: beforeBlock };

  const provider = new ethers.JsonRpcProvider(rpcBuilder(alchemyKey));
  const blockTime = BLOCK_TIMES[chainLower] || 12000;

  const BATCH_SIZE = 10;
  const MAX_BATCHES = 50; // scan 500 more blocks
  const newTrades: ServerTrade[] = [];

  // Approximate timestamp for block mapping
  const headTs = Date.now();
  let head: number;
  try {
    head = await provider.getBlockNumber();
  } catch {
    return { trades: [], oldestBlock: beforeBlock };
  }

  let oldestBlock = beforeBlock;

  for (let b = 0; b < MAX_BATCHES; b++) {
    const toBlock = beforeBlock - 1 - b * BATCH_SIZE;
    const fromBlock = toBlock - (BATCH_SIZE - 1);
    if (fromBlock < 0) break;

    // Always advance the oldest cursor regardless of whether any trades were found
    oldestBlock = fromBlock;
    if (entry.oldestBlockScanned === undefined || fromBlock < entry.oldestBlockScanned) {
      entry.oldestBlockScanned = fromBlock;
    }

    try {
      const logs = await provider.getLogs({
        address: meta.poolAddress,
        topics: [ALL_SWAP_TOPICS],
        fromBlock,
        toBlock,
      });

      const batchTrades: ServerTrade[] = [];
      for (const log of logs) {
        const trade = decodeLog(log as ethers.Log, meta);
        if (trade) {
          trade.timestamp = headTs - (head - log.blockNumber) * blockTime;
          batchTrades.push(trade);
        }
      }

      if (batchTrades.length > 0) {
        await enrichWithTxFrom(batchTrades, provider);
        for (const t of batchTrades) {
          addTrade(entry, t, /* append= */ true);
          newTrades.push(t);
        }
      }
    } catch (batchErr) {
      console.error(`[tradeStore] fetchOlderTrades batch ${b} error:`, batchErr);
    }

    // Stop once we have enough new trades
    if (newTrades.length >= 30) break;

    if (b > 0 && b % 10 === 0) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Re-sort the whole store
  entry.trades.sort((a, b) => b.timestamp - a.timestamp);

  console.log(`[tradeStore] fetchOlderTrades: +${newTrades.length} trades, oldestBlock=${oldestBlock}`);
  return { trades: newTrades, oldestBlock };
}

/** Returns the oldest block number scanned so far for a given pair key */
export function getOldestBlock(chain: string, tokenAddress: string): number | undefined {
  const key = `${chain}:${tokenAddress}`.toLowerCase();
  return globalThis.__tradeStores?.[key]?.oldestBlockScanned;
}
