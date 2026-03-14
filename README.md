# Web3 Dashboard - Technical Blueprint & Documentation

## Overview
Web3 Dashboard is a high-performance, real-time analytics interface for decentralized exchanges (DEXs) across multiple EVM-compatible chains. It aggregates data from DexScreener, CoinGecko, and direct blockchain RPC/WebSocket connections (via Alchemy) to provide real-time token tracking, trade histories, top holders, and market data.

This document serves as an interactive blueprint detailing the architecture, components, API integrations, data fetching strategies (Polling vs WebSockets), and implemented technical practices.

## 🏗️ Interactive Blueprint & Application Flow

1. **Home Page (`src/app/page.tsx`)**
   - **Entry Point**: A landing page with search functionality, chain selection (Ethereum, Base, Arbitrum, etc.), and quick examples.
   - **Action**: Routing to `/[chain]/[tokenAddress]` (e.g., `/ethereum/0xc02aaa...`).

2. **Global Layout (`src/app/layout.tsx`)**
   - **Header** (`components/layout/Header.tsx`): Fixed top nav with logo, main nav links, and a **collapsible Trending** strip. Trending shows hot tokens from `/api/trending` with network toggles (Ethereum, Base, Arbitrum, etc.) and timeframe (24H / 7D / 30D). Collapse state drives `--navbar-height` (52px collapsed, 90px expanded).
   - **Footer** (`components/layout/Footer.tsx`): Fixed bottom bar with settings, language, and **Major Tickers** (bottom-right). A “more” control opens a popup to show/hide which major tickers (BTC, ETH, SOL, MATIC, AVAX, BNB, etc.) appear in the ticker strip; visible tickers scroll horizontally.

3. **Token Dashboard (`src/app/[chain]/[tokenAddress]/page.tsx`)**
   - Main content: **TopBar** (chain, token, market selector), **TradingChart**, a **resizer** (vertical drag), and **TabbedPanel** (Trades / Position / Pools / Holders / Traders / Orders / History / Exited).
   - **Collapsible right panel** (width `SIDEBAR_WIDTH` 350px): Toggle button on the right edge shows/hides the sidebar. When open it contains:
     - **Advanced Token Stats** (`AdvancedPanelTokenStats.tsx`): Volume, buys/sells counts and values, vol change, and a buy/sell ratio bar for the selected timeframe. Hover reveals a **timeframe selector** (5M, 1H, 4H, 24H) that drives chart and stats.
     - **TradingControls** (quick actions).
     - **TokenStats** (`TokenStats.tsx`): Extended token info (top holders, profile, links, etc.).
   - **Chart/table resizer**: A horizontal bar between the chart and the tabbed panel; drag up/down to resize. Implemented with `useResizePanel` and `lib/constants` (`CHART_HEIGHT_MIN`, `CHART_HEIGHT_MAX`, `CHART_HEIGHT_DEFAULT`).

### Core Components & Their Data Hooks
*   **Header & Trending (`Header.tsx`, `useTrendingTokens`)**
    *   **API**: `/api/trending` — hot tokens list; header shows trending with network and timeframe controls; collapse/expand updates layout padding.
*   **TopBar & Token Profile (`TopBar.tsx`, `usePairMetadata`, `useTokenProfile`)**
    *   **API**: `/api/token-profiles`, DexScreener pair metadata.
    *   **Action**: Token title, price, market selector; metadata (social links, market cap) via CoinGecko/DexScreener.
*   **Trading Chart (`TradingChart.tsx`)**
    *   **Hook**: `useChartData(chain, token, timeframe)`
    *   **API**: `/api/chart?chain={chain}&token={token}&from={ts}&to={ts}`
    *   **Implementation**: Lightweight Charts candlestick/line charts; timeframe synced with Advanced Token Stats.
*   **Resizer & Tabbed Panel (`useResizePanel`, `TabbedPanel.tsx`)**
    *   **Resizer**: Vertical split between chart and tables; mouse drag updates flex ratio (chart height %), with min/max from constants.
    *   **TabbedPanel**: Tabs for Trades, Pools, Holders, etc.; **TradesTable**, **PoolsTable**, **HoldersTable**.
*   **Real-time Trades Table (`TradesTable.tsx`)**
    *   **Hook**: `useTrades(chain, token)`
    *   **API**: `/api/trades?chain={chain}&token={token}`
    *   **Implementation**: Historical pagination and optimistic real-time updates from WebSockets.
*   **Liquidity Pools Table (`PoolsTable.tsx`)**
    *   **Hook**: `usePools(chain, tokenAddress)`
    *   **API**: `/api/pools` (DexScreener proxy); displays pools sorted by liquidity.
*   **Top Holders (`HoldersTable.tsx` / `useHolders.ts`)**
    *   **API**: `/api/holders` (token balances / holder analytics).
*   **Advanced Token Stats & Page Stats (`AdvancedPanelTokenStats.tsx`, `useTokenPageStats`)**
    *   **Data**: Pair metadata from `usePairMetadata`; `useTokenPageStats` derives volume, buys/sells, vol change, and timeframe list (5M, 1H, 4H, 24H) for the right panel and chart.

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
- `/api/trending` - Hot tokens list (used by Header trending strip and `useTrendingTokens`).

