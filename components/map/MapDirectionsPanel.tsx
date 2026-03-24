"use client";

import { Button } from "@/components/ui/button";
import { X, ArrowUpDown, MapPin } from "lucide-react";
import { useDrawRoute } from "@/hooks/useDrawRoute";
import { useEffect, useState, useMemo, useRef } from "react";
import { Location } from "@/types";
import { createPortal } from "react-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  selectedPoint: Location | null;
  locations: Location[];
  mapUserCoords?: [number, number] | null;
  onRouteStart: () => void;
  onClose: () => void;
}

function makeCurrentLocationOption(lat: number, lng: number): Location {
  return {
    id: "current-location",
    name: "Vị trí hiện tại",
    lat,
    lng,
    description: "GPS · định vị",
  } as Location;
}

function matchesQuery(loc: Location, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (loc.id === "current-location") {
    const blob =
      `${loc.name} ${loc.description ?? ""} vị trí của bạn đứng here current gps`.toLowerCase();
    if (blob.includes(s)) return true;
  }
  return (
    loc.name.toLowerCase().includes(s) ||
    !!loc.description?.toLowerCase().includes(s)
  );
}

export default function DirectionsPanel({
  selectedPoint,
  locations,
  mapUserCoords = null,
  onRouteStart,
  onClose,
}: Props) {
  const { drawRoute, clearRoute } = useDrawRoute();
  const userLocation = useUserLocation();

  const [from, setFrom] = useState<Location | null>(null);
  const [to, setTo] = useState<Location | null>(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const fromComboRef = useRef<HTMLDivElement>(null);
  const toComboRef = useRef<HTMLDivElement>(null);

  const routeOptions = useMemo(() => {
    const opts: Location[] = [];
    const seen = new Set<string>();
    const add = (loc: Location) => {
      const k = String(loc.id ?? `${loc.lat}-${loc.lng}`);
      if (seen.has(k)) return;
      seen.add(k);
      opts.push(loc);
    };
    if (selectedPoint?.lat != null && selectedPoint?.lng != null) {
      add({
        id: "map-selected-point",
        name:
          selectedPoint.name?.trim() ||
          `${selectedPoint.lat.toFixed(6)}, ${selectedPoint.lng.toFixed(6)}`,
        lat: selectedPoint.lat,
        lng: selectedPoint.lng,
        description: selectedPoint.description,
      } as Location);
    }
    const coords = userLocation ?? mapUserCoords;
    if (coords) {
      add(makeCurrentLocationOption(coords[0], coords[1]));
    }
    for (const loc of locations) {
      add(loc);
    }
    return opts;
  }, [selectedPoint, userLocation, mapUserCoords, locations]);

  useEffect(() => {
    if (!selectedPoint?.lat) return;
    const dest: Location = {
      id: "map-selected-point",
      name:
        selectedPoint.name?.trim() ||
        `${selectedPoint.lat.toFixed(6)}, ${selectedPoint.lng.toFixed(6)}`,
      lat: selectedPoint.lat,
      lng: selectedPoint.lng,
    } as Location;
    setTo(dest);
    setSearchTo(dest.name);
    setFrom(null);
    setSearchFrom("");
    setOpenFrom(false);
    setOpenTo(false);
  }, [selectedPoint?.lat, selectedPoint?.lng, selectedPoint?.name]);

  useEffect(() => {
    if (!openFrom && !openTo) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (openFrom && fromComboRef.current && !fromComboRef.current.contains(t)) {
        setOpenFrom(false);
      }
      if (openTo && toComboRef.current && !toComboRef.current.contains(t)) {
        setOpenTo(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [openFrom, openTo]);

  const filteredFrom = useMemo(() => {
    return routeOptions.filter((loc) => matchesQuery(loc, searchFrom));
  }, [searchFrom, routeOptions]);

  const filteredTo = useMemo(() => {
    return routeOptions.filter((loc) => matchesQuery(loc, searchTo));
  }, [searchTo, routeOptions]);

  const swapPoints = () => {
    const nf = to;
    const nt = from;
    setFrom(nf);
    setTo(nt);
    setSearchFrom(nf ? nf.name : "");
    setSearchTo(nt ? nt.name : "");
  };

  const handleDrawRoute = () => {
    if (!from || !to) {
      toast.error("Vui lòng chọn điểm đi và điểm đến");
      return;
    }
    clearRoute();
    drawRoute([from.lat, from.lng], [to.lat, to.lng]);
    onRouteStart();
    onClose();
  };

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200000]">
      <div
        className="pointer-events-auto fixed top-[104px] left-4 z-[200001] w-[450px] max-w-screen overflow-visible rounded-2xl border border-gray-200 bg-white text-neutral-950 shadow-2xl [filter:none]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Chỉ đường</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-visible p-5 space-y-5">
          <div className="overflow-visible">
            <div ref={fromComboRef} className="relative overflow-visible">
              <MapPin className="absolute top-1.5 left-3 z-10 h-6 w-6 bg-white text-green-600" />
              <Command
                shouldFilter={false}
                className="relative overflow-visible rounded-lg bg-white text-neutral-950 opacity-100 [filter:none]"
              >
                <CommandInput
                  placeholder="Nhập điểm xuất phát..."
                  value={searchFrom}
                  onValueChange={(v) => {
                    setSearchFrom(v);
                    setOpenFrom(true);
                    if (from && v !== from.name) {
                      setFrom(null);
                    }
                  }}
                  onFocus={() => setOpenFrom(true)}
                  className="h-12 pb-2 pl-4 text-base font-medium text-neutral-950 placeholder:text-neutral-500"
                />
                {openFrom && (
                  <CommandList className="absolute top-full right-0 left-0 z-[100020] mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white text-neutral-950 opacity-100 shadow-xl [filter:none] [backdrop-filter:none] [transform:translateZ(0)]">
                    <CommandGroup heading="Gợi ý" className="text-neutral-950">
                      {filteredFrom.length === 0 ? (
                        <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
                      ) : (
                        filteredFrom.map((loc) => (
                          <CommandItem
                            key={loc.id || `loc-${loc.lat}-${loc.lng}`}
                            value={`${loc.name}-${loc.lat}-${loc.lng}`}
                            onSelect={() => {
                              setFrom(loc);
                              setSearchFrom(loc.name);
                              setOpenFrom(false);
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4 shrink-0 text-green-600" />
                            <div>
                              <div className="font-medium text-neutral-950">{loc.name}</div>
                              {loc.description && (
                                <div className="text-xs text-neutral-600">{String(loc.description)}</div>
                              )}
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>
          </div>

          <div className="flex justify-center -my-1 cursor-pointer">
            <button
              type="button"
              onClick={swapPoints}
              className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 bg-gray-100"
            >
              <ArrowUpDown className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="overflow-visible">
            <div ref={toComboRef} className="relative overflow-visible">
              <MapPin className="absolute top-1.5 left-3 z-10 h-6 w-6 bg-white text-red-600" />
              <Command
                shouldFilter={false}
                className="relative overflow-visible rounded-lg bg-white text-neutral-950 opacity-100 [filter:none]"
              >
                <CommandInput
                  placeholder="Nhập điểm đến..."
                  value={searchTo}
                  onValueChange={(v) => {
                    setSearchTo(v);
                    setOpenTo(true);
                    if (to && v !== to.name) {
                      setTo(null);
                    }
                  }}
                  onFocus={() => setOpenTo(true)}
                  className="h-12 pb-2 pl-4 text-base font-medium text-neutral-950 placeholder:text-neutral-500"
                />
                {openTo && (
                  <CommandList className="absolute top-full right-0 left-0 z-[100020] mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white text-neutral-950 opacity-100 shadow-xl [filter:none] [backdrop-filter:none] [transform:translateZ(0)]">
                    <CommandGroup heading="Gợi ý" className="text-neutral-950">
                      {filteredTo.length === 0 ? (
                        <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
                      ) : (
                        filteredTo.map((loc) => (
                          <CommandItem
                            key={loc.id || `loc-${loc.lat}-${loc.lng}`}
                            value={`${loc.name}-${loc.lat}-${loc.lng}`}
                            onSelect={() => {
                              setTo(loc);
                              setSearchTo(loc.name);
                              setOpenTo(false);
                            }}
                          >
                            <MapPin className="mr-2 h-4 w-4 shrink-0 text-red-600" />
                            <div>
                              <div className="font-medium text-neutral-950">{loc.name}</div>
                              {loc.description && (
                                <div className="text-xs text-neutral-600">{String(loc.description)}</div>
                              )}
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>
          </div>

          <Button
            onClick={handleDrawRoute}
            disabled={!from || !to}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {from && to ? "Xem đường đi" : "Chọn điểm đi và đến"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
