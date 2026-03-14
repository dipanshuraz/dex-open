"use client";

const EMPTY_IMAGE_SRC = "https://www.tradegenius.com/static/images/empty.png";

/**
 * Empty state for tabbed tables: wireframe cube image + "Nothing here yet".
 */
export function TableEmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-genius-indigo">
      <img
        alt="Empty"
        loading="eager"
        width={80}
        height={80}
        decoding="async"
        className="object-contain"
        src={EMPTY_IMAGE_SRC}
      />
      <p className="text-sm text-genius-cream/60">Nothing here yet</p>
    </div>
  );
}
