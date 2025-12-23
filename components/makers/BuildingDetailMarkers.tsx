"use client";

import { Marker } from "react-leaflet";
import { MarkerFactory } from "./MarkerFactory";
import { LocationCategory, type Location } from "../../types";

interface IProps {
    locations: Location[];
    onLocationSelect: (loc: Location) => void;
}

export default function BuildingDetailMarkers({ locations, onLocationSelect }: IProps) {
    return (
        <>
            {locations.map((loc) => {
                const icon = MarkerFactory.create({
                    name: loc.name,
                    category: (loc.category?.slug as LocationCategory) || "other",
                });

                return (
                    <Marker
                        key={loc.id}
                        position={[loc.lat, loc.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => {
                                console.log("first")
                                onLocationSelect(loc);
                            },
                        }}
                    />
                );
            })}
        </>
    );
}