**Layout constants** (`lib/constants.ts`): `SIDEBAR_WIDTH` (350), `CHART_HEIGHT_MIN` (20), `CHART_HEIGHT_MAX` (80), `CHART_HEIGHT_DEFAULT` (55) for the right panel and chart/table resizer.

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
5. **Chart/Table Resizer (`useResizePanel.ts`)**
   - Vertical drag on the bar between the chart and the tabbed panel updates a flex ratio (chart height %). Uses `containerRef` and mouse move/up listeners; clamps to `CHART_HEIGHT_MIN`/`CHART_HEIGHT_MAX` from `lib/constants`. Body cursor and user-select are set during drag for a native resize feel.
6. **Collapsible UI**
   - **Header trending**: Collapse/expand toggles the trending strip and updates `--navbar-height` so main content padding (`pt-[var(--navbar-height)]`) stays in sync.
   - **Right panel**: Token dashboard sidebar (Advanced Token Stats + TokenStats) can be hidden with a toggle button; width animates to 0 and the toggle moves with the panel edge.
7. **Major Tickers (Footer)**
   - Footer shows a horizontal strip of major tickers (BTC, ETH, SOL, etc.). A popup (bottom-right) lists all tickers with toggles to show/hide each in the strip; selection is kept in React state for the session.

---

## ✨ Features

- **Multi-Chain Support**: Ethereum, Base, Arbitrum, Optimism, and Polygon.
- **Universal Search**: Resolve token names, symbols, and contract addresses instantly.
- **Live Trading View**: Native, fully interactive candlestick charts (via Lightweight Charts); timeframe (5M, 1H, 4H, 24H) synced with the right-panel stats.
- **Sub-second Trade Feed**: WebSocket-powered live scrolling feed of swaps (Uniswap V2/V3, Curve) in a tabbed panel with resizable chart above.
- **Whale Tracking**: Visual indicators for trades exceeding high USD thresholds.
- **Real-time Metrics**: Volume, liquidity, FDV, Top 10 Holder concentration; **Advanced Token Stats** in the right panel (volume, buys/sells, vol change, buy/sell bar and timeframe selector).
- **Collapsible Layouts**: Header trending strip can be collapsed to save space; token dashboard **right panel** can be hidden to maximize chart and tables.
- **Chart & Table Resizer**: Vertical drag bar between the chart and the trades/pools/holders panel to adjust relative height.
- **Trending**: Hot tokens in the header (from `/api/trending`) with network filters and 24H/7D/30D timeframe.
- **Major Tickers**: Footer ticker strip (bottom) with configurable visibility via a bottom-right popup (BTC, ETH, SOL, MATIC, AVAX, BNB, etc.).

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
│   ├── api/              # Next.js API routes (chart, trades, trending, pools, holders, etc.)
│   ├── [chain]/[tokenAddress]/  # Token dashboard page (TopBar, Chart, Resizer, TabbedPanel, right panel)
│   ├── globals.css       # Tailwind v4, custom scrollbars, CSS variables
│   ├── layout.tsx        # Root layout: Header, main (with --navbar-height), Footer
│   └── page.tsx          # Landing page / Search index
├── components/
│   ├── dashboard/        # Token dashboard widgets
│   │   ├── TopBar.tsx, TradingChart.tsx, TabbedPanel.tsx
│   │   ├── AdvancedPanelTokenStats.tsx  # Right panel: volume, buys/sells, timeframe selector
│   │   ├── TokenStats.tsx               # Right panel: holders, profile, links
│   │   ├── TradesTable.tsx, PoolsTable.tsx, HoldersTable.tsx
│   │   ├── TrendingBar.tsx, TrendingTokensPanel.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx    # Nav + collapsible Trending strip
│   │   └── Footer.tsx   # Settings, Major Tickers strip + popup (bottom-right)
│   ├── ui/               # Switch and other primitives
│   └── icons/
├── hooks/
│   ├── useTrades.ts, usePools.ts, useHolders.ts, useChartData.ts, usePairMetadata.ts
│   ├── useResizePanel.ts   # Chart/table vertical resizer (percent, handleResizeStart)
│   ├── useTrendingTokens.ts
│   ├── useTokenPageStats.ts # Stats + timeframes for Advanced Token Stats
│   ├── useSmartPolling.ts, useDocumentTitle.ts, useMarkets.ts, ...
│   └── index.ts
├── lib/
│   ├── constants.ts    # SIDEBAR_WIDTH, CHART_HEIGHT_MIN/MAX/DEFAULT, EVM_ADDRESS_REGEX
│   ├── config.ts       # Chain configuration
│   ├── tradeStore.ts   # Server-side WebSocket engine for swaps
│   ├── dexscreener.ts  # DexScreener API utilities
│   ├── decodeSwap.ts   # Block explorer links
│   ├── validation.ts   # Route validation (chain, tokenAddress)
│   ├── utils.ts        # formatNumber, formatPriceChange, truncateAddress, etc.
│   └── theme.ts        # UI helpers (colors, formatting)
├── types/
│   └── index.ts        # Trade, Holder, Pool, TrendingToken, TokenStatsData, TimeframeKey, etc.
└── dummy/               # Static data for nav and landing
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
