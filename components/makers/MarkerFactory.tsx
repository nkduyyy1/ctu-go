"use client";

import L from "leaflet";
import { renderToString } from "react-dom/server";

import {
  Library,
  School,
  Coffee,
  Home,
  Building2,
  FlaskConical,
  Activity,
  ParkingCircle,
  Dumbbell,
  Stethoscope,
  Wrench,
  ShoppingCart,
  Utensils,
  Landmark,
  Store,
  Trees,
  Leaf,
  Baby,
  GraduationCap,
  Microscope,
  Flame,
  DoorOpen,
  Droplets,
  Factory,
  UserIcon,
} from "lucide-react";
import { LocationCategory } from "@/types";

export const CategoryColor: Record<LocationCategory, string> = {
  classroom: "#3b82f6",
  library: "#9333ea",
  cafeteria: "#ea580c",
  dormitory: "#14b8a6",
  office: "#6b7280",
  laboratory: "#e11d48",
  lab: "#e11d48",
  research: "#be123c",
  sports: "#0284c7",
  parking: "#4b5563",
  other: "#64748b",
  gym: "#a16207",
  clinic: "#dc2626",
  service: "#0ea5e9",
  convenience: "#0d9488",
  canteen: "#eab308",
  admin: "#475569",
  auditorium: "#7c3aed",
  restaurant: "#b91c1c",
  shop: "#22c55e",
  park: "#16a34a",
  garden: "#14532d",
  playground: "#d946ef",
  other_facility: "#6b7280",
  faculty: "#2563eb",
  power: "#44403c",
  gate: "#7f1d1d",
  water: "#0284c7",
  greenhouse: "#65a30d",
  user: "#2b82ff",
};

export const CategoryIconMap: Record<LocationCategory, any> = {
  classroom: School,
  library: Library,
  cafeteria: Coffee,
  dormitory: Home,
  office: Building2,
  laboratory: FlaskConical,
  lab: FlaskConical,
  research: Microscope,
  sports: Activity,
  gym: Dumbbell,
  parking: ParkingCircle,
  clinic: Stethoscope,
  service: Wrench,
  convenience: ShoppingCart,
  canteen: Utensils,
  restaurant: Utensils,
  auditorium: Landmark,
  admin: Building2,
  shop: Store,
  park: Trees,
  garden: Leaf,
  playground: Baby,
  faculty: GraduationCap,
  power: Flame,
  gate: DoorOpen,
  water: Droplets,
  greenhouse: Factory,
  other_facility: Building2,
  other: Building2,
  user: UserIcon,
};

interface IProps {
  name: string;
  category: LocationCategory;
}

export const MarkerFactory = {
  create({ name, category }: IProps): L.DivIcon {
    const color = "#fff";
    const IconComponent = CategoryIconMap[category] ?? Building2;

    const label = name.length > 18 ? name.slice(0, 16) + "..." : name;
    const width = Math.max(110, label.length * 7);
    const padding = 8;
    const total = width + padding * 2;

    const iconHtml = renderToString(
      <IconComponent
        background={"white"}
        size={16}
        strokeWidth={2}
        color={color}
      />
    );

    const html = `
      <div class="marker-wrapper" style="text-align:center;">
        <div class="marker-icon" style="width:fit-content;margin:0 auto; background-color:#798f9b; padding: 4px; border-radius: 50%; border: 1px solid #fff">
          ${iconHtml}
        </div>
        <div class="marker-label"
          style="
            max-width:${total}px;
            width:fit-content;
            margin:0 auto;
            color:#fff;
            text-shadow:1px 1px #000;
            font-size:8px;
            margin-top: 0px;">
          ${label}
        </div>
      </div>
    `;

    return L.divIcon({
      className: "marker-with-label",
      html,
      iconSize: [total, 36],
      iconAnchor: [total / 2, 36],
      popupAnchor: [0, -36],
    });
  },
};
