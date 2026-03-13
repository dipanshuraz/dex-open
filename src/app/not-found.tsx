import Link from "next/link";
import { MoveLeft, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070815] text-white flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-bounce shadow-2xl shadow-purple-500/20">
          <Ghost className="w-12 h-12 text-purple-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter text-white">404</h1>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            The token address or blockchain you're looking for doesn't exist in our records. Please check the URL or try searching again.
          </p>
        </div>

        <Link
          href="/"
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all group"
        >
          <MoveLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Search
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
