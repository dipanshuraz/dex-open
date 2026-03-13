import { useState, useEffect } from 'react';
import { POLLING_CONFIG } from '@/lib/config';


export interface Pool {
  dex: string;
  pair: string;
  liquidity: number;
  volume: number;
  age: number;
  pairAddress: string;
  url: string;
}

export function usePools(chain: string, tokenAddress: string) {
  const [data, setData] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenAddress) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pools?chain=${chain}&token=${tokenAddress}`);
        const json = await res.json();
        
        if (mounted && Array.isArray(json)) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load pools", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    const intervalId = setInterval(load, POLLING_CONFIG.pools);


    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [chain, tokenAddress]);

  return { pools: data, loading };
}
