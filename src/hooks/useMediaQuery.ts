"use client";

import { useSyncExternalStore } from "react";

function subscribeMatchMedia(query: string, callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMatchMediaSnapshot(query: string) {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribeMatchMedia(query, callback),
    () => getMatchMediaSnapshot(query),
    getServerSnapshot
  );
}

export function useIsMobile(breakpointPx = 767): boolean {
  return useMediaQuery(`(max-width: ${breakpointPx}px)`);
}
