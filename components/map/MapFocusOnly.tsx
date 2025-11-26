import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

interface IProps {
  selectedCategories: string[];
  onSelectedCategory: (slug: string) => void;
  searchQuery: string;
  onSearchQuery: (query: string) => void;
  filteredLocations: any[];
}

const MapFocusOnly = ({ filteredLocations }: IProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || filteredLocations.length === 0) return;

    if (filteredLocations.length === 1) {
      const loc = filteredLocations[0];
      map.setView([loc.lat, loc.lng], 18, { animate: true });
    } else {
      const bounds = filteredLocations.reduce((b: any, loc: any) => {
        return b.extend([loc.lat, loc.lng]);
      }, L.latLngBounds([filteredLocations[0].lat, filteredLocations[0].lng], [filteredLocations[0].lat, filteredLocations[0].lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }
  }, [filteredLocations, map]);

  return <div></div>;
};

export default MapFocusOnly;
