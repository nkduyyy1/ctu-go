"use client";

import { useEffect, useState } from "react";
import { Map, Satellite, Palette, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

type TileType = {
  id: string;
  name: string;
  icon: React.ElementType;
  url: string;
  maxZoom?: number;
  maxNativeZoom?: number;
};

export const tileLayers: TileType[] = [
  {
    id: "esri-satellite",
    name: "Vệ tinh",
    icon: Satellite,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 19,
  },
  {
    id: "osm",
    name: "Dẫn đường",
    icon: Navigation,
    url: "https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=a963961e90654948a89a48c6d61dcf88",
  },
  {
    id: "stamen-toner",
    name: "Sơn nước",
    icon: Palette,
    url: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
  },
  {
    id: "standard",
    name: "Tiêu chuẩn",
    icon: Map,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  },
];

const STORAGE_KEY = "ctugo-preferred-tile";

interface TileLayerSwitcherProps {
  currentTileId: string;
  onTileChange: (id: string) => void;
}

export default function TileLayerSwitcher({
  currentTileId,
  onTileChange,
}: TileLayerSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLayer =
    tileLayers.find((l) => l.id === currentTileId) || tileLayers[0];

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && tileLayers.some((l) => l.id === saved)) {
      onTileChange(saved);
    }
  }, []);

  const handleSelect = (layer: TileType) => {
    onTileChange(layer.id);
    localStorage.setItem(STORAGE_KEY, layer.id);
  };

  return (
    <div className="fixed bottom-16 right-2 z-[1001] pointer-events-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white hover:bg-gray-50 shadow-xl rounded-lg p-2 transition-all hover:scale-110"
        title="Thay đổi kiểu bản đồ"
      >
        <currentLayer.icon className="w-5 h-5 text-gray-700" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[1000]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute z-[1001] bottom-16 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="font-bold text-xs">Chọn kiểu bản đồ</h3>
            </div>

            <div className="max-h-96 flex flex-col gap-2 overflow-y-auto my-2">
              {tileLayers.map((layer) => {
                const Icon = layer.icon;
                const isActive = currentTileId === layer.id;

                return (
                  <button
                    key={layer.id}
                    onClick={() => handleSelect(layer)}
                    className={cn(
                      "w-full p-2 flex items-center gap-4 hover:bg-gray-50 transition-all",
                      isActive && "bg-blue-50 border-l-4 border-blue-600"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1 rounded-xl",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-800 text-xs">
                        {layer.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
