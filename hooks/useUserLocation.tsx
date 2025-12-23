import { useState, useEffect } from "react";

export type UserLocation = [number, number] | null; // [lat, lng]

export function useUserLocation(): UserLocation {
    const [location, setLocation] = useState<UserLocation>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("userLocation");
        if (saved) {
            try {
                const parsed: [number, number] = JSON.parse(saved);
                setLocation(parsed);
            } catch (e) {
                localStorage.removeItem("userLocation");
            }
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation: [number, number] = [latitude, longitude];

                setLocation(newLocation);
                setError(null);

                localStorage.setItem("userLocation", JSON.stringify(newLocation));
            },
            (err) => {
                const message = err.code === 1
                    ? "Bạn đã chặn quyền truy cập vị trí"
                    : err.code === 2
                        ? "Không thể xác định vị trí"
                        : "Lỗi lấy vị trí: " + err.message;

                setError(message);
                console.warn("Geolocation error:", err);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5 * 60 * 1000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return location;
}