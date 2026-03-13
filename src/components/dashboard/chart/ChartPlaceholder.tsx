"use client";

import { Activity } from "lucide-react";

export function ChartPlaceholder() {
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl h-[400px] flex flex-col justify-center items-center group relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <Activity className="w-16 h-16 text-white/20 mb-4 group-hover:text-blue-500/50 transition-colors duration-500" />
        <h3 className="text-xl font-bold text-white/50 z-10">Advanced Charting</h3>
        <p className="text-sm text-gray-500 mt-2 z-10 text-center max-w-sm">
            Interactive candlestick charts and technical indicators will appear here.
        </p>
        
        {/* Placeholder grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
    </div>
  );
}
