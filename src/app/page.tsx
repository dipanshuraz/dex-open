"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Zap, Shield } from "lucide-react";

import { CHAINS } from "@/lib/config";

const EXAMPLES = [
  { chain: "ethereum", address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf", label: "cbBTC" },
  { chain: "ethereum", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", label: "USDC" },
  { chain: "ethereum", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", label: "WETH" },
  { chain: "ethereum", address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", label: "UNI" },
  { chain: "ethereum", address: "0x514910771af9ca656af840dff83e8264ecf986ca", label: "LINK" },
  { chain: "ethereum", address: "0x6982508145454ce325ddbe47a25d4ec3d2311933", label: "PEPE" },
  { chain: "ethereum", address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", label: "WBTC" },
  // High‑frequency Ethereum tokens
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

export default function Home() {
  const router = useRouter();
  const [chain, setChain] = useState("ethereum");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Please enter a token address");
      return;
    }
    setError("");
    router.push(`/${chain}/${trimmed}`);
  }

  return (
    <div className="min-h-screen bg-[#070815] text-white flex flex-col items-center justify-center px-4 font-sans">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-2xl">

        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Web3 <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm text-center">
            Real-time DEX analytics · Powered by DexScreener, CoinGecko & Etherscan
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">

          {/* Chain Selector */}
          <div className="flex gap-2 flex-wrap">
            {CHAINS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChain(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  chain === c.id
                    ? "border-purple-500/60 bg-purple-500/20 text-white shadow-lg shadow-purple-500/10"
                    : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
                style={chain === c.id ? { borderColor: `${c.color}40`, boxShadow: `0 0 12px ${c.color}20` } : {}}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Address Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter token address (0x...)"
              className="w-full h-14 bg-[#171821] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-[#1E1F2E] transition-all font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && <p className="text-red-400 text-xs px-1">{error}</p>}

          <button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Open Dashboard
          </button>
        </form>

        {/* Quick Examples */}
        <div className="flex flex-col gap-2 w-full">
          <p className="text-[11px] uppercase tracking-widest text-gray-600 text-center">Quick examples</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.address}
                onClick={() => router.push(`/${ex.chain}/${ex.address}`)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-400 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
              >
                {ex.label} · {ex.chain}
              </button>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex items-center gap-6 text-[11px] text-gray-600">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live data</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> No API key needed</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> 300+ DEXs</span>
        </div>

      </div>
    </div>
  );
}
