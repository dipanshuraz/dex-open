"use client";

/**
 * Empty state for tabbed tables: 3D-style wireframe cube + "Nothing here yet".
 * Matches reference UI (purple/blue luminous cube).
 */
export function TableEmptyState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-genius-cream/50">
      {/* Wireframe cube – isometric view */}
      <div className="relative w-24 h-24 flex items-center justify-center text-genius-pink/80">
        <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden>
          {/* Isometric cube edges – stroke uses currentColor (theme) */}
          <g stroke="currentColor" fill="none" strokeWidth="1.5">
            {/* Back edges (fainter) */}
            <path d="M60 75 L35 55 L35 25 L60 45 Z" strokeOpacity="0.2" />
            <path d="M60 45 L60 75 L85 55 L85 25 Z" strokeOpacity="0.2" />
            <path d="M35 55 L60 75 L85 55 L60 35 Z" strokeOpacity="0.2" />
            {/* Front/visible edges (brighter) */}
            <path d="M60 75 L35 55 M60 75 L85 55 M60 75 L60 45" strokeOpacity="0.95" strokeWidth="2" />
            <path d="M35 55 L35 25 M35 55 L60 35" strokeOpacity="0.6" />
            <path d="M60 45 L35 25 M60 45 L85 25 M60 45 L60 35" strokeOpacity="0.6" />
            <path d="M85 55 L85 25 M85 55 L60 35 M60 35 L85 25" strokeOpacity="0.6" />
          </g>
        </svg>
      </div>
      <p className="text-sm text-genius-cream/50">Nothing here yet</p>
    </div>
  );
}
