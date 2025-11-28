"use client";

import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

const MAX_LEAFLET_ZOOM = 18;

export default function BrowserZoomController() {
  const map = useMap();
  const [isBrowserZoom, setIsBrowserZoom] = useState(false);

  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
      const currentZoom = map.getZoom();

      console.log({ currentZoom, isBrowserZoom });

      if (currentZoom >= MAX_LEAFLET_ZOOM && !isBrowserZoom) {
        setIsBrowserZoom(true);
        document.body.style.overflow = "hidden";
        map.getContainer().style.transform = "scale(1)";
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.dragging.disable();
        document.documentElement.classList.add("browser-zoom-active");
      }

      if (currentZoom < MAX_LEAFLET_ZOOM && isBrowserZoom) {
        setIsBrowserZoom(false);
        document.body.style.overflow = "";
        document.documentElement.classList.remove("browser-zoom-active");
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
        map.dragging.enable();
      }
    };

    map.on("zoomend", handleZoom);
    handleZoom();

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, isBrowserZoom]);

  return null;
}
