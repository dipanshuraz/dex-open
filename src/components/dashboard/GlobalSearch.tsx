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

    if (q.startsWith("0x") && q.length > 10) {
      router.push(`/ethereum/${q}`);
      return;
    }

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
      /* no-op */
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-genius-blue/30 border border-genius-blue text-[11px] text-genius-cream"
    >
      <Search className="w-3.5 h-3.5 text-genius-cream/60" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search token, pair, or address"
        className="bg-transparent outline-none text-[11px] text-genius-cream placeholder:text-genius-cream/50 w-48"
      />
      <button
        type="submit"
        disabled={loading}
        className="text-[10px] uppercase tracking-[0.16em] text-genius-pink hover:text-genius-pink/80 disabled:opacity-50"
      >
        Go
      </button>
    </form>
  );
}
