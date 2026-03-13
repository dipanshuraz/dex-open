"use client";

import { useEffect, useRef, useState } from "react";

export function useSmartPolling<T>(
  fetcher: () => Promise<T>,
  interval = 5000
) {
  const [data, setData] = useState<T | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevHashRef = useRef<string>("");
  const retryRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (typeof document !== "undefined" && document.hidden) return; // pause when tab inactive

      try {
        const result = await fetcher();

        const hash = JSON.stringify(result);

        if (hash !== prevHashRef.current) {
          prevHashRef.current = hash;
          if (mounted) setData(result);
        }

        retryRef.current = 0; // reset retries
      } catch (err) {
        console.error("Polling error:", err);
        retryRef.current += 1;
      }
    }

    run();

    function start() {
      timerRef.current = setInterval(run, interval);
    }

    start();

    function handleVisibility() {
      if (typeof document !== "undefined" && !document.hidden) run();
    }

    if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof document !== "undefined") {
          document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [fetcher, interval]);

  return data;
}
