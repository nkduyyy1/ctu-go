import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { toast } from "sonner";

let routeControl: L.Routing.Control | null = null;

const startIcon = L.divIcon({
  className: "routing-start-marker",
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-70"></div>
      <div class="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-40"></div>
      <div class="relative">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3.5" fill="white"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const endIcon = L.divIcon({
  className: "routing-end-marker",
  html: `
    <div class="relative">
      <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-70"></div>
      <div class="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-40"></div>
      <div class="relative mt-2">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3.5" fill="white"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export function useDrawRoute() {
  const map = useMap();

  const drawRoute = (start: [number, number], end: [number, number]) => {
    if (!map) {
      toast.error("Bản đồ chưa sẵn sàng");
      return;
    }

    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

    routeControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ],
      createMarker: (i: number, waypoint: any) => {
        const marker = L.marker(waypoint.latLng, {
          icon: i === 0 ? startIcon : endIcon,
          zIndexOffset: i === 0 ? 1000 : 999,
        });

        return marker;
      },
      lineOptions: {
        styles: [
          {
            color: "#3b82f6",
            weight: 8,
            opacity: 0.95,
            className: "animated-path",
          },
        ],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "foot",
      }),
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      show: false,
    })
      .on("routesfound", (e: any) => {
        const route = e.routes[0];
        const km = (route.summary.totalDistance / 1000).toFixed(2);
        const mins = Math.round(route.summary.totalTime / 60);

        toast.success(`${km} km • ~${mins} phút đi bộ`);

        // Zoom vừa đẹp
        map.fitBounds(route.coordinates, { padding: [50, 50] });
      })
      .on("routingerror", () => {
        toast.error("Không tìm được đường đi");
      })
      .addTo(map);
  };

  const clearRoute = () => {
    if (routeControl && map) {
      map.removeControl(routeControl);
      routeControl = null;
    }
  };

  return { drawRoute, clearRoute };
}