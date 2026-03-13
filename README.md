# Web3 Dashboard - Technical Blueprint & Documentation

## Overview
Web3 Dashboard is a high-performance, real-time analytics interface for decentralized exchanges (DEXs) across multiple EVM-compatible chains. It aggregates data from DexScreener, CoinGecko, and direct blockchain RPC/WebSocket connections (via Alchemy) to provide real-time token tracking, trade histories, top holders, and market data.

This document serves as an interactive blueprint detailing the architecture, components, API integrations, data fetching strategies (Polling vs WebSockets), and implemented technical practices.

## 🏗️ Interactive Blueprint & Application Flow

1. **Home Page (`src/app/page.tsx`)**
   - **Entry Point**: A landing page with search functionality, chain selection (Ethereum, Base, Arbitrum, etc.), and quick examples.
   - **Action**: Routing to `/[chain]/[tokenAddress]` (e.g., `/ethereum/0xc02aaa...`).

2. **Token Dashboard (`src/app/[chain]/[tokenAddress]/page.tsx`)**
   - The primary wrapper for an individual token's data. Contains several core widgets that fetch data independently for maximum performance and UI responsiveness.

### Core Components & Their Data Hooks
*   **Header & Token Profile (`TokenHeader.tsx`)**
    *   **Hook**: `useTokenProfile(chain, token)`
    *   **API**: `/api/token-profiles?chain={chain}&token={token}`
    *   **Action**: Fetches metadata (social links, market cap, description) via CoinGecko/DexScreener.
*   **Price Chart (`PriceChart.tsx`)**
    *   **Hook**: `useChartData(chain, token, timeframe)`
    *   **API**: `/api/chart?chain={chain}&token={token}&from={ts}&to={ts}`
    *   **Implementation**: Utilizes `lightweight-charts` to render native, performant candlestick/line charts.
*   **Real-time Trades Table (`TradesTable.tsx`)**
    *   **Hook**: `useTrades(chain, token)`
    *   **API**: `/api/trades?chain={chain}&token={token}`
    *   **Implementation**: Handles both historical data fetching (pagination via `&before={block}`) and optimistic real-time updates injected by WebSockets.
*   **Liquidity Pools Table (`PoolsTable.tsx`)**
    *   **Hook**: `usePools(chain, tokenAddress)`
    *   **API**: `/api/pools` (Proxy to DexScreener)
    *   **Action**: Displays all liquidity pools across various DEXs (Uniswap, Sushiswap, Curve, etc.) sorted by liquidity.
*   **Top Holders & Analytics (`HoldersList.tsx` / `useHolders.ts`)**
    *   **API**: `/api/holders` (Likely Alchemy SDK token balances API).

---

## 📡 APIs & Data Fetching Strategies

The application uses a hybrid approach to data fetching, balancing RPC limits with the necessity for real-time updates.

### 1. Smart Polling (`useSmartPolling.ts`)
A custom React Hook designed strictly to preserve client and node resources.
- **Behavior**: Periodically triggers a `fetcher` callback (e.g., every 5-10s).
- **Tab Visibility**: Pauses polling immediately when `document.hidden` is true (user switches tabs), resuming upon returning.
- **Diffing Hash**: Hashes the response and compares it against a `prevHashRef`. React state (`setData`) is **only updated if the hash changes**, preventing unnecessary re-renders.

### 2. WebSocket & RPC Hybrid (The `tradeStore.ts` Engine)
The core engine for real-time trade monitoring operates entirely server-side to prevent exposing Alchemy API keys and to centralize WebSocket connections.
- **Singleton Design**: Uses `globalThis.__tradeStores` to maintain a single WebSocket connection per liquidity pool across all active clients (avoiding rate-limiting during dev reloads).
- **Historical Backfill**: Upon initialization, it queries the RPC (using `eth_getLogs`) in batches of 10 blocks (up to 500 blocks deep) to pre-fill the last ~50 trades.
- **Live Feed**: Opens a `wss://` connection to Alchemy, listening to encoded `Swap` events matching standard ABIs (Uniswap V2, V3, and Curve).
- **Decoding**: Parses logs dynamically using `ethers.Interface`, calculates the USD value, and enriches trades asynchronously with `tx.from` to find the trader's address.

