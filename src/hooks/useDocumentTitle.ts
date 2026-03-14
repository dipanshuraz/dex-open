"use client";

import { useEffect } from "react";

const DEFAULT_TITLE = "Web3 Dashboard";

export function useDocumentTitle(title: string | null, fallback = DEFAULT_TITLE) {
  useEffect(() => {
    document.title = title ?? fallback;
    return () => {
      document.title = fallback;
    };
  }, [title, fallback]);
}
