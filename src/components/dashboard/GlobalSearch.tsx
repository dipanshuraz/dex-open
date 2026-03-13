"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;

    // If user pasted a 0x address, assume Ethereum token and navigate directly.
    if (q.startsWith("0x") && q.length > 10) {
      router.push(`/ethereum/${q}`);
      return;
    }

    // Otherwise, use Dexscreener search to resolve a pair and navigate.
    try {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const pair = data?.pairs?.[0];
      if (!pair) {
        setLoading(false);
        return;
      }
      router.push(`/${pair.chainId}/${pair.baseToken.address}`);
    } catch {
      // best-effort search; silently fail for now
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] text-gray-500"
    >
      <Search className="w-3.5 h-3.5 text-gray-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search token, pair, or address"
        className="bg-transparent outline-none text-[11px] text-black dark:text-white placeholder:text-gray-400 w-48"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-[10px] uppercase tracking-[0.16em] text-purple-500 hover:text-purple-300 disabled:opacity-50"
      >
        Go
      </button>
    </form>
  );
}

