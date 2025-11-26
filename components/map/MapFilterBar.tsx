"use client";

import {
  Search,
  X,
  MapPin,
  Utensils,
  BookOpen,
  Bed,
  GraduationCap,
  Beaker,
  Trophy,
  Truck,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const categories: Category[] = [
  { slug: "all", name: "Tất cả", icon: MapPin, color: "bg-gray-600" },
  { slug: "canteen", name: "Căn tin", icon: Utensils, color: "bg-orange-500" },
  {
    slug: "library",
    name: "Thư viện",
    icon: BookOpen,
    color: "bg-emerald-500",
  },
  { slug: "dormitory", name: "Ký túc xá", icon: Bed, color: "bg-purple-500" },
  { slug: "faculty", name: "Khoa", icon: GraduationCap, color: "bg-blue-500" },
  { slug: "lab", name: "Phòng lab", icon: Beaker, color: "bg-cyan-500" },
  { slug: "sports", name: "Thể thao", icon: Trophy, color: "bg-red-500" },
  { slug: "parking", name: "Bãi xe", icon: Truck, color: "bg-zinc-500" },
  { slug: "clinic", name: "Y tế", icon: Heart, color: "bg-pink-500" },
];

interface MapFilterBarProps {
  selectedCategories: string[];
  onSelectedCategory: (slug: string) => void;
  searchQuery: string;
  onSearchQuery: (query: string) => void;
  filteredLocations: any[];
}

export default function MapFilterBar({
  selectedCategories,
  onSelectedCategory,
  searchQuery,
  onSearchQuery,
  filteredLocations,
}: MapFilterBarProps) {
  const activeCategory = categories.find(
    (c) => selectedCategories.includes(c.slug) && c.slug !== "all"
  );

  return (
    <div className="absolute top-3 left-[52px] w-[calc(100vw-64px)] z-[10001] flex flex-col items-center pointer-events-none">
      {/* Search + Filter Row */}
      <div className="w-full pointer-events-auto rounded-lg shadow-xl gap-3 mx-4 flex flex-col md:flex-row md:items-center ">
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-64 bg-gray-50 rounded-full text-sm w-[calc(100vw-64px)] md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQuery("")}
              className="absolute right-2 top-2.5"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide snap-x no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategories.includes(cat.slug);
            const isAll = cat.slug === "all";

            return (
              <button
                key={cat.slug}
                onClick={() => onSelectedCategory(cat.slug)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all snap-center",
                  isActive
                    ? `${cat.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
                {isActive && !isAll && (
                  <span className="ml-1 text-xs opacity-90">
                    ({filteredLocations.length})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Summary */}
      {(selectedCategories.length > 1 || (activeCategory && searchQuery)) && (
        <div className="mt-3 pointer-events-auto bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-lg text-sm">
          <span className="text-gray-600">Đang hiển thị:</span>{" "}
          <span className="font-semibold text-blue-600">
            {activeCategory ? activeCategory.name : "Kết quả tìm kiếm"}
            {filteredLocations.length > 0 &&
              ` (${filteredLocations.length} địa điểm)`}
          </span>
          <button
            onClick={() => {
              onSelectedCategory("all");
              onSearchQuery("");
            }}
            className="ml-3 text-red-500 hover:text-red-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
