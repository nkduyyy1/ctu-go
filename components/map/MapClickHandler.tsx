"use client";

import { useMapEvents } from "react-leaflet";
import { useDrawRoute } from "@/hooks/useDrawRoute";

interface Props {
    onNormalClick: (latlng: [number, number]) => void;
    showDirectionsPanel?: boolean;
}

export default function MapClickHandler({
    onNormalClick,
    showDirectionsPanel,
}: Props) {
    const { clearRoute } = useDrawRoute();

    useMapEvents({
        click(e) {
            const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];

            onNormalClick(latlng);

            if (!showDirectionsPanel) {
                clearRoute();
            }
        },
    });

    return null;
}