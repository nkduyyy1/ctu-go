// utils/icons.ts
import L from "leaflet";

export const blueDotIcon = L.divIcon({
    className: "custom-marker",
    html: `
    <div style="
      width: 20px; height: 20px;
      background: #1a73e8;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
    <div style="
      width: 40px; height: 40px;
      background: #1a73e8;
      opacity: 0.2;
      border-radius: 50%;
      position: absolute;
      top: -10px; left: -10px;
      animation: pulse 2s infinite;
    "></div>
  `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});