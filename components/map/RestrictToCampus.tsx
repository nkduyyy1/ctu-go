"use client";

import { useMapEvents } from "react-leaflet";
import { LatLng, polygon } from "leaflet";

export default function RestrictToCampus({
  polygonCoords,
}: {
  polygonCoords: [number, number][];
}) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      const latlng = new LatLng(center.lat, center.lng);
      const bounds = polygon(polygonCoords).getBounds();
      if (!bounds.contains(latlng)) {
        map.panInsideBounds(bounds, { animate: true });
      }
    },
  });

  return null;
}
