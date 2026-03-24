"use client";

import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import { useDrawRoute } from "@/hooks/useDrawRoute";

interface Props {
    onNormalClick: (latlng: [number, number]) => void;
    showDirectionsPanel?: boolean;
    preserveRouteOnMapClick?: boolean;
    clearRouteSignal?: number;
}

export default function MapClickHandler({
    onNormalClick,
    showDirectionsPanel,
    preserveRouteOnMapClick = false,
    clearRouteSignal = 0,
}: Props) {
    const { clearRoute } = useDrawRoute();

    useEffect(() => {
        if (clearRouteSignal > 0) {
            clearRoute();
        }
    }, [clearRouteSignal, clearRoute]);

    useMapEvents({
        click(e) {
            const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];

            onNormalClick(latlng);

            if (!showDirectionsPanel && !preserveRouteOnMapClick) {
                clearRoute();
            }
        },
    });

    return null;
}