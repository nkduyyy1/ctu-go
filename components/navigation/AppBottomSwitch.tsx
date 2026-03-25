"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AppBottomSwitch() {
  const pathname = usePathname();
  const isGo = pathname === "/";
  const isDou = !isGo;

  return (
    <div
      className="pointer-events-none fixed z-[1200] w-[min(calc(100vw-2rem),17.5rem)]"
      style={{
        left: "max(1rem, env(safe-area-inset-left))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <nav
        className="pointer-events-auto flex overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-lg shadow-primary/15 dark:border-primary/30 dark:bg-white"
        aria-label="Chuyển chế độ ứng dụng"
      >
        <Link
          href="/"
          className={cn(
            "min-w-0 flex-1 py-2.5 text-center text-sm font-bold tracking-tight transition-colors",
            isGo ? "bg-primary text-white" : "bg-white text-primary hover:bg-primary/5"
          )}
          aria-current={isGo ? "page" : undefined}
        >
          CTU GO
        </Link>
        <Link
          href="/discover"
          className={cn(
            "min-w-0 flex-1 py-2.5 text-center text-sm font-bold tracking-tight transition-colors",
            isDou ? "bg-primary text-white" : "bg-white text-primary hover:bg-primary/5"
          )}
          aria-current={isDou ? "page" : undefined}
        >
          CTU DOU
        </Link>
      </nav>
    </div>
  );
}
