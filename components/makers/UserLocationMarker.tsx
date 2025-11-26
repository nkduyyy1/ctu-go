"use client";

import { useEffect, useRef, useState } from "react";
import { Marker, Circle, useMap } from "react-leaflet";
import L, { type LatLngExpression, type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngBounds } from "leaflet";
import { toast } from "sonner";
import { ctuCampusCoords } from "@/data/locations";
import { isInsidePolygon } from "@/lib/utils";
import { MarkerFactory } from "./MarkerFactory";

const icon = MarkerFactory.create({ name: "You", category: "user" });

export default function UserLocationMarker({
  followDefault = false,
  campusBounds,
  hideControlButton = false,
}: {
  followDefault?: boolean;
  campusBounds?: LatLngBounds | null;
  mockMode?: boolean;
  hideControlButton?: boolean;
}) {
  const map = useMap();
  const watcherIdRef = useRef<number | null>(null);
  const firstFixRef = useRef(false);
  const [position, setPosition] = useState<LatLngLiteral | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(followDefault);

  let lastToastTime = 0;

  function notifyOutsideCampus() {
    const now = Date.now();
    if (now - lastToastTime < 60 * 3600) return;
    lastToastTime = now;
    toast.info("Bạn đang ở ngoài khuôn viên trường Đại học Cần Thơ.");
  }

  function clampToBounds(latlng: LatLngLiteral) {
    if (!campusBounds) return latlng;
    if (campusBounds.contains(latlng)) return latlng;
    const clampedLat = Math.min(
      Math.max(latlng.lat, campusBounds.getSouth()),
      campusBounds.getNorth()
    );
    const clampedLng = Math.min(
      Math.max(latlng.lng, campusBounds.getWest()),
      campusBounds.getEast()
    );
    return { lat: clampedLat, lng: clampedLng };
  }

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      toast.info("Geolocation not supported by this browser.");
      return;
    }

    const geoOpts: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 20000,
    };

    const success = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ?? 0;
      const raw = { lat, lng };
      const safe = clampToBounds(raw);
      setPosition(safe);
      setAccuracy(acc);
      if (!isInsidePolygon([safe.lat, safe.lng], ctuCampusCoords)) {
        notifyOutsideCampus();
      }

      if (!firstFixRef.current) {
        firstFixRef.current = true;

        map.flyTo([safe.lat, safe.lng], Math.max(map.getZoom(), 17), {
          animate: true,
        });
      } else {
        if (isFollowing) {
          map.panTo([safe.lat, safe.lng], { animate: true });
        }
      }
    };

    const error = (err: GeolocationPositionError) => {
      console.log("Geolocation error", err);
      toast.error("Something went wrong while retrieving your location.");
    };

    const id = navigator.geolocation.watchPosition(success, error, geoOpts);
    const timeout = setTimeout(function () {
      navigator.geolocation.clearWatch(id);
    }, 5000);

    watcherIdRef.current = id;

    return () => {
      if (watcherIdRef.current !== null)
        navigator.geolocation.clearWatch(watcherIdRef.current);
    };
  }, [map, isFollowing]);

  useEffect(() => {
    if (hideControlButton) return;

    const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    container.style.background = "white";
    container.style.padding = "4px";
    container.style.borderRadius = "4px";
    container.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
    container.style.cursor = "pointer";
    container.title = "Center on me / Toggle follow";

    const icon = L.DomUtil.create("span", "", container);
    icon.innerHTML = "🎯";
    icon.style.display = "inline-block";
    icon.style.lineHeight = "22px";
    icon.style.padding = "0 6px";

    const control = L.Control.extend({
      onAdd: function () {
        return container;
      },
    });

    const ctrl = new control({ position: "topright" });
    ctrl.addTo(map);

    const onClick = (e: Event) => {
      L.DomEvent.stopPropagation(e);

      setIsFollowing((v) => {
        const newVal = !v;
        if (position && newVal) {
          map.panTo([position.lat, position.lng], { animate: true });
        }
        return newVal;
      });
    };

    container.addEventListener("click", onClick);

    return () => {
      container.removeEventListener("click", onClick);
      map.removeControl(ctrl);
    };
  }, [map, position, hideControlButton]);

  if (!position) return null;

  const displayedRadius = accuracy ? Math.max(5, Math.min(accuracy, 50)) : 8;

  return (
    <>
      <Marker
        position={[position.lat, position.lng] as LatLngExpression}
        icon={icon}
      />
      <Circle
        center={[position.lat, position.lng] as LatLngExpression}
        radius={Math.max(2, displayedRadius * 0.15)}
        pathOptions={{
          color: "#2b82ff",
          weight: 0,
          fillColor: "#2b82ff",
          fillOpacity: 0.9,
        }}
      />
    </>
  );
}
