"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Variant = "default" | "modern" | "apple" | "minimal";

interface Props {
  position: [number, number];
  variant?: Variant;
}

const markerIcons: Record<Variant, L.DivIcon> = {
  default: L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
        <div class="relative">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#00c950" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  }),

  modern: L.divIcon({
    className: "modern-marker",
    html: `
      <div class="relative">
        <div class="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div class="relative bg-white rounded-full shadow-2xl p-3 border-4 border-white">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="url(#gradient)" stroke="none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
  }),

  apple: L.divIcon({
    className: "apple-marker",
    html: `
      <div class="relative">
        <div class="absolute inset-0 bg-red-500 rounded-full opacity-30 blur-lg animate-pulse"></div>
        <div class="relative bg-white rounded-full shadow-xl p-2 border-2 border-gray-100">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#ff3b30" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 52],
  }),

  minimal: L.divIcon({
    className: "minimal-marker",
    html: `
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#00c950" stroke="white" stroke-width="2" class="drop-shadow-md">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  }),
};

export default function MapTempMarker({ position, variant = "default" }: Props) {
  return (
    <Marker position={position} icon={markerIcons[variant]} />
  );
}