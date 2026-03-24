"use client";

import { Button } from "@/components/ui/button";
import { X, Navigation, Share2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Location } from "@/types";
import { useDrawRoute } from "@/hooks/useDrawRoute";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  location: Location;
  locations?: Location[];
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

export default function MapLocationDetailSidebar({
  location,
  locations = [],
  mapUserCoords = null,
  onRouteStart,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(location.image_url) && location.image_url.length > 0 ? location.image_url : null;

  const userLocation = useUserLocation();
  const { drawRoute, clearRoute } = useDrawRoute();

  const [from, setFrom] = useState<Location | null>(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [openFrom, setOpenFrom] = useState(false);
  const fromComboRef = useRef<HTMLDivElement>(null);

  const isNamedLocation = !!location.id && location.id !== "temp";

  const locationKey = location.id ?? `${location.lat}-${location.lng}`;

  const routeOptions = useMemo(() => {
    const opts: Location[] = [];
    const seen = new Set<string>();
    const add = (loc: Location) => {
      const k = String(loc.id ?? `${loc.lat}-${loc.lng}`);
      if (seen.has(k)) return;
      seen.add(k);
      opts.push(loc);
    };
    const coords = userLocation ?? mapUserCoords;
    if (coords) {
      add(makeCurrentLocationOption(coords[0], coords[1]));
    }
    for (const loc of locations) {
      if (location.id && loc.id === location.id) continue;
      if (
        !location.id &&
        Math.abs(loc.lat - location.lat) < 1e-5 &&
        Math.abs(loc.lng - location.lng) < 1e-5
      ) {
        continue;
      }
      add(loc);
    }
    return opts;
  }, [userLocation, mapUserCoords, locations, location]);

  useEffect(() => {
    setFrom(null);
    setSearchFrom("");
    setOpenFrom(false);
  }, [locationKey]);

  useEffect(() => {
    if (!openFrom) return;
    const onPointerDown = (e: PointerEvent) => {
      if (fromComboRef.current?.contains(e.target as Node)) return;
      setOpenFrom(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [openFrom]);

  const filteredFrom = useMemo(() => {
    return routeOptions.filter((loc) => matchesQuery(loc, searchFrom));
  }, [searchFrom, routeOptions]);

  const handleDirections = () => {
    if (!from) {
      toast.error("Vui lòng chọn điểm đi");
      return;
    }

    clearRoute();
    drawRoute([from.lat, from.lng], [location.lat, location.lng]);

    toast.success("Đường đi đã được vẽ!", {
      description: `${from.name} → ${location.name || "Điểm đến"}`,
    });

    onRouteStart();

    if (globalThis.matchMedia?.("(max-width: 767px)").matches) {
      onClose();
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/?lat=${location.lat}&lng=${location.lng}&name=${encodeURIComponent(location.name || "Điểm trên bản đồ")}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã sao chép link!");
  };

  const nextImage = () => images && setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => images && setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  if (!mounted) {
    return null;
  }

  if (!isNamedLocation) {
    return createPortal(
      <div className="fixed inset-y-0 left-0 z-[200000] flex w-[450px] max-w-screen flex-col overflow-visible bg-white text-neutral-950 shadow-2xl [filter:none]">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Điểm trên bản đồ</h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500">Tọa độ</p>
            <p className="font-mono text-sm bg-gray-100 px-4 py-3 rounded-lg mt-2">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-lg font-semibold mb-4">Chia sẻ vị trí này</p>
            <Button onClick={handleShare} className="w-full" variant="outline">
              <Share2 className="w-5 h-5 mr-3" />
              Sao chép link vị trí
            </Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-y-0 left-0 z-[200000] flex w-[450px] max-w-screen flex-col overflow-visible bg-white text-neutral-950 shadow-2xl [filter:none]">
      <div className="flex items-center justify-center gap-3 border-b p-4">
        <div className="min-w-0 flex-1">
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h2 className="line-clamp-1 cursor-default pr-1 text-left text-2xl font-bold text-neutral-950">
                  {location.name}
                </h2>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="border-neutral-200">
                <p className="max-w-xs whitespace-pre-wrap break-words text-neutral-950">
                  {location.name}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-3 hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative h-64 bg-gray-100 overflow-hidden">
        {images ? (
          <>
            <Image src={images[currentImageIndex]} alt={location.name} fill className="object-cover" priority />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 rounded-full text-white">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="relative h-full bg-gray-50">
            <Image
              src="/file.svg"
              alt="Location placeholder"
              fill
              className="object-contain p-12 opacity-80"
            />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-7">

          {location.description && (
            <div>
              <p className="text-sm text-gray-500">Mô tả</p>
              <p className="mt-2 text-gray-700">{location.description}</p>
            </div>
          )}

          {location.category && (
            <div>
              <p className="text-sm text-gray-500">Loại địa điểm</p>
              <span className="inline-block mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {location.category.name}
              </span>
            </div>
          )}
        </div>

        <div className="relative z-[200051] shrink-0 border-t bg-white px-6 py-4">
          <p className="font-semibold text-lg mb-4">Chỉ đường</p>

          <div
            ref={fromComboRef}
            className="relative z-0 flex gap-3 items-center overflow-visible"
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <Command
              shouldFilter={false}
              className="relative min-w-0 flex-1 overflow-visible rounded-lg bg-white text-neutral-950 opacity-100 [filter:none]"
            >
              <CommandInput
                hideSearchIcon
                wrapperClassName="!border-0 h-12 min-h-12 px-0 gap-0"
                placeholder="Điểm xuất phát…"
                value={searchFrom}
                onValueChange={(v) => {
                  setSearchFrom(v);
                  setOpenFrom(true);
                  if (from && v !== from.name) {
                    setFrom(null);
                  }
                }}
                onFocus={() => setOpenFrom(true)}
                className="h-12 text-neutral-950 placeholder:text-neutral-500"
              />
              {openFrom && (
                <CommandList className="absolute top-full right-0 left-0 z-[100020] mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white text-neutral-950 opacity-100 shadow-xl [filter:none] [backdrop-filter:none] [transform:translateZ(0)]">
                  <CommandGroup className="text-neutral-950">
                    {filteredFrom.length === 0 ? (
                      <CommandEmpty>Không tìm thấy</CommandEmpty>
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
                          <MapPin className="mr-2 h-4 w-4 shrink-0 text-gray-600" />
                          <span
                            className={
                              loc.id === "current-location"
                                ? "font-medium text-green-700"
                                : "text-neutral-950"
                            }
                          >
                            {loc.name}
                          </span>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>
          </div>

          <div className="mt-4 flex gap-3 items-center">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <MapPin className="h-5 w-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Điểm đến</p>
              <p className="truncate font-medium">{location.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[200050] space-y-3 bg-white p-6">
        <Button
          onClick={handleDirections}
          disabled={!from}
          className="h-14 w-full text-lg font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:pointer-events-none disabled:!opacity-100 disabled:bg-blue-400 disabled:text-white disabled:shadow-none disabled:saturate-75"
        >
          <Navigation className="mr-3 h-5 w-5" />
          Bắt đầu chỉ đường
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          className="h-12 w-full border-2 border-neutral-800 bg-white text-base font-semibold text-neutral-900 shadow-sm hover:bg-neutral-50 hover:text-neutral-950"
        >
          <Share2 className="mr-3 h-5 w-5" />
          Chia sẻ vị trí
        </Button>
      </div>
    </div>,
    document.body
  );
}
