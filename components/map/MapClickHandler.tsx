"use client";

import { useMapEvents } from "react-leaflet";
import { useDrawRoute } from "@/hooks/useDrawRoute";

interface Props {
    onNormalClick: (latlng: [number, number]) => void;
    isSelectingDestination: boolean;
    startPoint: [number, number] | null;
    showDirectionsPanel?: boolean;
}

export default function MapClickHandler({
    onNormalClick,
    isSelectingDestination,
    startPoint,
    showDirectionsPanel,
}: Props) {
    const { drawRoute, clearRoute } = useDrawRoute();

    useMapEvents({
        click(e) {
            const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];

            if (isSelectingDestination && startPoint) {
                drawRoute(startPoint, latlng);
                return;
            }

            onNormalClick(latlng);

            if (!showDirectionsPanel) {
                clearRoute();
            }
        },
    });
    if (startPoint) {
        <div className="absolute top-16 right-2 z-[1004]">
            <button onClick={() => clearRoute()}>Xóa đường đi</button>
        </div>
    }

    return null;
}