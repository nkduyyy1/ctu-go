import { Json } from "@/supabase/database.types";

export type LocationCategory =
  | "classroom" // Giảng đường
  | "library" // Thư viện
  | "cafeteria" // Căn tin
  | "dormitory" // Ký túc xá
  | "office" // Văn phòng
  | "laboratory" // Phòng thí nghiệm
  | "sports" // Thể thao
  | "parking" // Bãi đỗ xe
  | "other" // Khác
  | "gym" // Phòng tập gym
  | "clinic" // Trạm y tế
  | "service" // Dịch vụ
  | "convenience" // Cửa hàng tiện lợi
  | "canteen" // Căng tin
  | "admin" // Hành chính
  | "auditorium" // Hội trường
  | "restaurant" // Nhà hàng
  | "shop" // Cửa hàng
  | "park" // Công viên
  | "garden" // Vườn
  | "playground" // Sân chơi
  | "other_facility"
  | "faculty" // Khoa
  | "research" // Viện nghiên cứu
  | "lab" // Phòng lab
  | "power" // Trạm điện
  | "gate" // Cổng trường
  | "water" // Hồ nước
  | "greenhouse" // Nhà kính
  | "user";

export interface Category {
  id: string;
  name: string;
  color: string;
  slug: string;
}

export interface Location {
  id: string;
  name: string;
  type: "building" | "dorm" | "restaurant";
  category: Category | null;
  lat: number;
  lng: number;
  description: string;
  image_url?: string[];
  details?:
    | string
    | number
    | true
    | {
        [key: string]: Json | undefined;
      }
    | Json[];
}

export interface BuildingDetails {
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  floors?: number;
  capacity?: number;
  facilities?: string[];
  history?: string;
}

export interface Path {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export interface MapData {
  locations: Location[];
  paths: Path[];
}
