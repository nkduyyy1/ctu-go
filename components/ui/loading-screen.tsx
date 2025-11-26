"use client";

import ctuLogo from "@/public/assets/cg-logo.png";
import Image from "next/image";

interface LoadingScreenProps {
  isOpen: boolean;
}

export default function LoadingScreen({ isOpen }: LoadingScreenProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/30 w-32 h-32" />
          <div className="relative bg-white rounded-full p-4 shadow-2xl">
            <Image
              src={ctuLogo}
              alt="CTU Logo"
              width={80}
              height={80}
              className="overflow-hidden"
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">CTU GO</h2>
          <p className="text-gray-300 text-sm animate-pulse">
            Đang tải bản đồ campus...
          </p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