### 3. API Routes Overview (`src/app/api/`)
All external calls are routed through Next.js App Router API handlers to prevent CORS issues and hide API keys:
- `/api/chart` - TradingView formatted historical candles.
- `/api/dexscreener` - Raw DexScreener passthrough.
- `/api/holders` - Top token holders endpoint.
- `/api/pools` - Aggregates pool liquidity and volumes.
- `/api/search` - Token name/symbol search resolution.
- `/api/token-profiles` - Extended metadata.
- `/api/trades` - Connects to the server-side `tradeStore` instance to serve WebSocket feeds to the client via HTTP polling.
- `/api/transactions` - Generic transaction history.
- `/api/trending` - Hot tokens list.

---

## 🛠 Implemented Technical Practices

1. **Optimistic UI Merging (`useTrades.ts`)**
   - The React Query `useQuery` hook polls `/api/trades` purely to sync with the server `tradeStore`.
   - Instead of simply replacing the data, it merges fresh trades intelligently: highlighting new entries with an `isNew` flag (driving a green/red CSS flash animation) and expiring that flag after 1500ms using a `setTimeout` TTL.
2. **Infinite Scroll Pagination**
   - The trade store tracks `oldestBlockScanned`. Scrolling down triggers `loadMore`, pushing the block cursor backward to seamlessly stitch older trades.
3. **DexScreener Pair Resolution**
   - Automatically filters out unsupported complex pools (like V4 hooks) and selects the single most active standard pool (highest 24h txn count) to monitor via WebSockets.
4. **Resilient Decoders (`tradeStore.ts`)**
   - Supports decoding disparate models: standard V2 `(amount0In, amount1Out)`, V3 `(amount0, amount1, sqrtPriceX96)`, and Curve `TokenExchange(sold_id, bought_id)`.

---

## ✨ Features

- **Multi-Chain Support**: Ethereum, Base, Arbitrum, Optimism, and Polygon.
- **Universal Search**: Resolve token names, symbols, and contract addresses instantly.
- **Live Trading View**: Native, fully interactive candlestick charts (via Lightweight Charts).
- **Sub-second Trade Feed**: WebSocket-powered live scrolling feed of swaps taking place across Uniswap V2/V3 and Curve.
- **Whale Tracking**: Visual indicators for trades exceeding high USD thresholds.
- **Real-time Metrics**: Tracks volume, liquidity, fully diluted valuation (FDV), and Top 10 Holder concentration.

---

## 💻 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Framer Motion for animations
- **Data Fetching**: [React Query](https://tanstack.com/query/latest) & custom `useSmartPolling`
- **Blockchain RPC**: [ethers.js v6](https://docs.ethers.org/)
- **Charts**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (`tradingview`)
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Setup & Installation

### Prerequisites
- Node.js 20+
- An [Alchemy](https://alchemy.com) API Key (for WebSocket trade feeds)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/web3-dashboard.git
cd web3-dashboard
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Required for WebSocket trade feeds & RPC calls
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optional: Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/          # Next.js Serverless API Routes (Proxying external APIs)
│   ├── [chain]/      # Dynamic routing for Token Dashboards
│   ├── globals.css   # Tailwind v4, custom scrollbars, and CSS variables
│   └── page.tsx      # Landing page / Search index
├── components/
│   └── dashboard/    # All primary UI widgets (Trades, Charts, Stats, etc.)
├── hooks/            # Custom React Hooks (useTrades, usePools, useSmartPolling, etc.)
├── lib/
│   ├── config.ts     # Chain configuration and generic constant variables
│   ├── tradeStore.ts # Central Server-Side WebSocket Engine for fetching swaps
│   ├── dexscreener.ts# DexScreener API utilities
│   ├── decodeSwap.ts # Block explorer link generators
│   └── theme.ts      # UI helper functions (colors, formatting)
```

---

## 🚀 Scripts

- `npm run dev` - Starts the Next.js development server with Turbopack.
- `npm run build` - Builds the application for production.
- `npm run start` - Runs the compiled Next.js production server.
- `npm run lint` - Runs ESLint to check for code issues.

---

## 🙏 Acknowledgments

- [DexScreener API](https://docs.dexscreener.com/api/reference) for pool discovery and price routing.
- [CoinGecko API](https://www.coingecko.com/en/api) for token metadata and social links.
- [Alchemy](https://www.alchemy.com/) for reliable Ethereum/L2 infrastructure and WebSocket event feeds.
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/) for the beautiful charting library.
