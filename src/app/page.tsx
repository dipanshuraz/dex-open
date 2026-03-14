"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Zap, Shield } from "lucide-react";

import { CHAINS } from "@/lib/config";
import { LANDING_EXAMPLES, LANDING_FEATURES } from "@/dummy/landing";

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
    <div className="min-h-screen bg-surface-dark text-white flex flex-col items-center justify-center px-4 font-sans">

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
              className="w-full h-14 bg-input-bg border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-input-bg-focus transition-all font-mono"
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
            {LANDING_EXAMPLES.map((ex) => (
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
          {LANDING_FEATURES.map((f) => (
            <span key={f.label} className="flex items-center gap-1.5">
              {f.icon === "dot" && <div className="w-1.5 h-1.5 rounded-full bg-genius-green" />}
              {f.icon === "shield" && <Shield className="w-3 h-3" />}
              {f.icon === "trending" && <TrendingUp className="w-3 h-3" />}
              {f.label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
