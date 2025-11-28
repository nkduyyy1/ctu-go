"use client";

import { cn } from "@/lib/utils";

import {
  MapPin,
  Utensils,
  BookOpen,
  Bed,
  Search,
  Beaker,
  Trophy,
  Truck,
  Heart,
  X,
  Building,
  Megaphone,
  Dumbbell,
  ShoppingBag,
  FlaskConical,
  DoorOpen,
  Store,
  Trees,
  Flower2,
  Sprout,
  Zap,
  Coffee,
  Building2,
} from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

export const categories: Category[] = [
  {
    id: "all",
    slug: "all",
    name: "Tất cả",
    icon: MapPin,
    color: "#49525f",
  },
  {
    id: "8cb4631a-93dc-4113-ab0b-29058b9975c8",
    slug: "library",
    name: "Thư viện",
    icon: BookOpen,
    color: "#10b981",
  },
  {
    id: "63bd5ee8-7fc1-4981-986b-7549f14b0c9b",
    slug: "admin",
    name: "Hành chính",
    icon: Building,
    color: "#6366f1",
  },
  {
    id: "be1d060f-516e-497a-874f-8832cb3ae607",
    slug: "auditorium",
    name: "Hội trường",
    icon: Megaphone,
    color: "#f59e0b",
  },
  {
    id: "805120ed-007e-4a87-8f2d-5cf4e7e5f94f",
    slug: "sports",
    name: "Thể thao",
    icon: Trophy,
    color: "#ef4444",
  },
  {
    id: "ff14ee15-e577-4333-a55e-e808c4953b67",
    slug: "gym",
    name: "Gym",
    icon: Dumbbell,
    color: "#8b5cf6",
  },
  {
    id: "c6a074fb-7ee3-48f8-9be9-37ab85047d33",
    slug: "clinic",
    name: "Y tế",
    icon: Heart,
    color: "#f43f5e",
  },
  {
    id: "f15412ea-6847-48a7-b745-ee3df433464b",
    slug: "service",
    name: "Dịch vụ",
    icon: Building2,
    color: "#0ea5e9",
  },
  {
    id: "3539a896-4da4-48f7-8a9d-8685f1df65f5",
    slug: "convenience",
    name: "Tiện lợi",
    icon: ShoppingBag,
    color: "#f97316",
  },
  {
    id: "3230ac92-abce-4979-847f-dbabb8cdd677",
    slug: "canteen",
    name: "Căn tin",
    icon: Utensils,
    color: "#facc15",
  },
  {
    id: "5e576b7d-f2c2-441c-8149-a71948a7ee36",
    slug: "faculty",
    name: "Khoa",
    icon: Building2,
    color: "#3b82f6",
  },
  {
    id: "a590d9a2-b826-47d6-8436-6ae47ff1a5d8",
    slug: "research",
    name: "Nghiên cứu",
    icon: Beaker,
    color: "#8b5cf6",
  },
  {
    id: "db96df2f-7ab6-445e-8b15-728ea27d7140",
    slug: "lab",
    name: "Phòng lab",
    icon: FlaskConical,
    color: "#06b6d4",
  },
  {
    id: "2cc382a5-7012-4d3a-b46c-ca2c84a0c7dd",
    slug: "dormitory",
    name: "Ký túc xá",
    icon: Bed,
    color: "#10b981",
  },
  {
    id: "1f2ae0ce-acb4-4bda-b9a2-e685c2e9074a",
    slug: "classroom",
    name: "Giảng đường",
    icon: Building2,
    color: "#64748b",
  },
  {
    id: "065c6f9f-5cce-4972-87f7-6f625af5940e",
    slug: "parking",
    name: "Bãi xe",
    icon: Truck,
    color: "#94a3b8",
  },
  {
    id: "e2d175ca-600d-4374-a9a6-97efb5211496",
    slug: "gate",
    name: "Cổng",
    icon: DoorOpen,
    color: "#64748b",
  },
  {
    id: "969322b8-6fdb-4aa5-a9b9-fb41da0da0c8",
    slug: "shop",
    name: "Cửa hàng",
    icon: Store,
    color: "#f59e0b",
  },
  {
    id: "50f1d3b5-e5e1-4e5a-a7bc-1bf66c640353",
    slug: "park",
    name: "Công viên",
    icon: Trees,
    color: "#22c55e",
  },
  {
    id: "a6d3e7c7-317e-4ec1-a787-c0ce3dc68e81",
    slug: "garden",
    name: "Vườn",
    icon: Flower2,
    color: "#16a34a",
  },
  {
    id: "d9b77d0e-be1d-461e-8124-a5daf6fdf228",
    slug: "greenhouse",
    name: "Nhà kính",
    icon: Sprout,
    color: "#22c55e",
  },
  {
    id: "cbe09866-70d4-4069-94a6-6951332df9de",
    slug: "power",
    name: "Trạm điện",
    icon: Zap,
    color: "#fbbf24",
  },
  {
    id: "cbbfc70b-83eb-4256-ae4a-93b8c4d32740",
    slug: "cafeteria",
    name: "Café",
    icon: Coffee,
    color: "#8b4513",
  },
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
      <div className="w-full pointer-events-auto rounded-lg shadow-xl gap-3 mx-4 flex flex-col md:flex-row md:items-center ">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchQuery(e.target.value)}
            className="pl-10 pr-6 py-2 w-64 bg-gray-50 rounded-full text-sm w-[calc(100vw-64px)] md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    ? `bg-${cat.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
                style={{
                  backgroundColor: isActive ? cat.color : "",
                }}
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
