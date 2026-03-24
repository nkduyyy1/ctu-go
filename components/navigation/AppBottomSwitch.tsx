"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppBottomSwitch() {
  const pathname = usePathname();
  const isDou = pathname !== "/";

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[1200] w-[250px]">
      <div className="pointer-events-auto relative grid grid-cols-2 rounded-2xl border border-white/30 bg-[#0f172acc] p-1.5 shadow-2xl backdrop-blur-md">
        <Link
          href="/"
          className={`relative z-10 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
            isDou ? "text-white/85 hover:text-white" : "text-[#0b3b2e]"
          }`}
        >
          CTU Go
        </Link>

        <Link
          href="/discover"
          className={`relative z-10 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
            isDou ? "text-[#0b3b2e]" : "text-white/85 hover:text-white"
          }`}
        >
          CTU Dou
        </Link>
      </div>
    </div>
  );
}
