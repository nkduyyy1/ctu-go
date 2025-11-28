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
import LocationRoutingPopup from "./LocationRoutingPopup";
import MapClickHandler from "./MapClickHandler";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import TempMarker from "./TempMarker";
import FloatingPlaceCard from "./MapFloatingPlaceCard";
import DirectionsPanel from "./MapDirectionsPanel";

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


  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSelectingDestination, setIsSelectingDestination] = useState(false);
  const [tempStartPoint, setTempStartPoint] = useState<[number, number] | null>(null);

  const [selectedPoint, setSelectedPoint] = useState<Location | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  const currentLayer = tileLayers.find((l) => l.id === currentTileId) || tileLayers[0];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Failed to get user location")
    );
  }, []);

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

  useEffect(() => {
    let filtered = locations;
    if (selectedCategories.length > 0) {
      if (selectedCategories.includes("all")) {
        filtered = locations;
      } else {
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
        <MapClickHandler
          onNormalClick={(latlng) => {
            setSelectedPoint({
              lat: latlng[0],
              lng: latlng[1],
              name: `Chấm màu xanh`
            });
            setShowDirections(false);
          }}
          isSelectingDestination={isSelectingDestination}
          startPoint={tempStartPoint}
          showDirectionsPanel={showDirections}
        />
        <MapFocusOnly
          selectedCategories={selectedCategories}
          onSelectedCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchQuery={setSearchQuery}
          filteredLocations={filteredLocations}
        />
        <TileLayer
          key={currentTileId}
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

        {selectedPoint && (
          <TempMarker position={[selectedPoint.lat, selectedPoint.lng]} />
        )}
        {
          showDirections && selectedPoint
          && (
            <DirectionsPanel
              locations={locations}
              selectedPoint={selectedPoint}
              onClose={() => setShowDirections(false)}
            />
          )}
        {selectedPoint && !showDirections && (
          <FloatingPlaceCard
            latlng={[selectedPoint.lat, selectedPoint.lng]}
            name={selectedPoint.name}
            image={selectedPoint.image_url?.[0]}
            onClose={() => setSelectedPoint(null)}
            onDirections={() => setShowDirections(true)}
          />
        )}
      </MapContainer>
      {selectedLocation && (
        <LocationRoutingPopup
          location={selectedLocation}
          userLocation={userLocation}
          open={!!selectedLocation}
          onOpenChange={() => setSelectedLocation(null)}
          onSelectDestination={(start) => {
            setTempStartPoint(start);
            setIsSelectingDestination(true);
          }}
        />
      )}
    </div>
  );
}
