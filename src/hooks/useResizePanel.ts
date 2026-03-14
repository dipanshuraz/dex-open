"use client";

import { useState, useCallback } from "react";
import { CHART_HEIGHT_MIN, CHART_HEIGHT_MAX, CHART_HEIGHT_DEFAULT } from "@/lib/constants";

interface UseResizePanelOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  defaultPercent?: number;
  minPercent?: number;
  maxPercent?: number;
}

export function useResizePanel({
  containerRef,
  defaultPercent = CHART_HEIGHT_DEFAULT,
  minPercent = CHART_HEIGHT_MIN,
  maxPercent = CHART_HEIGHT_MAX,
}: UseResizePanelOptions) {
  const [percent, setPercent] = useState(defaultPercent);

  const handleResizeStart = useCallback(
    (startClientY: number, startPercent: number) => {
      const container = containerRef.current;
      if (!container) return;

      const move = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const deltaY = e.clientY - startClientY;
        const deltaPercent = (deltaY / rect.height) * 100;
        const next = Math.min(maxPercent, Math.max(minPercent, startPercent + deltaPercent));
        setPercent(next);
      };

      const stop = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", stop);
    },
    [containerRef, minPercent, maxPercent]
  );

  return { percent, setPercent, handleResizeStart };
}
