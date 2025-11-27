"use client";

import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ctuCampusCoords } from "@/data/locations";
import UserLocationMarker from "../makers/UserLocationMarker";
import BuildingDetailMarkers from "../makers/BuildingDetailMarkers";
import { useEffect, useState } from "react";
import { getLocations } from "@/app/actions/locationActions";
import type { Location } from "@/types";
import { useLoading } from "../providers/LoadingProvider";
import MapInfo from "./MapInfo";
import MapFocusOnly from "./MapFocusOnly";
import { tileLayers } from "./TileLayerSwitcher";
import TileLayerSwitcher from "./TileLayerSwitcher";
import MapFilterBar from "./MapFilterBar";

const worldPolygon: [number, number][] = [
  [90, -180],
  [90, 180],
  [-90, 180],
  [-90, -180],
];

export default function MapView() {
  const center: [number, number] = [10.0315, 105.7685];
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "all",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const [currentTileId, setCurrentTileId] = useState("esri-satellite");

  // Tìm layer hiện tại
  const currentLayer =
    tileLayers.find((l) => l.id === currentTileId) || tileLayers[0];

  useEffect(() => {
    const fetch = async () => {
      try {
        showLoading();
        const response = await getLocations({});
        console.log(response);
        const data = response.locations.filter(
          (location) => location.lat && location.lng
        );
        setLocations(data);
      } catch {
        console.log("Failed to fetch locations");
      } finally {
        hideLoading();
      }
    };
    fetch();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = locations;
    console.log(locations);
    console.log({ selectedCategories });
    if (selectedCategories.length > 0) {
      if (selectedCategories.includes("all")) {
        console.log("first", locations);
        filtered = locations;
      } else {
        console.log("first");
        filtered = filtered.filter((loc) =>
          selectedCategories.includes(loc.category?.slug || "")
        );
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.description?.toLowerCase().includes(query)
      );
    }
    console.log(filtered);
    setFilteredLocations(filtered);
  }, [selectedCategories, searchQuery, locations]);

  const handleSelectCategory = (slug: string) => {
    if (slug == "all") {
      setSelectedCategories([slug]);
      return;
    }

    if (selectedCategories.includes(slug)) {
      setSelectedCategories((prev) =>
        prev.filter((c) => c !== slug).filter((c) => c !== "all")
      );
    } else {
      setSelectedCategories((prev) =>
        [...prev, slug].filter((c) => c !== "all")
      );
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Header Info */}
      <MapInfo
        numberOfFilteredLocation={filteredLocations.length}
        numberOfLocation={locations.length}
      />

      <TileLayerSwitcher
        currentTileId={currentTileId}
        onTileChange={(id: string) => setCurrentTileId(id)}
      />

      <MapFilterBar
        selectedCategories={selectedCategories}
        onSelectedCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        filteredLocations={filteredLocations}
      />
      <MapContainer
        center={center}
        zoom={17}
        style={{ height: "100vh", width: "100vw" }}
        minZoom={15}
        maxZoom={18}
        zoomControl={true}
        attributionControl={false}
        maxBoundsViscosity={1}
        wheelPxPerZoomLevel={20}
        zoomSnap={0}
        zoomDelta={0.3}
      >
        <MapFocusOnly
          selectedCategories={selectedCategories}
          onSelectedCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
          filteredLocations={filteredLocations}
        />
        {/* <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          // url="https://tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=a963961e90654948a89a48c6d61dcf88"
          // url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
          // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          maxNativeZoom={19}
          zoomOffset={0}
        /> */}
        <TileLayer
          key={currentTileId} // quan trọng: force re-render khi đổi tile
          url={currentLayer.url}
          maxZoom={25}
          maxNativeZoom={currentLayer.maxNativeZoom || 20}
        />
        <Polygon
          positions={[worldPolygon, ctuCampusCoords]}
          pathOptions={{
            color: "none",
            fillColor: "black",
            fillOpacity: 0.6,
            pane: "overlayPane",
          }}
          interactive={false}
        />
        <Polygon
          positions={ctuCampusCoords}
          pathOptions={{ color: "green", weight: 1 }}
        />
        <UserLocationMarker mockMode hideControlButton={true} />
        <BuildingDetailMarkers locations={filteredLocations} />
      </MapContainer>
    </div>
  );
}
